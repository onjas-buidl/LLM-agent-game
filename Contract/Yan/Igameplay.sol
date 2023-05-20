// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface IGameplayContract {
    function setOwner(address owner) external;
    function randomInitializeMap(uint256 size, uint256 numWealth) external;
    function addExplorer(string memory name, uint256 x, uint256 y, uint256 stamina) external;
    function move(string memory name, string memory direction) external;
    function gatherWealth(string memory name) external;
    function rest(string memory name) external;
    function attack(string memory attackerName, string memory defenderName) external;
    function getSurroundings(string memory name) external view returns (uint256[][] memory);
    function getAllowedActions(string memory name) external view returns (string[] memory);
    function getWorldState() external view returns (uint256[][] memory);
}
