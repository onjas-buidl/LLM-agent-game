import openai
import ExplorerWorld as ew

class ExplorerAgent:
    def __init__(self, name):
        self.name = name

    def get_action_and_motivation(self, world):
        surroundings = world.get_surroundings(self.name)
        stamina, wealth = world.get_agent_state(self.name)

        message_history = [{"role": "system", "content": "You are an explorer roaming in a 2D grid-based world. Based on the principles, the game rules, and the current game state, strictly output one action and a short comment each round, nothing else."},
              {"role": "user", "content": """**Rules you need to follow**:
1. You have stamina and wealth. If your stamina goes to 0, you die.
2. Each round, you can choose one of the following actions:
    1.1 Move: move up, down, left, right, for 1 step. No diagonal move. This action consumes 1 stamina.
    1.2 Gather: gather wealth if the location you are at has wealth resource. This action consumes 1 stamina and depletes the wealth resource.
    1.3 Rest: increase stamina by 3.
    1.4 Attack: you can choose to attack other explorer. Whoever has a higher stamina wins, and gets all wealth of the loser. The loser dies.  
3. Principles
		2.1 You are a belligerent person that wants to maximize your wealth by attacking and defeating other explorers. 

**Current game situation**:
You can see things within 2 steps from you. Your surrounding look like this (in Markdown table format): 

|  | wealth |  |  |  |
|  |  | wealth |  |  |
|  |  | You |  |  |
|  |  |  | explorer 1 |  |
| explorer 2 |  |  |  |  |

Your current stamina: {stamina}
Your current wealth: {wealth}

---

Based on the game rules, your principles and the current game state, select one action to perform this round and give a short comment on the motivation. 

Please output the action and motivation in the following format: 

Action: {Move up/down/left/right, gather, rest, attack up/down/left/right}
Motivation:""".format(stamina=stamina, wealth=wealth)}]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message_history,
            temperature=0.1
        )

        action_motivation = response.choices[0].message.content
        return action_motivation

    def format_surroundings(surroundings):
        pass

    def take_action(self, world):
        action_motivation = self.get_action_and_motivation()
        action, motivation = action_motivation.split("Motivation:")

        # action = action.strip().split(": ")[1]
        # action_parts = action.split()
        action_parts = action.strip().split(": ")[1].split()

        if action_parts[0] == "Move":
            direction = action_parts[1]
            world.move(self.name, direction)
        elif action_parts[0] == "Gather":
            world.gather(self.name)
        elif action_parts[0] == "Rest":
            world.rest(self.name)
        elif action_parts[0] == "Attack":
            direction = action_parts[1]
            target_name = world.get_explorer_name_by_direction(self.name, direction)
            if target_name:
                world.attack(self.name, target_name)

if __name__ == "__main__":

    # Tests for ExplorerAgent class
    # Create a world and add two explorers
    world = ew.ExplorerWorld(5)
    world.add_explorer("Explorer1", 2, 2)
    world.add_explorer("Explorer2", 4, 4)

    # Create two ExplorerAgent instances
    explorer1 = ExplorerAgent("Explorer1")
    explorer2 = ExplorerAgent("Explorer2")

    # Test get_action_and_motivation method
    action_motivation = explorer1.get_action_and_motivation(world)
    assert isinstance(action_motivation, str)

    # Test take_action method for Move action
    explorer1.take_action(world)  # Move action
    assert world.get_explorer_location("Explorer1") == (1, 2)

    # Test take_action method for Gather action
    world.add_wealth_resource(2, 2, 5)
    explorer1.take_action(world)  # Gather action
    assert world.get_agent_state("Explorer1")[1] == 5
    assert world.get_wealth_resource(2, 2) == 0

    # Test take_action method for Rest action
    world.move("Explorer1", "down")
    explorer1.take_action(world)  # Rest action
    assert world.get_agent_state("Explorer1")[0] == 8

    # Test take_action method for Attack action
    world.move("Explorer1", "right")
    explorer1.take_action(world)  # Attack action
    assert world.get_agent_state("Explorer1")[1] > 0 or world.get_agent_state("Explorer2")[1] > 0




[0, 0, 0]
[0, 0, 0]
[0, 0, 0]
[0, ('Charlie', 0), 0]
