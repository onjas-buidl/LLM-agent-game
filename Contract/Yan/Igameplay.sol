// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IGameplayContract {
    function setOwner(address newOwner) external;
    function randomInitializeMap(uint256 size, uint256 numWealth) external;
    function deployContract(uint256 x, uint256 y, address contractAddress) external;
    function addExplorer(string memory name, uint16 x, uint16 y, uint16 stamina, uint16 wealth) external;
    function move(string memory name, string memory direction) external;
    function gatherWealth(string memory name) external;
    function rest(string memory name) external;
    function attack(string memory attackerName, string memory defenderName) external;
    function getSurroundings(string memory name) external view returns (string[][] memory);
    function getAllowedActions(string memory name) external view returns (string[] memory);
    function getWorldState() external view returns (string[][] memory);
}
