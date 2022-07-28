// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./LIB.sol";

contract LIBWrapper {
    LIB public LIBToken;

    constructor() public {
        LIBToken = new LIB();
    }

    event LogLIBWrapped(address sender, uint256 amount);
    event LogLIBUnwrapped(address sender, uint256 amount);

    receive() external payable {
        wrap();
    }

    fallback() external payable {
        wrap();
    }

    function wrap() public payable {
        require(msg.value > 0, "We need to wrap at least 1 wei");
        LIBToken.mint(msg.sender, msg.value);
        emit LogLIBWrapped(msg.sender, msg.value);
    }

    function wrapWithSignature(
        bytes32 hashedMessage,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address receiver
    ) public payable {
        require(msg.value > 0, "We need to wrap at least 1 wei");
        require(
            recoverSigner(hashedMessage, v, r, s) == receiver,
            "Receiver does not signed the message"
        );
        LIBToken.mint(receiver, msg.value);
        emit LogLIBWrapped(receiver, msg.value);
    }

    function recoverSigner(
        bytes32 hashedMessage,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal returns (address) {
        bytes32 messageDigest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hashedMessage)
        );
        return ecrecover(messageDigest, v, r, s);
    }

    function unwrap(uint256 value) public {
        require(value > 0, "We need to unwrap at least 1 wei");
        LIBToken.transferFrom(msg.sender, address(this), value);
        LIBToken.burn(value);
        payable(msg.sender).transfer(value);
        emit LogLIBUnwrapped(msg.sender, value);
    }
}
