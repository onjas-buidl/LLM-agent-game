pragma solidity ^0.8.4;

import "./GameMap.sol";

contract WorldBuildingContract {
    
    struct GameWorld {
        address gameMap;
        string description;
    }

    GameWorld[] public gameWorlds;

    function createGameWorld(string memory description, uint mapSize, uint agentCount) public returns (address) {
        GameMap newMap = new GameMap(mapSize, agentCount);
        gameWorlds.push(GameWorld(address(newMap), description));
        return address(newMap);
    }

    function getGameWorlds() public view returns (GameWorld[] memory) {
        return gameWorlds;
    }

    function getWorldDescription(address gameMap) public view returns (string memory) {
        for (uint i = 0; i < gameWorlds.length; i++) {
            if (gameWorlds[i].gameMap == gameMap) {
                return gameWorlds[i].description;
            }
        }
        return "";
    }
}
