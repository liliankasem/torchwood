pragma solidity ^0.4.23;

contract ContractWithEvent {
    address public owner;

    event EventRaised(
        address requestAddress
    );

    constructor() public {
        owner = msg.sender;
    }

    function raiseEvent() public  {
        emit EventRaised(msg.sender);
    }
}