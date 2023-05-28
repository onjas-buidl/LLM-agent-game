// The module allows an to be invisible to other agents for 1 minute. This means that their position wouldn't be returned by getAgentLocation. Would require changes in gameplay.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "../GamePlay.sol";
import {BaseModule} from "../BaseModule.sol";

contract StealthModule is BaseModule {
    // Define stealth duration
    uint256 public stealthDuration = 1 minutes;

    // Define a struct to hold the stealth state of each explorer
    struct StealthState {
        bool isInStealthMode;
        uint256 endOfStealth;
    }

    // Map each explorer to their stealth state
    mapping(uint256 => StealthState) public stealthStates;

    constructor(address gameContract, string memory _name, string memory _description)
        public
        BaseModule(gameContract, _name, _description)
    {}

    function trigger(uint agentId, uint size) public override {
        // Check if explorer is currently in stealth mode
        // if (stealthStates[agentId].isInStealthMode) {
        //     // If the explorer's stealth mode is over
        //     if (block.timestamp > stealthStates[agentId].endOfStealth) {
        //         stealthStates[agentId].isInStealthMode = false;
        //         game.setStealthMode(agentId, false);
        //     }
        //     // If the explorer is still in stealth mode, don't change anything
        //     return;
        // }

        // // If explorer is not in stealth mode, enable stealth mode for the stealth duration
        // stealthStates[agentId].isInStealthMode = true;
        // stealthStates[agentId].endOfStealth = block.timestamp + stealthDuration;
        // game.setStealthMode(agentId, true);
        uint x = 1; // TODO: remove this
    }
}
