// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./GamePlay.sol";

contract BaseModule {
    GamePlay game;

    string public name;
    string public description;

    constructor(address _gameContract, string memory _name, string memory _description) public {
        game = GamePlay(_gameContract);
        name = _name;
        description = _description;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getDescription() public view returns (string memory) {
        return description;
    }

    function trigger(uint agentId, uint size) public virtual {
        // Generate random grid coordinates for teleportation
        // ...
        // return (x, y);
        // game.setLocation(agentName, 5, 5)
    }
}
