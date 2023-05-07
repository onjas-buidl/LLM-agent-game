import openai
import ExplorerWorld as ew
import logging, os
from logging.handlers import RotatingFileHandler
from datetime import datetime

# get the absolute path to the current directory
current_directory = os.path.abspath(os.path.dirname(__file__))

# set up logging
timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
log_file_name = f'example_{timestamp}.log'
log_file_path = os.path.join(current_directory, 'logs', log_file_name)
handler = RotatingFileHandler(log_file_path, maxBytes=1024 * 1024, backupCount=1)
handler.setLevel(logging.DEBUG)
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

    def get_action_and_motivation(self, world, print_all=False):
        surroundings = self.get_self_formatted_surroundings(world)
        stamina, wealth = world.explorers[self.name]["stamina"], world.explorers[self.name]["wealth"]

        message_history = [{"role": "system",
                            "content": "You are an explorer roaming in a 2D grid-based world. Based on the principles, the game rules, and the current game state, strictly output one action and a short comment each round, nothing else."},
                           {"role": "user", "content": """**Rules you need to follow**:
1. You have stamina and wealth. If your stamina goes to 0, you die.
2. Each round, you can choose one of the following actions:
    2.1 Move: move up, down, left, right, for 1 step. No diagonal move. This action consumes 1 stamina.
    2.2 Gather: gather wealth if the location you are at has wealth resource. This action consumes 1 stamina and depletes the wealth resource.
    2.3 Rest: increase stamina by 3.
    2.4 Attack: you can choose to attack other explorer. Whoever has a higher stamina wins, and gets all wealth of the loser. The loser dies.  
3. Principles
	3.1 You are a belligerent person that wants to maximize your wealth by attacking and defeating other explorers. 

**Current game situation**:
You can see things within 2 steps from you. Your surrounding look like this (in Markdown table format): 

{surroundings}

Your current stamina: {stamina}
Your current wealth: {wealth}

---

Based on all information above, give a comment on your thinking process and select one action to perform this round.
Please output the action and motivation in the following format:

Motivation:
Action: [Move up/down/left/right, gather, rest, attack up/down/left/right]

""".format(stamina=stamina, wealth=wealth, surroundings=surroundings)}]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message_history,
            temperature=0.05
        )
        logging.info('CALLED openai.ChatCompletion: {}\n\n\nRESPONSE: \n{}'.format(str(message_history), response))

        action_motivation = response.choices[0].message.content
        if print_all:
            print(message_history)
            print()
            print(action_motivation)
        return action_motivation

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

    def take_action(self, world):
        action_motivation = self.get_action_and_motivation(world)
        motivation, action_parts = action_motivation.split("Action:")
        action_parts = action_parts.lower().strip().replace(".", "")

        if 'move' in action_parts:
            _, direction = action_parts.split(" ")
            world.move(self.name, direction)
        elif 'gather' in action_parts:
            world.gather(self.name)
        elif 'rest' in action_parts:
            world.rest(self.name)
        elif 'attack' in action_parts:
            _, t = action_parts.split(" ")
            if t in ['up', 'down', 'left', 'right']:
                target_name = world.get_explorer_name_by_direction(self_name=self.name, direction=t)
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
    world = ew.ExplorerWorld(10)
    # Add two explorers to the world
    world.add_explorer("Alice", 0, 0)
    world.add_explorer("Bob", 2, 2)

    a1 = ExplorerAgent("Alice",
                       'You are a belligerent person that wants to maximize your wealth by attacking and defeating other explorers. You are not afraid of death.')
    a2 = ExplorerAgent("Bob",
                       'You are a peaceful person that wants to maximize your wealth by gathering resources. You are afraid of death.')
    print(world)
    a1.take_action(world)
    print(world)

