pragma solidity ^0.8.4;

import "./GameMap.sol";

contract GameWorldFactory {
    
    struct GameWorld {
        address gameMap;
        string worldDescription;
    }
    // gameWorlds mapping: Maps a gameMap address to a GameWorld
    mapping(address => GameWorld) public gameWorlds;

    // list of gameMap addresses to keep track of all game worlds
    address[] public gameMapAddresses;

    event GameWorldCreated(string worldDescription);

    function createGameWorld(string memory worldDescription, uint mapSize, uint agentCount) public returns (address) {
        GameMap newMap = new GameMap(mapSize, agentCount);
        gameWorlds[address(newMap)] = GameWorld(address(newMap), worldDescription);
        gameMapAddresses.push(address(newMap));
        return address(newMap);
        emit GameWorldCreated(worldDescription);
    }

    function getGameWorlds() public view returns (GameWorld[] memory) {
        GameWorld[] memory worlds = new GameWorld[](gameMapAddresses.length);
        for (uint i = 0; i < gameMapAddresses.length; i++) {
            worlds[i] = gameWorlds[gameMapAddresses[i]];
        }
        return worlds;
    }

    function getWorldDescription(address gameMap) public view returns (string memory) {
        return gameWorlds[gameMap].worldDescription;
    }
}
