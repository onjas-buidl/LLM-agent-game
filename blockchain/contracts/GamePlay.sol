// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./IGamePlay.sol";
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
        uint256 agentId;
        string agentName;
        uint256 x;
        uint256 y;
        uint256 stamina;
        uint256 wealth;
    }
    
    string[][] private worldMap;
    string[][] private agentMap;
    mapping(uint256 => Explorer) public explorers;
    uint explorersCount = 0;

    mapping(uint256 => mapping(uint256 => address)) public ugcContract;

    function randomInitializeMap(uint256 size, uint256 wealthCount)
        external
        onlyOwner
    {
        require(size * size >= wealthCount, "Too much wealth for such a small map!");

        // Initialize the worldMap and agentMap with "null" values
        worldMap = new string[][](size);
        agentMap = new string[][](size);

        // Flatten and randomize a list of coordinates
        uint256[] memory order = new uint256[](size * size);
        for (uint256 i = 0; i < size * size; i++) {
            order[i] = i;
        }

        // Fisher-Yates shuffle to randomize the order array
        for (uint256 i = size * size - 1; i > 0; i--) {
            uint256 j = randomCoordinate(i + 1);
            (order[i], order[j]) = (order[j], order[i]);
        }

        // Fill the maps
        uint256 wealthDistributed = 0;
        for (uint256 i = 0; i < size; i++) {
            worldMap[i] = new string[](size);
            agentMap[i] = new string[](size);

            for (uint256 j = 0; j < size; j++) {
                agentMap[i][j] = "null";

                uint256 index = order[i * size + j];
                if (index < wealthCount) {
                    worldMap[i][j] = "W";
                    wealthDistributed++;
                } else {
                    worldMap[i][j] = "null";
                }
            }
        }
    }

    // deploy UGC contract
    function deployContracts(
        Module[] memory moduleList
    ) external {
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
            require(compareStrings(agentMap[y][x], "null"), "Cell already occupied");

            // Set up the module contract
            ugcContract[y][x] = contractAddress;

            string memory name = moduleList[i].name;
            // string memory description = moduleList[i].description;
            // Update the worldMap
            require(compareStrings(worldMap[y][x], "null") && compareStrings(agentMap[y][x], "null"), "Cell already occupied");
            worldMap[y][x] = name;
        }
    }

    function addExplorer(
        uint256 agentId,
        string memory agentName,
        uint256 x,
        uint256 y,
        uint256 stamina,
        uint256 wealth
    ) external {
        // agentId should start from 1
        require(agentId > explorersCount, "agentId already exists");
        // Add the explorer to the explorers mapping
        explorers[agentId] = Explorer(agentId, agentName, x, y, stamina, wealth);

        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid coordinates");

        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(worldMap[y][x], "null") ||
                compareStrings(worldMap[y][x], "W"),
            "Position occupied"
        );
        require(
            compareStrings(agentMap[y][x], "null"),
            "Position occupied"
        );

        // Set the cell value to the agent's name
        // worldMap[y][x] = name;
        agentMap[y][x] = agentName;

        explorersCount += 1;
    }

    function move(uint256 agentId, string memory direction) 
        external
    {   
        require(compareStrings(direction, "down") || compareStrings(direction, "up") || compareStrings(direction, "left") || compareStrings(direction, "right"), "Invalid direction");
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        require(explorers[agentId].stamina > 0, "Explorer already dead");
        
        uint256 x = explorers[agentId].x;
        uint256 y = explorers[agentId].y;
        
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
        setLocation(agentId, x, y);

        // Decrease stamina by 1
        uint stamina = explorers[agentId].stamina;
        explorers[agentId].stamina = stamina - 1;
        // if stamina is 0, dead
        if (explorers[agentId].stamina == 0) {
            dead(agentId);
        }

        // If step on module - trigger
        if (ugcContract[y][x] != address(0)) {
            // call the module contract to trigger function
            BaseModule module = BaseModule(ugcContract[uint256(y)][uint256(x)]);
            module.trigger(agentId, worldMap.length);
        }
    }

    function gatherWealth(uint256 agentId) 
        external 
    {
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        require(explorers[agentId].stamina > 0, "Explorer already dead");

        uint256 x = explorers[agentId].x;
        uint256 y = explorers[agentId].y;

        // Check if the explorer is on a cell with wealth
        require(compareStrings(worldMap[y][x], "W"), "No wealth at current position");

        // Increment the explorer's wealth
        explorers[agentId].wealth++;

        // Decrease stamina by 1
        uint stamina = explorers[agentId].stamina;
        explorers[agentId].stamina = stamina - 1;

        // Set the cell value back to "null"
        worldMap[y][x] = "null";
    }

    function rest(uint256 agentId) 
        external
    {
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        require(explorers[agentId].stamina > 0, "Explorer already dead");
        explorers[agentId].stamina += 3;
    }

    function attack(uint256 attackerId, uint256 defenderId)
        external
    {
        require(bytes(explorers[attackerId].agentName).length != 0, "Attacker not found");
        require(explorers[attackerId].stamina > 0, "Attacker already dead");
        require(bytes(explorers[defenderId].agentName).length != 0, "Defender not found");
        require(explorers[defenderId].stamina > 0, "Defender already dead");

        if (explorers[attackerId].stamina > explorers[defenderId].stamina) {
            // Attacker successfully defeats the defender and gains their wealth
            explorers[attackerId].wealth += explorers[defenderId].wealth;
            explorers[attackerId].stamina -= 1;
            explorers[defenderId].wealth = 0;
            explorers[defenderId].stamina = 0;
            dead(defenderId);
        }
        else {
            // Attacker fails, lose all wealth, and die
            explorers[defenderId].wealth += explorers[attackerId].wealth;
            explorers[attackerId].stamina = 0;
            explorers[attackerId].wealth = 0;
            dead(attackerId);
        }
    }

    // ---------------------
    // getter funcs

    function getExplorersList() external view returns (Explorer[] memory) {
        Explorer[] memory result = new Explorer[](explorersCount);

        for (uint256 i = 0; i < explorersCount; i++) {
            result[i] = explorers[i+1];
        }
        return result;
    }


    function getSurroundings(uint256 agentId) external view returns (string[][] memory) {
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        
        uint256 x = explorers[agentId].x;
        uint256 y = explorers[agentId].y;
        uint256 size = worldMap.length;
        
        // size of the surroundings (3x3 grid) - Visible scope 2
        uint256 surroundingsSize = 3;
        
        // Initialize the surroundings array
        string[][] memory surroundings = new string[][](surroundingsSize);
        for (uint256 i = 0; i < surroundingsSize; i++) {
            surroundings[i] = new string[](surroundingsSize);
        }
        
        // Fill the surroundings array with the values from the world map and agent map
        for (uint256 i = 0; i < surroundingsSize; i++) {
            for (uint256 j = 0; j < surroundingsSize; j++) {
                int256 mapX = int256(x) - 1 + int256(i); // Convert to int to avoid underflow
                int256 mapY = int256(y) - 1 + int256(j);
                
                // Check if the map coordinates are within bounds
                if (mapX >= 0 && mapX < int256(size) && mapY >= 0 && mapY < int256(size)) {
                    // If cell is a module, give the module description
                    if (ugcContract[uint256(mapY)][uint256(mapX)] != address(0)) {
                        // call the module contract to get the description
                        BaseModule module = BaseModule(ugcContract[uint256(mapY)][uint256(mapX)]);
                        // string memory moduleName = module.getName();
                        string memory moduleName = module.getName();
                        string memory moduleDescription = module.getDescription();
                        // concatenate the module name and description into moduleInfo
                        string memory moduleInfo = string(abi.encodePacked(moduleName, ": ", moduleDescription));
                        surroundings[j][i] = moduleInfo;
                    }
                    else {
                        // If no modules nearby, give the world map value and agent map value
                        string memory cellValue = worldMap[uint256(mapY)][uint256(mapX)];
                        string memory agentValue = agentMap[uint256(mapY)][uint256(mapX)];
                        if( compareStrings(cellValue, "null") && compareStrings(agentValue, "null")) {
                            surroundings[j][i] = "null";
                        }
                        else if (compareStrings(cellValue, "null")) {
                            surroundings[j][i] = agentValue;
                        }
                        else if (compareStrings(agentValue, "null")) {
                            surroundings[j][i] = cellValue;
                        }
                        else{// Both has value, Concatenate the cell values using AND
                            string memory combinedValue = string(abi.encodePacked(cellValue, " & ", agentValue));
                            surroundings[j][i] = combinedValue;
                        }
                    }
                } else {
                    surroundings[j][i] = "OUT"; // Agents can't see outside the map
                }
            }
        }
        
        return surroundings;
    }

    function getAllowedActions(uint256 agentId) external view returns (string[] memory) {
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        require(explorers[agentId].stamina > 0, "Explorer already dead");
        
        string[] memory allowedActions = new string[](1);
        allowedActions[0] = "rest";
        
        string[] memory dirs = new string[](4);
        dirs[0] = "up";
        dirs[1] = "down";
        dirs[2] = "left";
        dirs[3] = "right";
        
        uint256 x = explorers[agentId].x;
        uint256 y = explorers[agentId].y;
        uint256 mapSize = worldMap.length;
        
        for (uint256 i = 0; i < dirs.length; i++) {
            if (compareStrings(dirs[i], "up") && y > 0 && compareStrings(agentMap[y - 1][x],"null")) {
                allowedActions = appendToArray(allowedActions, "move up");
            }
            else if (compareStrings(dirs[i], "up") && y > 0 && !compareStrings(agentMap[y - 1][x],"null")){
                string memory defenderId = agentMap[y - 1][x];
                string memory defenderName = explorers[uint256(keccak256(abi.encodePacked(defenderId)))].agentName;
                string memory combinedDefender = string(abi.encodePacked(defenderId, "(", defenderName,")"));
                string memory action = string(abi.encodePacked("attack ", combinedDefender));
                allowedActions = appendToArray(allowedActions, action);
            }

            if (compareStrings(dirs[i], "down") && y < mapSize - 1 && compareStrings(agentMap[y + 1][x],"null")) {
                allowedActions = appendToArray(allowedActions, "move down");
            }
            else if (compareStrings(dirs[i], "down") && y < mapSize - 1 && !compareStrings(agentMap[y + 1][x],"null")){
                string memory defenderId = agentMap[y + 1][x];
                string memory defenderName = explorers[uint256(keccak256(abi.encodePacked(defenderId)))].agentName;
                string memory combinedDefender = string(abi.encodePacked(defenderId, "(", defenderName,")"));
                string memory action = string(abi.encodePacked("attack ", combinedDefender));
                allowedActions = appendToArray(allowedActions, action);
            }

            if (compareStrings(dirs[i], "left") && x > 0 && compareStrings(agentMap[y][x - 1],"null")) {
                allowedActions = appendToArray(allowedActions, "move left");
            }
            else if (compareStrings(dirs[i], "left") && x > 0 && !compareStrings(agentMap[y][x - 1],"null")){
                string memory defenderId = agentMap[y][x - 1];
                string memory defenderName = explorers[uint256(keccak256(abi.encodePacked(defenderId)))].agentName;
                string memory combinedDefender = string(abi.encodePacked(defenderId, "(", defenderName,")"));
                string memory action = string(abi.encodePacked("attack ", combinedDefender));
                allowedActions = appendToArray(allowedActions, action);
            }

            if (compareStrings(dirs[i], "right") && x < mapSize - 1 && compareStrings(agentMap[y][x + 1],"null")) {
                allowedActions = appendToArray(allowedActions, "move right");
            }
            else if (compareStrings(dirs[i], "right") && x < mapSize - 1 && !compareStrings(agentMap[y][x + 1],"null")){
                string memory defenderId = agentMap[y][x + 1];
                string memory defenderName = explorers[uint256(keccak256(abi.encodePacked(defenderId)))].agentName;
                string memory combinedDefender = string(abi.encodePacked(defenderId, "(", defenderName,")"));
                string memory action = string(abi.encodePacked("attack ", combinedDefender));
                allowedActions = appendToArray(allowedActions, action);
            }
        }
        
        if (compareStrings(worldMap[y][x], "W")) {
            allowedActions = appendToArray(allowedActions, "gather");
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
    

    // getter func that aggregates worldMap and agentMap - may overlap and concatenate into one string
    function getWorldState() external view returns (string[][] memory) {
        uint256 size = worldMap.length;
        string[][] memory state = new string[][](size);

        for (uint256 i = 0; i < size; i++) {
            state[i] = new string[](size); // Initialize the inner array

            for (uint256 j = 0; j < size; j++) {
                string memory cellValue = worldMap[i][j];
                string memory agentValue = agentMap[i][j];
                if( compareStrings(cellValue, "null") && compareStrings(agentValue, "null")) {
                    state[i][j] = "null";
                    continue;
                }
                else if (compareStrings(cellValue, "null")) {
                    state[i][j] = agentValue;
                    continue;
                }
                else if (compareStrings(agentValue, "null")) {
                    state[i][j] = cellValue;
                    continue;
                }
                else{// Both has value, Concatenate the cell values using AND
                string memory combinedValue = string(abi.encodePacked(cellValue, " & ", agentValue));
                state[i][j] = combinedValue;
                }
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

    // R.I.P
    function dead(uint256 agentId) internal {
        require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        explorers[agentId].stamina = 0;
        explorers[agentId].wealth = 0;
        worldMap[explorers[agentId].y][explorers[agentId].x] = "null";
        agentMap[explorers[agentId].y][explorers[agentId].x] = "null";
        explorers[agentId].x = 0;
        explorers[agentId].y = 0;
    }

    // ---------------------
    // private setters

    function setLocation(
        uint256 agentId,
        uint256 x,
        uint256 y
    ) public {
        // Check if the provided position is within the map boundaries
        require(x < worldMap.length && y < worldMap.length, "Invalid position");
        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(agentMap[y][x], "null") ||
                compareStrings(worldMap[y][x], "W"),
            "Position occupied"
        );
        string memory agentName = explorers[agentId].agentName;
        uint256 origX = explorers[agentId].x;
        uint256 origY = explorers[agentId].y;
        explorers[agentId].x = x;
        explorers[agentId].y = y;

        // Update agentMap
        agentMap[explorers[agentId].y][explorers[agentId].x] = agentName;
        agentMap[origY][origX] = "null";
    }

    function setStamina(uint256 agentId, uint256 stamina) public {
        explorers[agentId].stamina = stamina;
    }

    function getAgent(uint256 agentId)
        public
        view
        returns (Explorer memory)
    {
        return explorers[agentId];
    }

    function getCellValue(uint x, uint y) public view returns (string memory) {
        // If no modules nearby, give the world map value and agent map value
        string memory cellValue = worldMap[uint256(y)][uint256(x)];
        string memory agentValue = agentMap[uint256(y)][uint256(x)];
        if( compareStrings(cellValue, "null") && compareStrings(agentValue, "null")) {
            return "null";
        }
        else if (compareStrings(cellValue, "null")) {
            return agentValue;
        }
        else if (compareStrings(agentValue, "null")) {
            return cellValue;
        }
        else{// Both has value, Concatenate the cell values using AND
            string memory combinedValue = string(abi.encodePacked(cellValue, " & ", agentValue));
            return combinedValue;
        }
    }

    function getWorldMap() public view returns (string[][] memory) {
        return worldMap;
    }

    function getAgentMap() public view returns (string[][] memory) {
        return agentMap;
    }

    function getExplorersCount() public view returns (uint) {
        return explorersCount;
    }

    function isOccupied(uint x, uint y) public view returns (bool) {
        return (!compareStrings(agentMap[uint256(y)][uint256(x)], "null") || !compareStrings(worldMap[y][x], "null"));
    }
}
