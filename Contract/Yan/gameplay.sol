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
    }

    string[][] private worldMap;
    mapping(string => Explorer) public explorers;

    mapping(uint256 => mapping(uint256 => address)) public ugcContract;

    function randomInitializeMap(uint256 size, uint256 numWealth)
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

        // Randomly distribute numWealth number of 1s
        uint256 count = 0;
        while (count < numWealth) {
            uint256 x = randomCoordinate(size);
            uint256 y = randomCoordinate(size);

            // Check if the cell is already assigned a wealth
            if (compareStrings(worldMap[x][y], "null")) {
                worldMap[x][y] = "W";
                count++;
            }
        }

        // TODO: How to make it composable? eg. teleport module
    }

    // deploy UGC contract
    function deployContract(
        uint256 x,
        uint256 y,
        address contractAddress
    ) external onlyOwner {
        // Check if the provided position is within the map boundaries
        require(x < worldMap.length, "Invalid x coordinate");
        require(y < worldMap.length, "Invalid y coordinate");

        // require(ugcContract[x][y], "Cell already occupied");

        // TODO: check if address exists

        // Deploy the contract
        ugcContract[x][y] = contractAddress;
    }

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

    function addExplorer(
        string memory name,
        uint256 x,
        uint256 y,
        uint256 stamina
    ) external onlyOwner {
        // Add the explorer to the explorers mapping
        explorers[name] = Explorer(name, x, y, stamina);

        // Check if the provided position is within the map boundaries
        require(x < worldMap.length, "Invalid x coordinate");
        require(y < worldMap.length, "Invalid y coordinate");

        // Check if the provided position is not occupied by another explorer
        require(
            compareStrings(worldMap[x][y], "null") ||
                compareStrings(worldMap[x][y], "W"),
            "Position available"
        );

        // Set the cell value to the agent's ID
        worldMap[x][y] = name;
    }

    function move(string memory name, string memory direction)
        external
        onlyOwner
    {
        // Implement the logic to move the explorer with the provided name
        // in the specified direction
        // Also needs to update Agent struct states
    }

    function gatherWealth(string memory name) external onlyOwner {
        // Implement the logic to allow the explorer with the provided name
        // to gather wealth
    }

    function rest(string memory name) external onlyOwner {
        // Implement the logic to allow the explorer with the provided name
        // to rest and regain stamina
    }

    function attack(string memory attackerName, string memory defenderName)
        external
        onlyOwner
    {
        // Implement the logic to allow the attacker with the provided name
        // to attack the defender with the provided name
    }

    function getSurroundings(string memory name)
        external
        view
        returns (uint256[][] memory)
    {
        // Implement the logic to return the surroundings of the explorer
        // with the provided name as a 2D array
        // Example return value: [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    }

    function getAllowedActions(string memory name)
        external
        view
        returns (string[] memory)
    {
        // Implement the logic to return an array of allowed actions
        // for the explorer with the provided name
        // Example return value: ["move", "gather", "rest", "attack"]
    }

    function getWorldState() external view returns (uint256[][] memory) {
        // Implement the logic to return the current state of the world map
        // as a 2D array
        // Example return value: [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    }

    // ---------------------
    // private setters

    function setLocation(
        string memory agentName,
        uint256 x,
        uint256 y
    ) public {
        // Check if the provided position is within the map boundaries

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
