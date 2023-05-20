// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.16;

contract ExplorerWorld is IGameplay{
    uint public mapSize;
    uint public scopeSize;
    uint public maxWealth;
    uint public maxStamina;
    
    uint[][] public map;
    mapping(string => mapping(string => uint)) public explorers;
    
    constructor(uint _mapSize) {
        mapSize = _mapSize;
        scopeSize = 2;
        maxWealth = 10;
        maxStamina = 10;
        
        map = new uint[][](mapSize);
        for (uint i = 0; i < mapSize; i++) {
            map[i] = new uint[](mapSize);
        }
    }
    
    function randomInitializeMap(uint wealthDensity) external {
        for (uint i = 0; i < mapSize; i++) {
            for (uint j = 0; j < mapSize; j++) {
                if (uint256(keccak256(abi.encodePacked(block.timestamp, i, j))) % 100 < wealthDensity) {
                    map[i][j] = 1;
                }
            }
        }
    }
    
    function addExplorer(string memory name, uint x, uint y, uint stamina) external {
        require(x < mapSize && y < mapSize, "Invalid position");
        
        if (x == 0 && y == 0) {
            explorers[name] = 0;
        } else {
            require(explorers[name] == 0, "Explorer name already exists");
        }
        
        explorers[name] = uint256(uint16(x) << 128 | uint16(y) << 112 | maxStamina << 96 | stamina);
    }
    
    function move(string memory name, string memory direction) external {
        require(explorers[name] != 0, "Explorer does not exist");
        
        uint x = getX(explorers[name]);
        uint y = getY(explorers[name]);
        
        if (keccak256(bytes(direction)) == keccak256(bytes("down"))) {
            y = y > 0 ? y - 1 : y;
        } else if (keccak256(bytes(direction)) == keccak256(bytes("up"))) {
            y = y < mapSize - 1 ? y + 1 : y;
        } else if (keccak256(bytes(direction)) == keccak256(bytes("left"))) {
            x = x > 0 ? x - 1 : x;
        } else if (keccak256(bytes(direction)) == keccak256(bytes("right"))) {
            x = x < mapSize - 1 ? x + 1 : x;
        } else {
            revert("Invalid direction");
        }
        
        explorers[name] = updatePosition(explorers[name], x, y);
    }
    
    // Implement other functions similarly
    
    // Helper functions
    
    function getX(uint256 position) internal pure returns (uint) {
        return uint16(position >> 128);
    }
    
    function getY(uint256 position) internal pure returns (uint) {
        return uint16(position >> 112);
    }
    
    function getMaxStamina
    (uint256 position) internal pure returns (uint) {
        return uint16(position >> 96);
    }
}
