// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IFactoryContract {
    struct Agent {
        string name;
        uint256 x;
        uint256 y;
        uint256 stamina;
    }

    function startGame(uint256 size, uint256 numWealth, uint256 numAgents, Agent[] calldata agentList) external returns (address);
}
