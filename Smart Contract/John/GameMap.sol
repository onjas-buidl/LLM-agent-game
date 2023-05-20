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
    
    constructor(uint _mapSize, uint _agentCount) {
        mapSize = _mapSize;
        agentCount = _agentCount;
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
        GameInstance newGame = new GameInstance(gameObjectsArray, _mapSize, agentCount);
        
        emit GameStarted(address(newGame));
    }
}
