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
        explorer = self.explorers[name]
        x, y = explorer["x"], explorer["y"]
        if direction == "up":
            if y > 0:
                explorer["y"] -= 1
        elif direction == "down":
            if y < self.map_size - 1:
                explorer["y"] += 1
        elif direction == "left":
            if x > 0:
                explorer["x"] -= 1
        elif direction == "right":
            if x < self.map_size - 1:
                explorer["x"] += 1
        explorer["stamina"] -= 1

    def gather(self, name):
        explorer = self.explorers[name]
        x, y = explorer["x"], explorer["y"]
        if self.map[x][y] > 0:
            explorer["wealth"] += self.map[x][y]
            self.map[x][y] = 0
            explorer["stamina"] -= 1

    def rest(self, name):
        explorer = self.explorers[name]
        explorer["stamina"] = min(explorer["stamina"] + 3, self.max_stamina)

    def attack(self, attacker_name, defender_name):
        attacker = self.explorers[attacker_name]
        defender = self.explorers[defender_name]
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
        explorer = self.explorers[name]
        x, y = explorer["x"], explorer["y"]
        surroundings = []
        for i in range(max(0, x - 2), min(self.map_size, x + 3)):
            row = []
            for j in range(max(0, y - 2), min(self.map_size, y + 3)):
                if i == x and j == y:
                    row.append(name)
                else:
                    found = False
                    for other_name, other_explorer in self.explorers.items():
                        if other_explorer["x"] == i and other_explorer["y"] == j:
                            row.append(other_name)
                            found = True
                            break
                    if not found:
                        row.append(self.map[i][j])
            surroundings.append(row)
        return transpose_lol(surroundings)

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
    world.gather("Alice")
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
    assert world.explorers["Alice"]["wealth"] == 8
    assert "Charlie" not in world.explorers

    # Test getting surroundings
    world.add_explorer("Dave", 2, 3)
    surroundings = world.get_surroundings("Alice")
    assert len(surroundings) == 5
    assert len(surroundings[0]) == 5
    assert surroundings[0][0] == "Alice"
    assert surroundings[2][2] == "Dave"

    print("All tests pass")




