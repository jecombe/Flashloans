// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//import "./interfaces/IRouter.sol";

/// ============ Structs ============
struct PairSwapSpecific {
    address pair;
    uint256[] nftIds;
}

struct PairSwapAny {
    address pair;
    uint256 numItems;
}


// Sudoswap, source: https://github.com/sudoswap/lssvm/blob/9e8ee80f60682b8f3f73163f1870ff28f7e07668/src/LSSVMRouter.sol
interface IRouter {
    /// @notice Buy NFT on sudoswap
    function swapETHForSpecificNFTs(
        PairSwapSpecific[] calldata swapList,
        address payable ethRecipient,
        address nftRecipient,
        uint256 deadline
    ) external payable;

    function swapETHForAnyNFTs(
        PairSwapAny[] calldata swapList,
        address payable ethRecipient,
        address nftRecipient,
        uint256 deadline
    ) external payable;

    /// @notice Sell NFT on sudoswap
    function swapNFTsForToken(
        PairSwapSpecific[] calldata swapList,
        uint256 minOutput,
        address tokenRecipient,
        uint256 deadline
    ) external;
}

interface IPair {
    /// @notice Buy NFT on sudoswap
    function swapTokenForSpecificNFTs(
        uint256[] calldata nftIds,
        uint256 maxExpectedTokenInput,
        address nftRecipient,
        bool isRouter,
        address routerCaller
    ) external payable returns (uint256 inputAmount);

    function swapTokenForAnyNFTs(
        uint256 numNFTs,
        uint256 maxExpectedTokenInput,
        address nftRecipient,
        bool isRouter,
        address routerCaller
    ) external payable;

    /// @notice Sell NFT on sudoswap
    function swapNFTsForToken(
        uint256[] calldata nftIds,
        uint256 minExpectedTokenOutput,
        address payable tokenRecipient,
        bool isRouter,
        address routerCaller
    ) external returns (uint256 outputAmount);
}

contract SudoSwap is IERC721Receiver {
    /// @dev Sudoswap contract
    IRouter internal immutable LSSVM;
    address internal router = 0x2B2e8cDA09bBA9660dCA5cB6233787738Ad68329;

    /// @notice Creates a new instant sell contract
    constructor() {
        // Setup Sudoswap contract (0x2B2e8cDA09bBA9660dCA5cB6233787738Ad68329)
        LSSVM = IRouter(router);
    }

    

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function executeSell(
        bytes memory data,
        address collection,
        uint256 minOutput,
        address tokenRecipient,
        uint256 deadline
    ) external {
        // Give Sudoswap approval to execuate sell (0x2B2e8cDA09bBA9660dCA5cB6233787738Ad68329)

        IERC721(collection).setApprovalForAll(router, true);

        // Decode variables passed in data
        PairSwapSpecific memory swap = abi.decode(data, (PairSwapSpecific));
        PairSwapSpecific[] memory swapList = new PairSwapSpecific[](1);
        swapList[0] = swap;

        // sell NFT via Swap NFT
        LSSVM.swapNFTsForToken(swapList, minOutput, tokenRecipient, deadline);
    }
}
