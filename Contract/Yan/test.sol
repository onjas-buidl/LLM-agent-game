pragma solidity ^0.8.16;

contract GamePlay {
    string[][] private worldMap;
    mapping(string => Explorer) public explorers;

    struct Explorer {
        string name;
        uint256 x;
        uint256 y;
        uint256 stamina;
    }

    function randomInitializeMap(uint256 size, uint256 numWealth) external {
        // Generate random positions for wealth
        uint256[] memory wealthPositions = generateRandomPositions(size, numWealth);

        // Initialize the world map with "null" values
        worldMap = new string[][](size);
        for (uint256 i = 0; i < size; i++) {
            worldMap[i] = new string[](size);
            for (uint256 j = 0; j < size; j++) {
                worldMap[i][j] = "null";
            }
        }

        // Place "W" on the randomly chosen wealth positions
        for (uint256 k = 0; k < numWealth; k++) {
            uint256 x = wealthPositions[k] / size;
            uint256 y = wealthPositions[k] % size;
            worldMap[x][y] = "W";
        }
    }

    function addExplorer(
        string memory name,
        uint256 x,
        uint256 y,
        uint256 stamina
    ) external {
        explorers[name] = Explorer(name, x, y, stamina);
        worldMap[x][y] = name;
    }

    function generateRandomPositions(uint256 size, uint256 numPositions)
        private
        view
        returns (uint256[] memory)
    {
        require(numPositions <= size * size, "Invalid number of positions");
        uint256[] memory positions = new uint256[](size * size);
        for (uint256 i = 0; i < size * size; i++) {
            positions[i] = i;
        }
        // Shuffle the positions using Fisher-Yates algorithm
        for (uint256 i = size * size - 1; i > 0; i--) {
            uint256 j = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % (i + 1));
            uint256 temp = positions[i];
            positions[i] = positions[j];
            positions[j] = temp;
        }
        // Select the first numPositions from the shuffled array
        uint256[] memory selectedPositions = new uint256[](numPositions);
        for (uint256 i = 0; i < numPositions; i++) {
            selectedPositions[i] = positions[i];
        }
        return selectedPositions;
    }
}
