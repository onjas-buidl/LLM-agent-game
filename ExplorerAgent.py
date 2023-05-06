import openai
import ExplorerWorld as ew

class ExplorerAgent:
    def __init__(self, name, world):
        self.name = name
        self.world = world

    def get_action_and_motivation(self):
        surroundings = self.world.get_surroundings(self.name)
        stamina, wealth = self.world.get_agent_state(self.name)

        message_history = [
            {"role": "system", "content": "You are a belligerent explorer trying to maximize your wealth by attacking and defeating other explorers."},
            {"role": "system", "content": "You can only see things within 2 steps from you. You can move, gather wealth, rest, or attack other explorers. Stamina is consumed with actions."},
            {"role": "user", "content": f"Current surroundings: {surroundings}"},
            {"role": "user", "content": f"Current stamina: {stamina}"},
            {"role": "user", "content": f"Current wealth: {wealth}"}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message_history
        )

        action_motivation = response.choices[0].message.content
        return action_motivation

    def take_action(self):
        action_motivation = self.get_action_and_motivation()
        action, motivation = action_motivation.split("Motivation:")

        action = action.strip().split(": ")[1]
        action_parts = action.split()

        if action_parts[0] == "Move":
            direction = action_parts[1]
            self.world.move(self.name, direction)
        elif action_parts[0] == "Gather":
            self.world.gather(self.name)
        elif action_parts[0] == "Rest":
            self.world.rest(self.name)
        elif action_parts[0] == "Attack":
            direction = action_parts[1]
            target_name = self.world.get_explorer_name_by_direction(self.name, direction)
            if target_name:
                self.world.attack(self.name, target_name)

if __name__ == "__main__":

    # Tests for ExplorerAgent class
    # Create a world and add two explorers
    world = ew.ExplorerWorld(5)
    world.add_explorer("Explorer1", 2, 2)
    world.add_explorer("Explorer2", 4, 4)

    # Create two ExplorerAgent instances
    explorer1 = ExplorerAgent("Explorer1", world)
    explorer2 = ExplorerAgent("Explorer2", world)

    # Test get_action_and_motivation method
    action_motivation = explorer1.get_action_and_motivation()
    assert isinstance(action_motivation, str)

    # Test take_action method for Move action
    explorer1.take_action()  # Move action
    assert world.get_explorer_location("Explorer1") == (1, 2)

    # Test take_action method for Gather action
    world.add_wealth_resource(2, 2, 5)
    explorer1.take_action()  # Gather action
    assert world.get_agent_state("Explorer1")[1] == 5
    assert world.get_wealth_resource(2, 2) == 0

    # Test take_action method for Rest action
    world.move("Explorer1", "down")
    explorer1.take_action()  # Rest action
    assert world.get_agent_state("Explorer1")[0] == 8

    # Test take_action method for Attack action
    world.move("Explorer1", "right")
    explorer1.take_action()  # Attack action
    assert world.get_agent_state("Explorer1")[1] > 0 or world.get_agent_state("Explorer2")[1] > 0





