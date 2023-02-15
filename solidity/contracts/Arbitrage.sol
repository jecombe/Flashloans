pragma solidity ^0.8.13;
pragma abicoder v2;
import "./exchanges/classic/opensea/OpenSea.sol";

contract Arbitrage is OpenSea {
    Params parameters;
    struct Params {
        address token;
        uint256 amount;
        uint256 nameExchange1;
        uint256 nameExchange2;
        bytes exchange1;
    }

    constructor() {}

    function decode(bytes calldata _params) internal {
        parameters = abi.decode(_params, (Params));
    }

    function dispatcher() internal {}



    function startArbitrage() internal {
        if (parameters.nameExchange1 == 0) {
            buyErc721Opensea(parameters.exchange1);
        }
    }
}
