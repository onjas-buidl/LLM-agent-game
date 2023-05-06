import random


class ExplorerWorld:
    def __init__(self, map_size):
        self.map_size = map_size
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
        if attacker is None or defender is None:
            raise Exception("At least one explorer does not exist")
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
        min_x, max_x = max(0, x - 2), min(self.map_size, x + 3)
        min_y, max_y = max(0, y - 2), min(self.map_size, y + 3)
        surroundings = [[0 for _ in range(min_x, max_x)] for _ in range(min_y, max_y)]
        for other_name, other_explorer in self.explorers.items():
            other_x, other_y = other_explorer["x"], other_explorer["y"]
            if other_x >= min_x and other_x < max_x and other_y >= min_y and other_y < max_y:
                surroundings[other_x - min_x][other_y - min_y] = other_name
        return transpose_lol(surroundings)
        # surroundings = []
        # for i in range(max(0, x - 2), min(self.map_size, x + 3)):
        #     row = []
        #     for j in range(max(0, y - 2), min(self.map_size, y + 3)):
        #         if i == x and j == y:
        #             row.append(name)
        #         else:
        #             found = False
        #             for other_name, other_explorer in self.explorers.items():
        #                 if other_explorer["x"] == i and other_explorer["y"] == j:
        #                     row.append(other_name)
        #                     found = True
        #                     break
        #             if not found:
        #                 row.append(self.map[i][j])
        #     surroundings.append(row)
        # return transpose_lol(surroundings)

    def get_world_state(self):
        world_state = [[-1 for _ in range(self.map_size)] for _ in range(self.map_size)]
        for name, explorer in self.explorers.items():            
            world_state[explorer["x"]][explorer["y"]] = name
        
        world_state = [self.map[i][j] if world_state[i][j] == -1 else world_state[i][j] for i in range(self.map_size) for j in range(self.map_size)]
        
        return world_state
        
        # for i in range(self.map_size):
        #     row = []
        #     for j in range(self.map_size):
        #         found = False
        #         for name, explorer in self.explorers.items():
        #             if explorer["x"] == i and explorer["y"] == j:
        #                 row.append(name)
        #                 found = True
        #                 break
        #         if not found:
        #             row.append(self.map[i][j])
        #     world_state.append(row)
        # return transpose_lol(world_state)


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
    a = world.get_world_state()

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
    world.add_explorer("Charlie", 2, 2)
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
        assert len(surroundings) == 3
        assert len(surroundings[0]) == 4
    if "Charlie" in world.explorers:
        surroundings = world.get_surroundings("Charlie")
        assert surroundings[2][2] == "Charlie"
        assert surroundings[3][2] == "Dave"
        assert surroundings[4][4] == "Bob"
        assert len(surroundings) == 5
        assert len(surroundings[0]) == 5
    
    # assert surroundings[0][0] == "Alice"
    # assert surroundings[2][2] == "Dave"

    print("All tests pass")




