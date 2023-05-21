import copy
import random, pprint
import numpy as np
import pandas as pd

class WorldError(Exception):
    """
    Exception raised for errors in the world. To feed back into the chatbot.
    """
    pass

class ExplorerWorld:
    def __init__(self, map_size):
        self.map_size = map_size
        self.scope_size = 2  # used to indicate the scope of an agent
        # used to indicate wealth of a position
        self.map = [[0 for _ in range(map_size)] for _ in range(map_size)]
        self.explorers = {}
        self.max_wealth = 10
        self.max_stamina = 10
    # TODO add check death function decorator to every action that could possibly lead to death

    def random_initialize_map(self, wealth_density=0.1):
        """
        Randomly initialize the map with wealth resources.
        """
        for i in range(self.map_size):
            for j in range(self.map_size):
                if random.random() < wealth_density:
                    self.map[i][j] = 1

    def add_explorer(self, name, x=None, y=None, stamina=None):
        """
        Add an explorer to the world. If x and y are not specified, randomly assign a position to the explorer.
        Automatically check if the position is occupied by another explorer.
        :param name:
        :param x:
        :param y:
        :param stamina:
        :return:
        """
        if x != None and y != None:
            assert x < self.map_size and y < self.map_size
        else:
            x = random.randint(0, self.map_size - 1)
            y = random.randint(0, self.map_size - 1)

        retry, loop_num = True, 0
        while retry and loop_num < 100:
            loop_num += 1
            # check this (x,y) position is not occupied by other explorers, by checking world.explorer dictionary
            for other_explorer in self.explorers.keys():
                if self.explorers[other_explorer]["x"] == x and self.explorers[other_explorer]["y"] == y:
                    print('in')
                    retry = True
                    x = random.randint(0, self.map_size - 1)
                    y = random.randint(0, self.map_size - 1)
                    break
                    # raise WorldError("Cannot add explorer: the position is occupied by another explorer.")
            retry = False
        if loop_num == 100:
            raise WorldError("Cannot add explorer: hard to find a position not occupied by another explorer.")

        self.explorers[name] = {"x": x, "y": y, "wealth": 0, "stamina": self.max_stamina if not stamina else stamina}


    def move(self, name, direction):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise WorldError("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        if direction == "down":
            explorer["y"] = max(0, y - 1)
        elif direction == "up":
            explorer["y"] = min(self.map_size - 1, y + 1)
        elif direction == "left":
            explorer["x"] = max(0, x - 1)
        elif direction == "right":
            explorer["x"] = min(self.map_size - 1, x + 1)
        else:
            raise WorldError("Cannot Move: Invalid direction")
        explorer["stamina"] -= 1


    def gather_wealth(self, name):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise WorldError("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        if self.map[y][x] > 0:
            explorer["wealth"] += self.map[y][x]
            self.map[y][x] = 0
            explorer["stamina"] -= 1
        else:
            raise WorldError("Gather failed: No wealth to gather at your current location.")

    def rest(self, name):
        explorer = self.explorers.get(name, None)
        if explorer is None:
            raise WorldError("Explorer does not exist")
        explorer["stamina"] = min(explorer["stamina"] + 3, self.max_stamina)

    def attack(self, attacker_name, defender_name):
        attacker = self.explorers.get(attacker_name, None)
        defender = self.explorers.get(defender_name, None)

        if abs(attacker["x"] - defender["x"]) + abs(attacker["y"] - defender["y"]) != 1:
            raise WorldError("Cannot attack: the defender is not 1 step up/down/left/right to the attacker.")
        if attacker is None:
            raise WorldError("The attacker name does not exist")
        if defender is None:
            raise WorldError("The defender name does not exist")

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
            raise WorldError("Explorer does not exist")
        x, y = explorer["x"], explorer["y"]
        min_x, max_x = max(0, x - self.scope_size), min(self.map_size, x + self.scope_size + 1)
        min_y, max_y = max(0, y - self.scope_size), min(self.map_size, y + self.scope_size + 1)
        surroundings = [[self.map[_y][_x] for _x in range(min_x, max_x)] for _y in range(min_y, max_y)]
        out_surroundings = copy.deepcopy(surroundings) # create a deep copy of surroundings
        for other_name, other_explorer in self.explorers.items():
            other_x, other_y = other_explorer["x"], other_explorer["y"]
            if other_x >= min_x and other_x < max_x and other_y >= min_y and other_y < max_y:
                if other_name == name:
                    out_surroundings[other_y - min_y][other_x - min_x] = ('Yourself', surroundings[other_y - min_y][other_x - min_x])
                else:
                    out_surroundings[other_y - min_y][other_x - min_x] = (other_name, surroundings[other_y - min_y][other_x - min_x])
        return out_surroundings[::-1]

    def print_surroundings(self, name):
        s = self.get_surroundings(name)
        # s.reverse()
        print(*s, sep="\n")

    def get_allowed_actions(self, name):
        allowed_actions = ['rest']
        
        if self.map[self.explorers[name]['y']][self.explorers[name]['x']] > 0:
            allowed_actions.append("gather")
    
        for others in self.explorers:
            if others != name:
                if self.explorers[name]['x'] - self.explorers[others]['x'] == 1 and self.explorers[name]['y'] == self.explorers[others]['y']:
                    allowed_actions.append("attack left")
                if self.explorers[name]['x'] - self.explorers[others]['x'] == -1 and self.explorers[name]['y'] == self.explorers[others]['y']:
                    allowed_actions.append("attack right")
                if self.explorers[name]['y'] - self.explorers[others]['y'] == 1 and self.explorers[name]['x'] == self.explorers[others]['x']:
                    allowed_actions.append("attack down")
                if self.explorers[name]['y'] - self.explorers[others]['y'] == -1 and self.explorers[name]['x'] == self.explorers[others]['x']:
                    allowed_actions.append("attack up")

        dirs = ['up', 'down', 'left', 'right']
        for dir in dirs:
            if dir == "up" and self.explorers[name]['y'] < self.map_size - 1 and "attack up" not in allowed_actions:
                allowed_actions.append("move up")
            if dir == "down" and self.explorers[name]['y'] > 0 and "attack down" not in allowed_actions:
                allowed_actions.append("move down")
            if dir == "left" and self.explorers[name]['x'] > 0 and "attack left" not in allowed_actions:
                allowed_actions.append("move left")
            if dir == "right" and self.explorers[name]['x'] < self.map_size - 1 and "attack right" not in allowed_actions:
                allowed_actions.append("move right")
                    
        return allowed_actions
                
    def get_explorer_name_by_direction(self, self_name, self_pos, direction) -> str:
        direction = direction.lower()
        assert direction in ["up", "down", "left", "right"], WorldError("Invalid direction")
        if self_pos:
            x, y = self_pos
        elif self_name:
            x, y = self.explorers[self_name]['x'], self.explorers[self_name]['y']
        else:
            raise Exception("Either self_pos or self_name must be provided")

        if direction == "down":
            x_, y_ = x, y - 1
        elif direction == "up":
            x_, y_ = x, y + 1
        elif direction == "left":
            x_, y_ = x - 1, y
        elif direction == "right":
            x_, y_ = x + 1, y

        for explor_name in self.explorers.keys():
            if self.explorers[explor_name]['x'] == x_ and self.explorers[explor_name]['y'] == y_:
                return explor_name

        raise WorldError("There is no explorer at the given direction: {}".format(direction))

    def get_world_state(self):
        world_state = []
        for i in range(self.map_size):
            row = []
            for j in range(self.map_size):
                found = False
                for name, explorer in self.explorers.items():
                    if explorer["x"] == i and explorer["y"] == j:
                        row.append(name + '(' + str(self.map[j][i]) + ')')
                        found = True
                        break
                if not found:
                    row.append('(' + str(self.map[j][i]) + ')')
            world_state.append(row)
        return transpose_lol(world_state)

    def __repr__(self):
        w = self.get_world_state()
        w.reverse()
        w = pd.DataFrame(w)
        idx_list = list(range(self.map_size-1, -1, -1))
        w.index = list(map(lambda s: "|"+str(s)+"|", idx_list))
        w = w.rename(columns=lambda s: "|"+str(s)+"|")
        return pprint.pformat(w, indent=4)


# A function to transpose a list of list (square)
def transpose_lol(square_list):
    # Use the built-in zip function to transpose the list
    transposed_list = list(map(list, zip(*square_list)))
    return transposed_list


# Testing framework for ExplorerWorld class
if __name__ == "__main__":
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
    world = ExplorerWorld(10)
    world.add_explorer("Alice", 0, 0)
    world.add_explorer("Bob", 4, 4)

    world.add_explorer("Charlie", 1, 0)
    world.explorers["Alice"]["wealth"] = 5
    world.explorers["Charlie"]["wealth"] = 3
    world.attack("Alice", "Charlie")
    assert len(world.explorers) == 2
    if "Alice" in world.explorers:
        assert world.explorers["Alice"]["wealth"] == 8
        assert "Charlie" not in world.explorers
    if "Charlie" in world.explorers:
        assert world.explorers["Charlie"]["wealth"] == 8
        assert "Alice" not in world.explorers

    # Test getting surroundings
    world.add_explorer("Dave", 2, 3)
    if "Alice" in world.explorers:
        surroundings = world.get_surroundings("Alice")
        assert surroundings[0][1] == "Alice"
        print(surroundings)
        assert len(surroundings) == 4
        assert len(surroundings[0]) == 3
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

