// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./GamePlay.sol";
import {BaseModule} from "./BaseModule.sol";

contract TeleportModule is BaseModule {
    constructor(address gameContract, string memory _name, string memory _description)
        public
        BaseModule(gameContract, _name, _description)
    {}
    
    function trigger(uint agentId, uint size) public override {
        // Generate random grid coordinates for teleportation
        uint256 x = randomCoordinate(size);
        uint256 y = randomCoordinate(size);
        // Check if the grid is occupied
        while (game.isOccupied(x, y)) {
            x = randomCoordinate(size);
            y = randomCoordinate(size);
        }
        game.setLocation(agentId, x, y);
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
