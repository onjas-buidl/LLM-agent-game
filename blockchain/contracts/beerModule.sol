// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./GamePlay.sol";
import {BaseModule} from "./BaseModule.sol";

// Prompt inject only module - not changing the game states
contract BeerModule is BaseModule {
    constructor(address gameContract, string memory _name, string memory _description)
        public
        BaseModule(gameContract, _name, _description)
    {}

    // TODO: make chain decrease 1 stamina for 3 blocks once every block (10 second effect) using Curio ticker
    // function trigger(string memory agentName, uint size) public override {
    //     game.setStamina(agentName, game.getAgent(agentName).stamina - 1);
    // }
}

// TODO:
// randomly generate "wealth" on map every tick, maybe deterministically
// players step on wealth to gain boosts
