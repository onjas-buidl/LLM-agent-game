pragma solidity ^0.8.4;

import "./GameInstance.sol";

contract GameMap {

    struct GameObject {
        string name;
        string functionality;
        uint rarity;
    }

    uint public mapSize;
    uint public agentCount;

    mapping(string => GameObject) public gameObjects;

    event GameStarted(address gameInstanceAddress);
    event GameObjectInitialized(string prompt);
    
    constructor(uint _mapSize, uint _agentCount) {
        mapSize = _mapSize;
        agentCount = _agentCount;
    }

    function initializeObject(string memory prompt) public {
        // This function can be used to receive a prompt from a player
        // for creating a new GameObject
        emit GameObjectInitialized(prompt);
    }

    function createObject(string memory name, string memory functionality, uint rarity) public {
        GameObject memory newObject = GameObject(name, functionality, rarity);
        gameObjects[name] = newObject;
    }

    function createGame(GameObject[] memory gameObjectsArray, uint _mapSize, uint _agentCount) public {
        // Input validation
        require(_mapSize > 0, "Map size should be greater than 0");
        require(agentCount > 0, "Agent count should be greater than 0");

        // Initialize gameObjects from gameObjectsArray
        for(uint i=0; i<gameObjectsArray.length; i++) {
            createObject(gameObjectsArray[i].name, gameObjectsArray[i].functionality, gameObjectsArray[i].rarity);
        }

        // Create a new instance of GameInstance contract
        GameInstance newGame = new GameInstance(GameObject[] memory, _mapSize, agentCount);
        
        emit GameStarted(address(newGame));
    }
}
