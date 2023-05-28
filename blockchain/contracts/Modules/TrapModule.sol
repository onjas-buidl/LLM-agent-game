// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "../GamePlay.sol";
import {BaseModule} from "../BaseModule.sol";

contract TrapModule is BaseModule {
    constructor(address gameContract, string memory _name, string memory _description)
        public
        BaseModule(gameContract, _name, _description)
    {}

    function trigger(uint agentId, uint size) public override {
        // require(bytes(explorers[agentId].agentName).length != 0, "Explorer not found");
        
        // Generate random coordinates for the trap
        uint256 x = randomCoordinate(size);
        uint256 y = randomCoordinate(size);

        // // If the agent steps on the trap, reduce their stamina by 1
        // uint256[] memory location = game.getAgentLocation(agentId);
        // if (location[0] == x && location[1] == y) {
        //     game.reduceStamina(agentId, 1);
        // }
    }

    //-------------------- Helpers --------------------
    // Helper function to generate a random coordinate within the map size
    function randomCoordinate(uint256 size) private view returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, size))
            ) % size;
    }
}
