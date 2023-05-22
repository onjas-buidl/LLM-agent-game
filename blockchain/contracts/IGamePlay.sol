// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

struct Module {
    string name;
    string description;
    uint256 x;
    uint256 y;
    address contractAddress;
}

interface IGameplayContract {
    function setOwner(address newOwner) external;
    function randomInitializeMap(uint256 size, uint256 numWealth) external;
    function deployContracts(Module[] memory moduleList) external;
    function addExplorer (uint256 agentId, string memory agentName, uint256 x, uint256 y, uint256 stamina, uint256 wealth) external;
    function move(uint256 agentId, string memory direction) external;
    function gatherWealth(uint256 agentId) external;
    function rest(uint256 agentId) external;
    function attack(uint256 attackerId, uint256 defenderId) external;
    function getSurroundings(uint256 agentId) external view returns (string[][] memory);
    function getAllowedActions(uint256 agentId) external view returns (string[] memory);
    function getWorldState() external view returns (string[][] memory);
}

