pragma solidity ^0.8.13;
pragma abicoder v2;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "./utils/Ownable.sol";
import "./Arbitrage.sol";

/*
import {FlashLoanSimpleReceiverBase} from "https://github.com/aave/aave-v3-core/blob/master/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "https://github.com/aave/aave-v3-core/blob/master/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "./utils/Ownable.sol";
import "./Arbitrage.sol";*/
interface IWETH9 is IERC20 {
    function deposit() external payable;

    function withdraw(uint256 wad) external;
}

contract Flashloan is FlashLoanSimpleReceiverBase, Arbitrage, Ownable {
    uint256 amountLoan;
    bytes paramsArb;
    IWETH9 public constant WETH =
        IWETH9(0xCCB14936C2E000ED8393A571D15A2672537838Ad);

    constructor(
        address _addressProvider
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {}

    /**
        This function is called after your contract has received the flash loaned amount
     */

    function wrap() external payable {
        //create WETH from ETH
        if (msg.value != 0) {
            WETH.deposit{value: msg.value}();
        }
        require(
            WETH.balanceOf(address(this)) >= msg.value,
            "Ethereum not deposited"
        );
    }

    function unwrap(address payable recipient, uint256 amount) internal {
        if (amount != 0) {
            WETH.transferFrom(msg.sender, address(this), amount);
            WETH.withdraw(amount);
            recipient.transfer(amount);
        }
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        //unwrap weth
        unwrap(payable(address(this)), amount);
        //start arbitrage
        this.startArbitrage{value: address(this).balance}();
        //unwrap
        this.wrap{value: amount}();
        // At the end of your logic above, this contract owes
        // the flashloaned amount + premiums.
        // Therefore ensure your contract has enough to repay
        // these amounts.

        // Approve the Pool contract allowance to *pull* the owed amount
        uint256 amountOwed = amount + premium;
        WETH.approve(address(POOL), amountOwed);
        return true;
    }

    function test(uint256 amount) external {
        //decode(_params);
        unwrap(payable(address(this)), amount);
        this.startArbitrage{value: address(this).balance}();
        this.wrap{value: amount}();
    }

    function requestFlashLoan(bytes calldata _params) external {
        // paramsArb = _params;
        address receiverAddress = address(this);

        bytes memory params = "";
        uint16 referralCode = 0;

        decode(_params);

        POOL.flashLoanSimple(
            receiverAddress,
            parameters.token,
            parameters.amount,
            params,
            referralCode
        );
    }

    function getBalance(address _tokenAddress) public view returns (uint256) {
        return WETH.balanceOf(address(this));
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        //IERC20 token = IERC20(_tokenAddress);
        WETH.transfer(msg.sender, WETH.balanceOf(address(this)));
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    //function() external payable {}

    function rugPull() external payable onlyOwner {
        // withdraw all ETH
        msg.sender.call{value: address(this).balance}("");
    }
}
