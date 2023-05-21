// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./Igameplay.sol";

contract GamePlay is IGameplayContract {
    address public contractOwner;

    constructor() {
        contractOwner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == contractOwner,
            "Only contract owner can call this function"
        );
        _;
    }

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        contractOwner = newOwner;
    }

    // Game States
    struct Explorer {
        string name;
        uint256 x;
        uint256 y;
        uint256 stamina;
        uint256 wealth;
    }

    string[][] private worldMap;
    mapping(string => Explorer) public explorers;

    mapping(uint256 => mapping(uint256 => address)) public ugcContract;

    function randomInitializeMap(uint256 size, uint256 wealthCount)
        external
        onlyOwner
    {
        // Initialize the world map with "null" values
        worldMap = new string[][](size);
        for (uint256 i = 0; i < size; i++) {
            worldMap[i] = new string[](size);
            for (uint256 j = 0; j < size; j++) {
                worldMap[i][j] = "null";
            }
        }

        // Randomly distribute wealth
        uint256 count = 0;
        while (count < wealthCount) {
            uint256 x = randomCoordinate(size);
            uint256 y = randomCoordinate(size);

            // Check if the cell is already assigned a wealth
            if (compareStrings(worldMap[x][y], "null")) {
                worldMap[x][y] = "W";
                count++;
            }
        }

        // TODO: How to make it composable? eg. set certain cells teleport module
    }

    // deploy UGC contract
    function deployContract(
        uint256 x,
        uint256 y,
        address contractAddress
    ) external onlyOwner {
        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid x coordinate");
        // require(ugcContract[x][y], "Cell already occupied");

        // TODO: check if address exists

        // Deploy the contract
        ugcContract[x][y] = contractAddress;
    }

    function addExplorer(
        string memory name,
        uint16 x,
        uint16 y,
        uint16 stamina,
        uint16 wealth
    ) external onlyOwner {
        // Add the explorer to the explorers mapping
        explorers[name] = Explorer(name, x, y, stamina, wealth);

        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid x coordinate");

        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(worldMap[x][y], "null") ||
                compareStrings(worldMap[x][y], "W"),
            "Position occupied"
        );

        // Set the cell value to the agent's name
        worldMap[x][y] = name;
    }

    function move(string memory name, string memory direction) 
        external 
        onlyOwner 
    {
        require(bytes(explorers[name].name).length != 0, "Explorer not found");
        require(explorers[name].stamina > 0, "Explorer died");
        
        uint256 x = explorers[name].x;
        uint256 y = explorers[name].y;
        
        // Calculate the new position based on the specified direction
        if (compareStrings(direction, "up")) {
            require(y > 0, "Invalid move");
            y--;
        } else if (compareStrings(direction, "down")) {
            require(y < worldMap.length - 1, "Invalid move");
            y++;
        } else if (compareStrings(direction, "left")) {
            require(x > 0, "Invalid move");
            x--;
        } else if (compareStrings(direction, "right")) {
            require(x < worldMap.length - 1, "Invalid move");
            x++;
        } else {
            revert("Invalid direction");
        }
        setLocation(name, x, y);

        // Decrease stamina by 1
        uint stamina = explorers[name].stamina;
        explorers[name].stamina = stamina - 1;
    }

    function gatherWealth(string memory name) external onlyOwner {
        require(bytes(explorers[name].name).length != 0, "Explorer not found");
        require(explorers[name].stamina > 0, "Explorer died");

        uint256 x = explorers[name].x;
        uint256 y = explorers[name].y;

        // Check if the explorer is on a cell with wealth
        require(compareStrings(worldMap[x][y], "W"), "No wealth at current position");

        // Increment the explorer's wealth
        explorers[name].wealth++;

        // Decrease stamina by 1
        uint stamina = explorers[name].stamina;
        explorers[name].stamina = stamina - 1;

        // Set the cell value back to "null"
        worldMap[x][y] = "null";
    }

    function rest(string memory name) external onlyOwner {
        require(bytes(explorers[name].name).length != 0, "Explorer not found");
        require(explorers[name].stamina > 0, "Explorer died");
        explorers[name].stamina += 3;
    }

    function attack(string memory attackerName, string memory defenderName)
        external
        onlyOwner
    {
        require(bytes(explorers[attackerName].name).length != 0, "Explorer not found");
        require(explorers[attackerName].stamina > 0, "Explorer died");
        require(bytes(explorers[defenderName].name).length != 0, "Explorer not found");
        require(explorers[defenderName].stamina > 0, "Explorer died");

        // Check if the attack valid - problem what if there are two players you can attack?
        require(bytes(explorers[attackerName].name).length != 0, "Attacker not found");
        require(bytes(explorers[defenderName].name).length != 0, "Defender not found");

        // Calculate the attack success chance (50% chance)
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;
        bool attackSuccessful = random < 50;

        if (attackSuccessful) {
            // Attacker successfully defeats the defender and gains their wealth
            explorers[attackerName].wealth += explorers[defenderName].wealth;
            explorers[defenderName].wealth = 0;
            explorers[defenderName].stamina = 0;
        }
        else {
            // Attacker fails, lose all wealth, and die
            explorers[defenderName].wealth += explorers[attackerName].wealth;
            explorers[attackerName].stamina = 0;
            explorers[attackerName].wealth = 0;
        }
    }

    function getSurroundings(string memory name) external view returns (string[][] memory) {
        require(bytes(explorers[name].name).length != 0, "Explorer not found");
        
        uint256 x = explorers[name].x;
        uint256 y = explorers[name].y;
        uint256 size = worldMap.length;
        
        // size of the surroundings (3x3 grid) - Visible scope 2
        uint256 surroundingsSize = 3;
        
        // Initialize the surroundings array
        string[][] memory surroundings = new string[][](surroundingsSize);
        for (uint256 i = 0; i < surroundingsSize; i++) {
            surroundings[i] = new string[](surroundingsSize);
        }
        
        // Fill the surroundings array with the values from the world map
        for (uint256 i = 0; i < surroundingsSize; i++) {
            for (uint256 j = 0; j < surroundingsSize; j++) {
                int256 mapX = int256(x) - 1 + int256(i); // Convert to int to avoid underflow
                int256 mapY = int256(y) - 1 + int256(j);
                
                // Check if the map coordinates are within bounds
                if (mapX >= 0 && mapX < int256(size) && mapY >= 0 && mapY < int256(size)) {
                    string memory cellValue = worldMap[uint256(mapX)][uint256(mapY)];
                    surroundings[i][j] = cellValue;
                } else {
                    surroundings[i][j] = ""; // Agents can't see outside the map
                }
            }
        }
        
        return surroundings;
    }

    function getAllowedActions(string memory name) external view returns (string[] memory) {
        require(bytes(explorers[name].name).length != 0, "Explorer not found");
        require(explorers[name].stamina > 0, "Explorer died");
        
        string[] memory allowedActions = new string[](1);
        allowedActions[0] = "rest";
        
        string[] memory dirs = new string[](4);
        dirs[0] = "up";
        dirs[1] = "down";
        dirs[2] = "left";
        dirs[3] = "right";
        
        uint256 x = explorers[name].x;
        uint256 y = explorers[name].y;
        uint256 mapSize = worldMap.length;
        
        for (uint256 i = 0; i < dirs.length; i++) {
            if (compareStrings(dirs[i], "up") && y > 0) { //Problem is how I know if that grid has some composable elements
                allowedActions = appendToArray(allowedActions, "move up");
            }
            if (compareStrings(dirs[i], "down") && y < mapSize - 1) {
                allowedActions = appendToArray(allowedActions, "move down");
            }
            if (compareStrings(dirs[i], "left") && x > 0) {
                allowedActions = appendToArray(allowedActions, "move left");
            }
            if (compareStrings(dirs[i], "right") && x < mapSize - 1) {
                allowedActions = appendToArray(allowedActions, "move right");
            }
        }
        
        if (compareStrings(worldMap[y][x], "W")) {
            allowedActions = appendToArray(allowedActions, "gather");
        }
        
        for (uint256 i = 0; i < explorers.length; i++) {
            string memory others = explorers[i].name;
            if (compareStrings(others, name)) {
                continue;
            }
            
            if (explorers[name].x - explorers[others].x == 1 && explorers[name].y == explorers[others].y) {
                allowedActions = appendToArray(allowedActions, "attack left");
            }
            if (explorers[name].x - explorers[others].x == -1 && explorers[name].y == explorers[others].y) {
                allowedActions = appendToArray(allowedActions, "attack right");
            }
            if (explorers[name].y - explorers[others].y == 1 && explorers[name].x == explorers[others].x) {
                allowedActions = appendToArray(allowedActions, "attack down");
            }
            if (explorers[name].y - explorers[others].y == -1 && explorers[name].x == explorers[others].x) {
                allowedActions = appendToArray(allowedActions, "attack up");
            }
        }
        
        return allowedActions;
    }

    function appendToArray(string[] memory array, string memory element) private pure returns (string[] memory) {
        string[] memory newArray = new string[](array.length + 1);
        for (uint256 i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        newArray[array.length] = element;
        return newArray;
    }


    // getter func for worldMap
    function getWorldState() external view returns (string[][] memory) {
        uint256 size = worldMap.length;
        string[][] memory state = new string[][](size);

        for (uint256 i = 0; i < size; i++) {
            for (uint256 j = 0; j < size; j++) {
                string memory cellValue = worldMap[uint256(i)][uint256(j)];
                state[i][j] = cellValue;
            }
        }
        return state;
    }


    // ---------------------
    // helper funcs

    // Helper function to generate a random coordinate within the map size
    function randomCoordinate(uint256 size) private view returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, size))
            ) % size;
    }

    // Helper func to compare strings
    function compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // ---------------------
    // private setters

    function setLocation(
        string memory agentName,
        uint256 x,
        uint256 y
    ) public {
        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid position");
        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(worldMap[x][y], "null") ||
                compareStrings(worldMap[x][y], "W"),
            "Position occupied"
        );

        explorers[agentName].x = x;
        explorers[agentName].y = y;
    }

    function setStamina(string memory agentName, uint256 stamina) public {
        explorers[agentName].stamina = stamina;
    }

    function getAgent(string memory agentName)
        public
        view
        returns (Explorer memory)
    {
        return explorers[agentName];
    }
}
