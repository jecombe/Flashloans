pragma solidity ^0.8.13;
pragma abicoder v2;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import "./utils/Ownable.sol";
import "./Arbitrage.sol";

interface IWETH9 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    receive() external payable;

    function deposit() external payable;

    function withdraw(uint256 wad) external;

    function totalSupply() external view returns (uint256);

    function approve(address guy, uint256 wad) external returns (bool);

    function transfer(address dst, uint256 wad) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint256 wad
    ) external returns (bool);
}

contract Flashloan is FlashLoanSimpleReceiverBase, Arbitrage, Ownable {
    uint256 amountLoan;
    bytes paramsArb;
    IWETH9 WETH;

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        WETH = IWETH9(payable(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2));
    }

    /**
        This function is called after your contract has received the flash loaned amount
     */

    function wrap(uint256 amount) internal {
        //create WETH from ETH
        if (amount != 0) {
            WETH.deposit{value: amount}();
        }
        require(
            WETH.balanceOf(address(this)) >= amount,
            "Ethereum not deposited"
        );
    }

    function unwrap(uint256 amount) internal {
        if (amount != 0) {
            WETH.withdraw(amount);
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
        unwrap(amount);
        startArbitrage();
        wrap(amount);
        // This contract now has the funds requested.
        // Your logic goes here.
        //

        // At the end of your logic above, this contract owes
        // the flashloaned amount + premiums.
        // Therefore ensure your contract has enough to repay
        // these amounts.

        // Approve the Pool contract allowance to *pull* the owed amount
        uint256 amountOwed = amount + premium;
        WETH.approve(address(POOL), amountOwed);

        return true;
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

    function getBalance() public view returns (uint256) {
        return WETH.balanceOf(address(this));
    }

    function withdraw() external onlyOwner {
        WETH.transfer(msg.sender, WETH.balanceOf(address(this)));
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function rugPull() external payable onlyOwner {
        // withdraw all ETH
        msg.sender.call{value: address(this).balance}("");
    }

    function getERC20Balance() public view returns (uint256) {
        return WETH.balanceOf(address(this));
    }
}
