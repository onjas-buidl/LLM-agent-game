import os
import json
import random
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain.schema import SystemMessage, HumanMessage
from langchain.chat_models import ChatOpenAI

class Agent:
    def __init__(self, id, name, principles, max_retry_times=5, chat_model='GPT3.5'):
        self.id = id
        self.name = name
        self.principles = principles
        self.docs = self.get_docs()
        self.message_history = []
        self.max_retry_times = max_retry_times
        self.retry_times = max_retry_times
        self.reset()
        if chat_model == 'GPT3.5':
            self.chat_model = ChatOpenAI(
                temperature=0, openai_api_key=os.environ.get("OPENAI_API_KEY"), max_tokens=1500, request_timeout=360)
        elif chat_model == 'GPT4':
            self.chat_model = ChatOpenAI(
                temperature=0, openai_api_key=os.environ.get("OPENAI_API_KEY"), max_tokens=1500, request_timeout=360,
                model_name="gpt-4")
        elif chat_model == 'Claude':
            from langchain.chat_models import ChatAnthropic
            from langchain.prompts.chat import (
                ChatPromptTemplate,
                SystemMessagePromptTemplate,
                AIMessagePromptTemplate,
                HumanMessagePromptTemplate,
            )
            from langchain.schema import (
                AIMessage,
                HumanMessage,
                SystemMessage
            )
            # os.environ.get("ANTHROPIC_API_KEY")
            self.chat_model = ChatAnthropic(temperature=0, anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"))
        else:
            raise NotImplementedError(
                f"Chat model {chat_model} not implemented.")
        self.instruction = self.get_instruction()
        self.error_message = self.get_error_message()

    def reset(self):
        self.message_history = [
            SystemMessage(content=self.docs),
        ]
        self.retry_times = self.max_retry_times

    def get_docs(self):
        return """
        You are an explorer roaming in a 2D grid-based world. Based on the principles, the game rules, and the current game state, strictly output one action and a short comment each round in the specified format.
        **Rules you need to follow**:
        1. You have stamina and wealth. If your stamina goes to 0, you die.
        2. Each round, you can choose one of the following actions:
            2.1 Move: move up, down, left, right, for 1 step. No diagonal move. This action consumes 1 stamina.
            2.2 Gather: gather wealth if the location you are at has wealth resource. This action consumes 1 stamina and depletes the wealth resource.
            2.3 Rest: increase stamina by 3.
            2.4 Attack: you can choose to attack other explorer. Whoever has a higher stamina wins, and gets all wealth of the loser. The loser dies.  
        3. You should follow your current principles to decide your action.
        """

    def get_instruction(self):
        response_schemas = [
            ResponseSchema(name="Motivation",
                           description="This is the motivation and thought process behind the action."),
            ResponseSchema(name="Action",
                           description="Select one action from allowed actions."),
        ]

        # How you would like to parse your output
        output_parser = StructuredOutputParser.from_response_schemas(
            response_schemas)
        # See the prompt template you created for formatting
        format_instructions = output_parser.get_format_instructions()

        mind_template = """
        **Current game situation**:
        You can see things within 2 steps from you. Your surrounding look like this (in Markdown table format): 

        {surroundings}

        Your current stamina: {stamina}
        Your current wealth: {wealth}
        Your current principle: {principle}
        ---
        Based on all information above, give a comment on your thinking process and select one action to perform this round.

        {format_instructions}

        Select one action from allowed actions: {allowed_actions}

        YOUR RESPONSE:
        """

        return ChatPromptTemplate(
            messages=[
                HumanMessagePromptTemplate.from_template(mind_template)
            ],
            input_variables=["surroundings", "stamina", "wealth", "allowed_actions"],
            partial_variables={
                "format_instructions": format_instructions, "principle": self.principles}
        )

    def get_error_message(self):
        error_template = """
                        Unable to perform action {action} because it is not in allowed list.
                        """

        return ChatPromptTemplate(
            messages=[
                HumanMessagePromptTemplate.from_template(error_template)
            ],
            input_variables=["action"]
        )

    # I'm probably not using it, so I'll comment it out.
    def get_self_formatted_surroundings(self, surroundings) -> str:
        """
        This function returns the world context surrounding for the agent, in a specified format.
        """
        lst = surroundings
        n = len(lst)
        m = len(lst[0])
        yourself_pos = (n // 2, m // 2)

        # Iterate over the list of lists and format each element
        result = []
        for i in range(n):
            for j in range(m):
                v_diff = i - yourself_pos[0]
                h_diff = j - yourself_pos[1]
                if lst[i][j] == 'null':
                    continue
                if lst[i][j] == "W":
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
                elif ":" in lst[i][j]:
                    module = lst[i][j].split(":")[0]
                    result.append(
                        "{v_diff} step{v_plural} {v_direction} and {h_diff} step{h_plural} {h_direction}: {module_name}({module_description})".format(
                            v_diff=abs(v_diff),
                            v_plural='' if abs(v_diff) == 1 else 's',
                            v_direction='up' if v_diff < 0 else 'down',
                            h_diff=abs(h_diff),
                            h_plural='' if abs(h_diff) == 1 else 's',
                            h_direction='left' if h_diff < 0 else 'right',
                            module_name=module,
                            module_description=lst[i][j]))
                elif lst[i][j] != "OUT":
                    # if it's explorer & wealth format it as "explorer, wealth"
                    if (i, j) == yourself_pos:
                        result.append(
                            "Your current location: {content} wealth".format(content=lst[i][j][1]))
                    else:
                        result_str = "{v_diff} step{v_plural} {v_direction} and {h_diff} step{h_plural} {h_direction}: {content}".format(
                            v_diff=abs(v_diff),
                            v_plural='' if abs(v_diff) == 1 else 's',
                            v_direction='up' if v_diff < 0 else 'down',
                            h_diff=abs(h_diff),
                            h_plural='' if abs(h_diff) == 1 else 's',
                            h_direction='left' if h_diff < 0 else 'right',
                            content=lst[i][j].replace("W", "").replace("&", "").strip())
                        if "W" in lst[i][j]:
                            result_str += f", and one wealth"
                        result.append(result_str)


        if len(result) > 0:
            result = ["- " + x for x in result]
            return '\n'.join(result)
        else:
            return ''

    def check_response_format(self, response, surroundings, allowed_actions, stamina, wealth):
        try:
            assert 'Motivation' in response.keys() and 'Action' in response.keys(), "Output format is wrong"
        except AssertionError as e:
            if self.retry_times > 0:
                self.retry_times -= 1
                self.message_history.append(HumanMessage(content="The response format is wrong. Please try again."))
                self.take_action(surroundings, allowed_actions, stamina, wealth)
            else:
                print("The response format is wrong, and retry times reached {}. HALT.".format(self.retry_times))
                raise e

        try:
            action_in_category = [x in response['Action'].strip() for x in ["move up", "move down", "move left", "move right",
                                                                    "gather", "rest", "attack up", "attack down",
                                                                    "attack left", "attack right", "attack"]]
            assert any(action_in_category)
        except AssertionError as e:
            if self.retry_times > 0:
                self.retry_times -= 1
                self.message_history.append(HumanMessage(
                    content="The action result is not one of the following action: move up, move down, move left, move right, gather, rest, attack up, attack down, attack left, attack right. Please try again."))
                self.take_action(surroundings, allowed_actions, stamina, wealth)
            else:
                print("The action is not in pre-design categorys, and retry times reached {}. HALT.".format(
                    self.retry_times))
                raise e

    def take_action(self, surroundings, allowed_actions, stamina, wealth):
        # print(f"allowed_actions: {allowed_actions}")
        formmatted_surroundings = self.get_self_formatted_surroundings(surroundings)
        _input = self.instruction.format_prompt(
            surroundings=formmatted_surroundings, stamina=stamina, wealth=wealth, allowed_actions=allowed_actions)
        self.message_history.extend(_input.to_messages())

        _output = self.chat_model(self.message_history)
        json_string = _output.content.split("```json")[-1].strip().replace('```', '')
        # print(f"json_string: {json_string}")
        output = json.loads(json_string)
        self.check_response_format(output, surroundings, allowed_actions, stamina, wealth)

        action_parts = output['Action']
        action_parts = action_parts.lower().strip().replace(".", "").strip()
        try:
            print(self.name, "choose to: `", action_parts, "`")
            print("Motivation: ", output['Motivation'])
            print("\n")
            # print(action_parts)
            # print([i.lower for i in allowed_actions])
            if action_parts not in [i.lower() for i in allowed_actions]:
                raise Exception("Action not in allowed list")
            self.reset()
            return action_parts

        # if the output is violates game rules (ew.WorldError will be emitted), feed error message back to chat model
        # and in many cases it's able to perform self-correction
        except Exception as e:
            error_message = e.args[0]
            print("[ERROR] Getting World Error: ", error_message)
            print("[ERROR] Retrying...\n")
            if self.retry_times > 0:
                self.retry_times -= 1
                _error_message = self.error_message.format_prompt(action=action_parts)
                self.message_history.extend(_error_message.to_messages())
                self.take_action(surroundings, allowed_actions, stamina, wealth)
            else:
                print("HALT due to retry times reached {}.".format(self.retry_times))
                raise e