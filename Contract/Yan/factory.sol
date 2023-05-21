// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./Ifactory.sol";
import "./gameplay.sol";

contract FactoryContract is IFactoryContract{
    mapping(address => address) public gamePlayContracts;

    function startGame(uint256 size, uint256 wealthCount, uint256 agentCount, Agent[] calldata agentList) external returns (address) {
        // Input validation
        require(size > 0, "Map size should be greater than 0");
        require(wealthCount > 0, "Number of wealth should be greater than 0");
        require(agentCount > 0, "Agent count should be greater than 0");
        
        GamePlay gamePlay = new GamePlay();

        // Store the game play contract address
        address gamePlayAddress = address(gamePlay);
        gamePlayContracts[gamePlayAddress] = msg.sender;

        // Call randomInitializeMap and pass in the size
        gamePlay.randomInitializeMap(size, wealthCount);

        // Iterate over the agentList and call addExplorer to add agents to the map
        for (uint256 i = 0; i < agentCount; i++) {
            string memory name = agentList[i].name;
            uint256 x = agentList[i].x;
            uint256 y = agentList[i].y;
            uint256 stamina = agentList[i].stamina;
            gamePlay.addExplorer(name, x, y, stamina);
        }

        // Set the owner of the game play contract as the message sender
        gamePlay.setOwner(msg.sender);

        return gamePlayAddress;
    }
}