// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./gameplay.sol";

contract BaseModule {
    GamePlay game;

    string public name;
    string public destription;

    constructor(address _gameContract, string memory _name, string memory _description) public {
        game = GamePlay(_gameContract);
        name = _name;
        destription = _description;
    }

    function trigger(string memory agentName) public {
        // Generate random grid coordinates for teleportation
        // ...
        // return (x, y);
        // game.setLocation(agentName, 5, 5)
    }
}
