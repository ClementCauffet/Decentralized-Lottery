// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Loto {
    //Calls the contract
    address public manager;
    //Want to access the Lottery
    address[] public players;
    mapping(address => uint256) public participants;

    address public winner;

    receive() external payable {}

    fallback() external payable {}

    modifier restricted() {
        require(msg.sender == manager, "User is not a manager");
        _;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getParticipations(address _key) public view returns (uint256) {
        return participants[_key];
    }

    constructor() {
        manager = msg.sender;
    }

    //Function to call to enter the Lottery Game
    function enter() public payable {
        require(msg.value >= 1 ether, "Sent less than 1 ether");

        if (participants[msg.sender] != 0) {
            players.push(msg.sender);
            participants[msg.sender] += 1;
        }
    }

    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encode(block.timestamp, players)));
    }

    function pickWinner() public restricted returns (address) {
        uint256 index = random() % players.length;
        winner = players[index];
        console.log("Test winner pre reset", winner);
        //pays the winner picked randomely (not fully random -> be aware of block manipulation by miners)
        payable(winner).transfer(address(this).balance);

        //empies the old lottery and starts new one
        players = new address[](0);

        console.log("Test winner post reset", winner);

        return (winner);
    }

    function getBalance(address _user) external view returns (uint256) {
        return address(_user).balance;
    }

    function getWinner() external view returns (address) {
        return winner;
    }

    function getManager() external view returns (address) {
        return manager;
    }
}
