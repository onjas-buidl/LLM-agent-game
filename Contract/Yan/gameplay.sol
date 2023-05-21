// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./Igameplay.sol";
import {BaseModule} from "./BaseModule.sol";

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
    string[][] private agentMap;
    mapping(string => Explorer) public explorers;
    uint explorersCount = 0;
    Explorer[] public explorersList;

    mapping(uint256 => mapping(uint256 => address)) public ugcContract;

    function randomInitializeMap(uint256 size, uint256 wealthCount)
        external
        onlyOwner
    {
        // Initialize the worldMap and agentMap with "null" values
        worldMap = new string[][](size);
        agentMap = new string[][](size);
        for (uint256 i = 0; i < size; i++) {
            worldMap[i] = new string[](size);
            agentMap[i] = new string[](size);
            for (uint256 j = 0; j < size; j++) {
                worldMap[i][j] = "null";
                agentMap[i][j] = "null";
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
    }

    // deploy UGC contract
    function deployContracts(
        Module[] memory moduleList
    ) external onlyOwner {
        for (uint256 i = 0; i < moduleList.length; i++) {
            address contractAddress = moduleList[i].contractAddress;
            // Check if address exists
            require(isContract(contractAddress), "Invalid contract address");

            uint256 x = moduleList[i].x;
            uint256 y = moduleList[i].y;
            // Check if the provided position is within the map boundaries
            require(x < worldMap.length && y < worldMap.length, "Invalid x coordinate");
            // require(ugcContract[x][y], "Cell already occupied");
            require(compareStrings(worldMap[y][x], "null"), "Cell already occupied");
            
            // Set up the module contract
            ugcContract[y][x] = contractAddress;

            string memory name = moduleList[i].name;
            // string memory description = moduleList[i].description; TODO: how to feed the description into LLM
            // Update the worldMap
            worldMap[y][x] = name;
        }
    }

    function addExplorer(
        string memory name,
        uint256 x,
        uint256 y,
        uint256 stamina,
        uint256 wealth
    ) external onlyOwner {
        // Add the explorer to the explorers mapping
        explorers[name] = Explorer(name, x, y, stamina, wealth);

        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid x coordinate");

        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(worldMap[y][x], "null") ||
                compareStrings(worldMap[y][x], "W"),
            "Position occupied"
        );

        // Set the cell value to the agent's name
        worldMap[y][x] = name;
        agentMap[y][x] = name;
        explorersList.push(explorers[name]);
        explorersCount += 1;
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

        // If step on module - trigger
        if (ugcContract[y][x] != address(0)) {
            // call the module contract to trigger function
            BaseModule module = BaseModule(ugcContract[uint256(y)][uint256(x)]);
            module.trigger(name, worldMap.length);
        }
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
        worldMap[y][x] = "null";
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
        require(bytes(explorers[attackerName].name).length != 0, "Attacker not found");
        require(explorers[attackerName].stamina > 0, "Attacker died");
        require(bytes(explorers[defenderName].name).length != 0, "Deffender not found");
        require(explorers[defenderName].stamina > 0, "Defender already died");

        if (explorers[attackerName].stamina > explorers[defenderName].stamina) {
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
                    // If has modules nearby, give the module description
                    if (ugcContract[uint256(mapX)][uint256(mapY)] != address(0)) {
                        // call the module contract to get the description
                        BaseModule module = BaseModule(ugcContract[uint256(mapX)][uint256(mapY)]);
                        // string memory moduleName = module.getName();
                        string memory moduleDescription = module.getDescription();
                        surroundings[i][j] = moduleDescription;
                    }
                    else {
                        // If no modules nearby, give the world map value
                        string memory cellValue = worldMap[uint256(mapX)][uint256(mapY)];
                        surroundings[i][j] = cellValue;
                    }
                } else {
                    surroundings[i][j] = "null"; // Agents can't see outside the map
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
            if (compareStrings(dirs[i], "up") && y > 0 && compareStrings(agentMap[y - 1][x],"null")) {
                allowedActions = appendToArray(allowedActions, "move up");
            }
            if (compareStrings(dirs[i], "down") && y < mapSize - 1 && compareStrings(agentMap[y + 1][x],"null")) {
                allowedActions = appendToArray(allowedActions, "move down");
            }
            if (compareStrings(dirs[i], "left") && x > 0 && compareStrings(agentMap[y][x - 1],"null")) {
                allowedActions = appendToArray(allowedActions, "move left");
            }
            if (compareStrings(dirs[i], "right") && x < mapSize - 1 && compareStrings(agentMap[y][x + 1],"null")) {
                allowedActions = appendToArray(allowedActions, "move right");
            }
        }
        
        if (compareStrings(worldMap[y][x], "W")) {
            allowedActions = appendToArray(allowedActions, "gather");
        }
        
        for (uint256 i = 0; i < explorersCount; i++) {
            string memory others = explorersList[i].name;
            if (compareStrings(others, name)) {
                continue;
            }
            
            if (explorers[name].x - explorers[others].x == 1 && explorers[name].y == explorers[others].y) {
                allowedActions = appendToArray(allowedActions, "attack left");
            }
            if (int256(explorers[name].x) - int256(explorers[others].x) == -1 && explorers[name].y == explorers[others].y) {
                allowedActions = appendToArray(allowedActions, "attack right");
            }
            if (explorers[name].y - explorers[others].y == 1 && explorers[name].x == explorers[others].x) {
                allowedActions = appendToArray(allowedActions, "attack up");
            }
            if (int256(explorers[name].y) - int256(explorers[others].y) == -1 && explorers[name].x == explorers[others].x) {
                allowedActions = appendToArray(allowedActions, "attack down");
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

    // Check if the given address is a contract
    function isContract(address addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
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
            compareStrings(worldMap[y][x], "null") ||
                compareStrings(worldMap[y][x], "W"),
            "Position occupied"
        );

        explorers[agentName].x = x;
        explorers[agentName].y = y;

        // Update worldMap, agentMap
        worldMap[explorers[agentName].y][explorers[agentName].x] = agentName;
        agentMap[explorers[agentName].y][explorers[agentName].x] = agentName;
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
