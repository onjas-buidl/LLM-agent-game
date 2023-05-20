// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./gameplay.sol";
import {BaseModule} from "./BaseModule.sol";

contract TeleportModule is BaseModule {
    constructor(address gameContract, string memory _description)
        public
        BaseModule(gameContract, _description)
    {}

    function trigger(string memory agentName) public override {
        // Generate random grid coordinates for teleportation
        // ...

        game.setLocation(agentName, 5, 5);
    }
}

contract BeerModule is BaseModule {
    constructor(address gameContract, string memory _description)
        public
        BaseModule(gameContract, _description)
    {}

    // TODO: make chain decrease 1 stamina for 3 blocks once every block (10 second effect)
    function trigger(string memory agentName) public override {
        // game.setStamina(agentName, game.getAgent(agentName).stamina - 1);
    }
}

// TODO:
// randomly generate "wealth" on map every tick, maybe deterministically
// players step on wealth to gain boosts
