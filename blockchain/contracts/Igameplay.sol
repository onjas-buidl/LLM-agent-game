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
    function addExplorer(string memory name, uint256 x, uint256 y, uint256 stamina, uint256 wealth) external;
    function move(string memory name, string memory direction) external;
    function gatherWealth(string memory name) external;
    function rest(string memory name) external;
    function attack(string memory attackerName, string memory defenderName) external;
    function getExplorerByDirection(string memory name, string memory direction) external view returns (string memory);
    function getSurroundings(string memory name) external view returns (string[][] memory);
    function getAllowedActions(string memory name) external view returns (string[] memory);
    function getWorldState() external view returns (string[][] memory);
}
