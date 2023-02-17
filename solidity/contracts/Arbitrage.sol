pragma solidity ^0.8.13;
pragma abicoder v2;
import "./exchanges/classic/opensea/OpenSea.sol";

contract Arbitrage is OpenSea {
    Params parameters;
    struct Params {
        address token;
        uint256 amount;
        uint256 exchange1;
        uint256 exchange2;
        bytes byteExchange1;
    }

    constructor() {}

    function decode(bytes calldata _params) internal {
        parameters = abi.decode(_params, (Params));
    }

    function dispatcher() internal {}

    function startArbitrage() internal {
        if (parameters.exchange1 == 1) {
            buyErc721Opensea(parameters.byteExchange1);
        }
    }
}
