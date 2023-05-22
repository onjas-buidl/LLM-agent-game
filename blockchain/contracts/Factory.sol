// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./IFactory.sol";
import "./GamePlay.sol";

contract FactoryContract is IFactoryContract{
    mapping(address => address) public gamePlayContracts;

    // define event gameplay address
    event NewGame(address gamePlayAddress);

    function startGame(uint256 size, uint256 wealthCount, uint256 agentCount, Agent[] calldata agentList) external returns (address) {
        // Input validation
        require(size > 0, "Map size should be greater than 0");
        require(wealthCount > 0, "Number of wealth should be greater than 0");

        // NOTE: Agents must be added with addExplorer to initialize Agent class.
        // It seems that PRINCIPLES was not managed on-chain either.
        // require(agentCount > 0, "Agent count should be greater than 0");
        
        GamePlay gamePlay = new GamePlay();

        // Store the game play contract address
        address gamePlayAddress = address(gamePlay);
        gamePlayContracts[gamePlayAddress] = msg.sender;

        // Call randomInitializeMap and pass in the size
        gamePlay.randomInitializeMap(size, wealthCount);

        // Iterate over the agentList and call addExplorer to add agents to the map
        for (uint256 i = 0; i < agentCount; i++) {
            uint256 agentId = agentList[i].agentId;
            string memory agentName = agentList[i].agentName;
            uint256 x = agentList[i].x;
            uint256 y = agentList[i].y;
            uint256 stamina = agentList[i].stamina;
            uint256 wealth = agentList[i].wealth;
            gamePlay.addExplorer(agentId, agentName, x, y, stamina, wealth);
        }

        // Set the owner of the game play contract as the message sender
        gamePlay.setOwner(msg.sender);
        emit NewGame(gamePlayAddress);

        return gamePlayAddress;
    }
}
