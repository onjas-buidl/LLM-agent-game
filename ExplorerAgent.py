import openai
import ExplorerWorld as ew
import logging, os
from logging.handlers import RotatingFileHandler
from datetime import datetime
import random
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
import pandas as pd
import json



# get the absolute path to the current directory
current_directory = os.path.abspath(os.path.dirname(__file__))

# set up logging
timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
log_file_name = f'example_{timestamp}.log'
log_file_path = os.path.join(current_directory, 'logs', log_file_name)
handler = RotatingFileHandler(log_file_path, maxBytes=1024 * 1024, backupCount=1)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logging.getLogger().addHandler(handler)

# log some messages
# logging.debug('This is a debug message')
# logging.info('This is an info message')
# logging.warning('This is a warning message')
# logging.error('This is an error message')
# logging.critical('This is a critical message')


TEST_MODE = True
logging.basicConfig(filename='logs/', level=logging.INFO)


class ExplorerAgent:
    def __init__(self, name, principles):
        self.name = name
        self.principles = principles
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        # Temp = 0 so that we get clean information without a lot of creativity
        self.chat_model = ChatOpenAI(temperature=0, openai_api_key=openai_api_key, max_tokens=1500)

        # How you would like your reponse structured. This is basically a fancy prompt template
        response_schemas = [
            ResponseSchema(name="Motivation",
                           description="This is the motivation and thought process behind the action."),
            ResponseSchema(name="Action",
                           description="Select one of the following action: move up, move down, move left, move right, gather, rest, attack up, attack down, attack left, attack right"),
        ]

        # How you would like to parse your output
        output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
        # See the prompt template you created for formatting
        format_instructions = output_parser.get_format_instructions()

        mind_template = """
        You are an explorer roaming in a 2D grid-based world. Based on the principles, the game rules, and the current game state, strictly output one action and a short comment each round in the specified format.
        **Rules you need to follow**:
        1. You have stamina and wealth. If your stamina goes to 0, you die.
        2. Each round, you can choose one of the following actions:
            2.1 Move: move up, down, left, right, for 1 step. No diagonal move. This action consumes 1 stamina.
            2.2 Gather: gather wealth if the location you are at has wealth resource. This action consumes 1 stamina and depletes the wealth resource.
            2.3 Rest: increase stamina by 3.
            2.4 Attack: you can choose to attack other explorer. Whoever has a higher stamina wins, and gets all wealth of the loser. The loser dies.  
        3. You should follow the principles to decide your action.
        	3.1 {principle} 

        **Current game situation**:
        You can see things within 2 steps from you. Your surrounding look like this (in Markdown table format): 

        {surroundings}

        Your current stamina: {stamina}
        Your current wealth: {wealth}

        ---
        Based on all information above, give a comment on your thinking process and select one action to perform this round.

        {format_instructions}

        YOUR RESPONSE:
        """

        self.prompt = ChatPromptTemplate(
            messages=[
                HumanMessagePromptTemplate.from_template(mind_template)
            ],
            input_variables=["surroundings", "stamina", "wealth"],
            partial_variables={"format_instructions": format_instructions, "principle": principles}
        )



    def get_self_formatted_surroundings(self, world) -> str:
        lst = world.get_surroundings(self.name)
        n = len(lst)
        m = len(lst[0])
        yourself_pos = (0, 0)

        # Find the position of "Yourself"
        for i in range(n):
            for j in range(m):
                if lst[i][j] == ('Yourself', 0):
                    yourself_pos = (i, j)
                    break

        # Iterate over the list of lists and format each element
        result = []
        for i in range(n):
            for j in range(m):
                v_diff = i - yourself_pos[0]
                h_diff = j - yourself_pos[1]
                if lst[i][j] == 0:
                    continue
                elif (i, j) == yourself_pos:
                    continue
                elif isinstance(lst[i][j], int):
                    # if it's wealth
                    result.append(
                        "{v_diff} step{v_plural} {v_direction} and {h_diff} step{h_plural} {h_direction}: {content} wealth".format(
                            v_diff=abs(v_diff),
                            v_plural='' if abs(v_diff) == 1 else 's',
                            v_direction='up' if v_diff < 0 else 'down',
                            h_diff=abs(h_diff),
                            h_plural='' if abs(h_diff) == 1 else 's',
                            h_direction='left' if h_diff < 0 else 'right',
                            content=lst[i][j]))
                else:
                    # if it's explorer & wealth format it as "explorer, wealth"
                    result_str = "{v_diff} step{v_plural} {v_direction} and {h_diff} step{h_plural} {h_direction}: {content}".format(
                        v_diff=abs(v_diff),
                        v_plural='' if abs(v_diff) == 1 else 's',
                        v_direction='up' if v_diff < 0 else 'down',
                        h_diff=abs(h_diff),
                        h_plural='' if abs(h_diff) == 1 else 's',
                        h_direction='left' if h_diff < 0 else 'right',
                        content=lst[i][j][0])
                    if lst[i][j][1] > 0:
                        result_str += f", and {lst[i][j][1]} wealth"
                    result.append(result_str)
        # Add the following code between <|END_PREFIX|> and <|START_SUFFIX|>
        if len(result) > 0:
            result = ["- " + x for x in result]
            return '\n'.join(result)
        else:
            return ''


    def take_action(self, world, print_all=True):
        surroundings = self.get_self_formatted_surroundings(world)
        stamina, wealth = world.explorers[self.name]["stamina"], world.explorers[self.name]["wealth"]

        _input = self.prompt.format_prompt(surroundings=surroundings, stamina=stamina, wealth=wealth)

        print(_input.messages)

        _output = self.chat_model(_input.to_messages())

        if "```json" in _output.content:
            json_string = _output.content.split("```json")[1].strip().replace('```', '')
        else:
            json_string = _output.content

        output = json.loads(json_string)
        assert 'Motivation' in output.keys() and 'Action' in output.keys(), "Output format is wrong"
        assert output['Action'] in ["move up", "move down", "move left", "move right", "gather", "rest", "attack up", "attack down", "attack left", "attack right"]
        action_parts = output['Action']
        action_parts = action_parts.lower().strip().replace(".", "")

        if 'move' in action_parts:
            print(action_parts)
            _, direction = action_parts.split(" ")
            world.move(self.name, direction)
        elif 'gather' in action_parts:
            world.gather_wealth(self.name)
        elif 'rest' in action_parts:
            world.rest(self.name)
        elif 'attack' in action_parts:
            _, t = action_parts.split(" ")
            if t in ['up', 'down', 'left', 'right']:
                target_name = world.get_explorer_name_by_direction(self_name=self.name, self_pos=None, direction=t)
                world.attack(self.name, target_name)
            else:
                # if the target is an explorer
                world.attack(self.name, t)

        # if action_parts[0] == "move":
        #     direction = action_parts[1]
        #     world.move(self.name, direction)
        # elif action_parts[0] == "gather":
        #     world.gather(self.name)
        # elif action_parts[0] == "rest":
        #     world.rest(self.name)
        # elif action_parts[0] == "attack":
        #     direction = action_parts[1]
        #     target_name = world.get_explorer_name_by_direction(self.name, direction)
        #     if target_name:
        #         world.attack(self.name, target_name)


if __name__ == "__main__":
    world_size = 7
    world = ew.ExplorerWorld(world_size)
    world.random_initialize_map(wealth_density=0.2)
    # Add two explorers to the world
    world.add_explorer("Alice", 0, 0)
    world.add_explorer("Bob", 2, 2)
    world.add_explorer("Charlie", 4, 4)
    a1 = ExplorerAgent("Alice",
                       'You are a belligerent person that wants to maximize your wealth by attacking and defeating other explorers. You are not afraid of death.')
    a2 = ExplorerAgent("Bob",
                       'You are a peaceful person that wants to maximize your wealth by gathering resources. You are afraid of death.')
    a3 = ExplorerAgent("Charlie",
                       'You are a weird person that does not want to attack or defense. You are afraid of death.')
    
    # for i in range(25):
    # Generate random x and y coordinates for the first point
    x1 = random.randint(0, world_size-1)
    y1 = random.randint(0, world_size-1)
    # Generate random x and y coordinates for the second point
    x2 = random.randint(0, world_size-1)
    y2 = random.randint(0, world_size-1)
    # Generate random x and y coordinates for the third point
    x3 = random.randint(0, world_size-1)
    y3 = random.randint(0, world_size-1)

    # Ensure that all points are distinct
    while (x1, y1) == (x2, y2) or (x1, y1) == (x3, y3) or (x2, y2) == (x3, y3):
        x1 = random.randint(0, 10)
        y1 = random.randint(0, 10)
        x2 = random.randint(0, 10)
        y2 = random.randint(0, 10)
        x3 = random.randint(0, 10)
        y3 = random.randint(0, 10)


    world.explorers["Alice"]['x'] = x1
    world.explorers["Alice"]['y'] = y1
    world.explorers["Bob"]['x'] = x2
    world.explorers["Bob"]['y'] = y2
    world.explorers["Charlie"]['x'] = x3
    world.explorers["Charlie"]['y'] = y3
    print("current world:")
    print(world)
    a1.take_action(world)
    a2.take_action(world)
    a3.take_action(world)

    a1.take_action(world)
    a2.take_action(world)
    a3.take_action(world)

    a1.take_action(world)
    a2.take_action(world)
    a3.take_action(world)

    print('\n'*10)


