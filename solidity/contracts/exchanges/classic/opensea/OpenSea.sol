// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.13;

import "./SeaportInterface.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/*
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
*/
contract OpenSea is IERC721Receiver {
    AdditionalRecipient[] additionalRecipients;
    event Received(address, uint256);
    address transferManager;
    bytes public result;
    bytes public result2;

    // SellSeaport public SEAPORT;
    SeaportInterface public SEAPORT;

    constructor() {
        SEAPORT = SeaportInterface(0x00000000006c3852cbEf3e08E8dF289169EdE581);
        transferManager = 0x1E0049783F008A0085193E00003D00cd54003c71;

        IERC721(0x317a8Fe0f1C7102e7674aB231441E485c64c178A).setApprovalForAll(
            transferManager,
            true
        );
    }

    struct ParamsOpensea {
        address considerationToken;
        uint256 considerationIdentifier;
        uint256 considerationAmount;
        address offerer;
        address zone;
        address offerToken;
        uint256 offerIdentifier;
        uint256 offerAmount;
        uint256 orderType;
        uint256 startTime;
        uint256 endTime;
        bytes32 zoneHash;
        uint256 salt;
        bytes32 offererConduitKey;
        bytes32 fulfillerConduitKey;
        uint256 totalOriginalAdditionalRecipients;
        AdditionalRecipient[] additionalRecipients;
        bytes signature;
    }

    function buyErc721Opensea(bytes memory _params) external payable {
        ParamsOpensea memory orderParams = abi.decode(_params, (ParamsOpensea));

        BasicOrderParameters memory order = BasicOrderParameters({
            considerationToken: orderParams.considerationToken,
            considerationIdentifier: orderParams.considerationIdentifier,
            considerationAmount: orderParams.considerationAmount,
            offerer: payable(orderParams.offerer), // your address
            zone: orderParams.zone,
            offerToken: orderParams.offerToken, // tokenAddress
            offerIdentifier: orderParams.offerIdentifier,
            offerAmount: orderParams.offerAmount, // total amount
            basicOrderType: BasicOrderType.ETH_TO_ERC721_FULL_OPEN, // ETH_TO_ERC721_FULL_OPEN
            startTime: orderParams.startTime,
            endTime: orderParams.endTime,
            zoneHash: orderParams.zoneHash,
            salt: orderParams.salt,
            offererConduitKey: orderParams.offererConduitKey, //0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000,
            fulfillerConduitKey: orderParams.fulfillerConduitKey,
            totalOriginalAdditionalRecipients: orderParams
                .totalOriginalAdditionalRecipients,
            additionalRecipients: orderParams.additionalRecipients,
            signature: orderParams.signature
        });
        SEAPORT.fulfillBasicOrder{value: msg.value}(order);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
