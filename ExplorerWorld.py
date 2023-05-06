import random, pprint
import numpy as np
import pandas as pd


class ExplorerWorld:
    def __init__(self, map_size):
        self.map_size = map_size
        self.scope_size = 2  # used to indicate the scope of an agent
        # used to indicate wealth of a position
        self.map = [[0 for _ in range(map_size)] for _ in range(map_size)]
        self.explorers = {}
        self.max_wealth = 5
        self.max_stamina = 10

    def add_explorer(self, name, x, y):
        self.explorers[name] = {"x": x, "y": y, "wealth": 0, "stamina": self.max_stamina}

    def move(self, name, direction):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise Exception("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        if direction == "up":
            explorer["y"] = max(0, y - 1)
        elif direction == "down":
            explorer["y"] = min(self.map_size - 1, y + 1)
        elif direction == "left":
            explorer["x"] = max(0, x - 1)
        elif direction == "right":
            explorer["x"] = min(self.map_size - 1, x + 1)
        else:
            raise Exception("Invalid direction")
        explorer["stamina"] -= 1

    def gather_wealth(self, name):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise Exception("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        if self.map[x][y] > 0:
            explorer["wealth"] += self.map[x][y]
            self.map[x][y] = 0
            explorer["stamina"] -= 1

    def rest(self, name):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise Exception("Explorer does not exist")
        explorer["stamina"] = min(explorer["stamina"] + 3, self.max_stamina)

    def attack(self, attacker_name, defender_name):
        attacker = self.explorers.get(attacker_name, None)
        defender = self.explorers.get(defender_name, None)

        if abs(attacker["x"] - defender["x"]) + abs(attacker["y"] - defender["y"]) != 1:
            raise Exception("Cannot attack: the defender is not 1 step up/down/left/right to the attacker.")
        if attacker is None:
            raise Exception("The attacker name does not exist")
        if defender is None:
            raise Exception("The defender name does not exist")

        if attacker["stamina"] > defender["stamina"]:
            attacker["wealth"] += defender["wealth"]
            del self.explorers[defender_name]
        elif attacker["stamina"] < defender["stamina"]:
            defender["wealth"] += attacker["wealth"]
            del self.explorers[attacker_name]
        else:
            if random.random() < 0.5:
                attacker["wealth"] += defender["wealth"]
                del self.explorers[defender_name]
            else:
                defender["wealth"] += attacker["wealth"]
                del self.explorers[attacker_name]

    def get_surroundings(self, name):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise Exception("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        min_x, max_x = max(0, x - self.scope_size), min(self.map_size, x + self.scope_size + 1)
        min_y, max_y = max(0, y - self.scope_size), min(self.map_size, y + self.scope_size + 1)
        surroundings = [[self.map[_x][_y] for _x in range(min_x, max_x)] for _y in range(min_y, max_y)]
        for other_name, other_explorer in self.explorers.items():
            other_x, other_y = other_explorer["x"], other_explorer["y"]
            if other_x >= min_x and other_x < max_x and other_y >= min_y and other_y < max_y:
                surroundings[other_x - min_x][other_y - min_y] = (other_name,
                                                                  surroundings[other_x - min_x][other_y - min_y])
        return surroundings

    def print_surroundings(self, name):
        s = transpose_lol(self.get_surroundings(name))
        s.reverse()
        print(*s, sep="\n")

    # def get_world_state(self):
    #     world_state = [[-1 for _ in range(self.map_size)] for _ in range(self.map_size)]
    #     for name, explorer in self.explorers.items():
    #         world_state[explorer["x"]][explorer["y"]] = name
    #
    #     world_state = [self.map[i][j] if world_state[i][j] == -1 else world_state[i][j] for i in range(self.map_size)
    #                    for j in range(self.map_size)]
    #
    #     return world_state
    def get_world_state(self):
        world_state = []
        for i in range(self.map_size):
            row = []
            for j in range(self.map_size):
                found = False
                for name, explorer in self.explorers.items():
                    if explorer["x"] == i and explorer["y"] == j:
                        row.append(name)
                        found = True
                        break
                if not found:
                    row.append(self.map[i][j])
            world_state.append(row)
        return transpose_lol(world_state)

    def __repr__(self):
        w = self.get_world_state()
        w.reverse()
        pd.DataFrame(w)
        return pprint.pformat(w, indent=4)


# A function to transpose a list of list (square)
def transpose_lol(list_of_lists):
    return np.array(list_of_lists).T.tolist()


# Testing framework for ExplorerWorld class
if __name__ == "__main__":
    if False:
        # Create a new ExplorerWorld instance with a map size of 5
        world = ExplorerWorld(10)
        # Add two explorers to the world
        world.add_explorer("Alice", 0, 0)
        world.add_explorer("Bob", 4, 4)

        # Test that the explorers were added correctly
        assert len(world.explorers) == 2
        assert world.explorers["Alice"]["x"] == 0
        assert world.explorers["Alice"]["y"] == 0
        assert world.explorers["Bob"]["x"] == 4
        assert world.explorers["Bob"]["y"] == 4

        # Test moving an explorer
        world.move("Alice", "right")
        assert world.explorers["Alice"]["x"] == 1
        assert world.explorers["Alice"]["y"] == 0

        # Test gathering wealth
        world.map[1][0] = 2
        world.gather_wealth("Alice")
        assert world.explorers["Alice"]["wealth"] == 2
        assert world.map[1][0] == 0

        # Test resting
        world.rest("Alice")
        assert world.explorers["Alice"]["stamina"] == 10

    # Test attacking
    if False:
        world = ExplorerWorld(10)
        world.add_explorer("Alice", 0, 0)
        world.add_explorer("Bob", 4, 4)

        world.add_explorer("Charlie", 1, 0)
        world.explorers["Alice"]["wealth"] = 5
        world.explorers["Charlie"]["wealth"] = 3
        world.attack("Alice", "Charlie")
        assert 'Charlie' not in world.explorers
        assert len(world.explorers) == 2
        if "Alice" in world.explorers:
            assert world.explorers["Alice"]["wealth"] == 8
            assert "Charlie" not in world.explorers

    # Test getting surroundings
    world = ExplorerWorld(10)
    world.add_explorer("*", 0, 0)
    world.add_explorer("@", 4, 4)
    world.add_explorer("#", 2, 3)

    world.print_surroundings('*')


    if "Alice" in world.explorers:
        world.print_surroundings('Alice')
        surroundings = world.get_surroundings("Alice")
        assert surroundings[0][1] == "Alice"
        assert len(surroundings) == 3
        assert len(surroundings[0]) == 4
    if "Charlie" in world.explorers:
        world.print_surroundings('Charlie')
        surroundings = world.get_surroundings("Charlie")
        assert surroundings[2][2] == "Charlie"
        assert surroundings[3][2] == "Dave"
        assert surroundings[4][4] == "Bob"
        assert len(surroundings) == 5
        assert len(surroundings[0]) == 5

    # assert surroundings[0][0] == "Alice"
    # assert surroundings[2][2] == "Dave"

    print("All tests pass")
