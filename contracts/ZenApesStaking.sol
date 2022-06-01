// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

interface IERC721 {
    function ownerOf(uint256 _tokenId) external view returns (address);
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
}

interface IZenToken {
    function mintAsController(address to_, uint256 amount_) external;
}

contract ZenStaking {
    
    uint yieldPerDay;
    uint40 _requiredStakeTime;
    address public owner;

    struct StakedToken {
        uint40 stakingTimestamp;
        uint40 lastClaimTimestamp;
        address tokenOwner;
    }

    // seconds in 24 hours: 86400

    mapping(uint16 => StakedToken) private stakedTokens;
    
    IERC721 zenApesContract;
    IZenToken zenTokenContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller Not Owner!");
        _;
    }

    function setZenApesContractAddr(address _contractAddress) public onlyOwner {
        uint256 size;
        assembly {
            size := extcodesize(_contractAddress)
        }
        require(size > 0, "Not A Contract!");
        zenApesContract = IERC721(_contractAddress);
    }

    function setZenTokenContractAddr(address _contractAddress) public onlyOwner {
        uint256 size;
        assembly {
            size := extcodesize(_contractAddress)
        }
        require(size > 0, "Not A Contract!");
        zenTokenContract = IZenToken(_contractAddress);
    }

    /**
     * @dev getter function to get the last claim timestamp for a specific wolf ID
     */
    function getLastClaimTimestamp(uint16 id) external view returns(uint64) {
        return stakedTokens[id].lastClaimTimestamp;
    }

    function claim(uint tokenId) external {
        StakedToken memory tokenInfo = stakedTokens[uint16(tokenId)];
        require(tokenInfo.tokenOwner == msg.sender, "Caller is not token owner!");

        uint claimAmount = _getClaimableAmount(tokenInfo);

        require(claimAmount > 0, "No claimableTokens!");

        stakedTokens[uint16(tokenId)].lastClaimTimestamp = uint40(block.timestamp);
        zenTokenContract.mintAsController(msg.sender, claimAmount);
    }

    function batchClaim(uint[] memory tokenIds) external {
        uint length = tokenIds.length;
        uint claimAmount;
        uint cId;
        StakedToken memory tokenInfo;

        for (uint i; i < length;) {
            assembly {
                cId := mload(add(add(tokenIds, 0x20), mul(i, 0x20)))
            }

            tokenInfo = stakedTokens[uint16(cId)];
            require(tokenInfo.tokenOwner == msg.sender, "Caller is not token owner!");

            claimAmount += _getClaimableAmount(tokenInfo);
            stakedTokens[uint16(cId)].lastClaimTimestamp = uint40(block.timestamp);
            
            unchecked { i++; }
        }

        require(claimAmount > 0, "No claimableTokens!");

        zenTokenContract.mintAsController(msg.sender, claimAmount);
    }

    function _getClaimableAmount(StakedToken memory tokenInfo) private view returns(uint claimAmount) {
        uint secondsSinceLastClaim;
        unchecked { secondsSinceLastClaim = block.timestamp - tokenInfo.lastClaimTimestamp; }

        if (secondsSinceLastClaim > 86399) {
            claimAmount = (secondsSinceLastClaim / 86400) * yieldPerDay;
        } else {
            uint timeStaked = block.timestamp - tokenInfo.stakingTimestamp;
            uint requiredStakeTime = _requiredStakeTime;

            require(timeStaked >= requiredStakeTime, "Required stake time not met!");
            claimAmount = ((timeStaked - requiredStakeTime) / 86400) * yieldPerDay;
        }
    }


    function stake(uint tokenId) external {
        require(zenApesContract.ownerOf(tokenId) == msg.sender);
        stakedTokens[uint16(tokenId)].stakingTimestamp = uint40(block.timestamp);
        stakedTokens[uint16(tokenId)].tokenOwner = msg.sender;
        zenApesContract.transferFrom(msg.sender, address(this), tokenId);
    }

    function ustake(uint tokenId) external {
        require(stakedTokens[uint16(tokenId)].tokenOwner == msg.sender);
        delete stakedTokens[uint16(tokenId)];
        zenApesContract.transferFrom(address(this), msg.sender, tokenId);
    }

}