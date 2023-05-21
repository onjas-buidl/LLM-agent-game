// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {GamePlay} from "./gameplay.sol";
import {BaseModule} from "./BaseModule.sol";

contract TeleportModule is BaseModule {
    constructor(address gameContract, string memory _name, string memory _description)
        public
        BaseModule(gameContract, _name, _description)
    {}

    function getName() public view returns (string memory) {
        return name;
    }

    function getDescription() public view returns (string memory) {
        return description;
    }

    function trigger(string memory agentName, uint memory size) public override {
        // Generate random grid coordinates for teleportation
        uint256 x = randomCoordinate(size);
        uint256 y = randomCoordinate(size);
        game.setLocation(agentName, x, y);
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