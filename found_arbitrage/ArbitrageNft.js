import _ from 'lodash';
import Sudoswap from './exchanges/Sudoswap.js';
import OpenSea from './exchanges/OpenSea.js';
import Logger from './utils/Logger.js';
import Utils from './utils/Utils.js';

export default class {
    constructor(params) {
        this.tokenLoan = params.tokenLoan;
        this.amount = params.amount;
        this.utils = new Utils();
        this.exchanges = [{
            amm: new Sudoswap(this.utils),
            toCompare: [new OpenSea(this.utils)]
        }];
    }

    isProfitableGas() {
        // calculate price gas and call flashloan cost
        return true;
    }

    getNumOfExchange(exchange1) {
        if (exchange1 === "opensea") return 1;

        if (exchange1 === 'sudoswsap') return 2;
    }

    encodingAllParams(exchange1, byteExchange2, amount) {
        const model = {
            "encodeParams": {
                "token": "address",
                "amount": "uint256",
                "exchange1": "uint256",
                "exchange2": "uint256",
                "byteExchange1": "bytes"
            }

        }

        const payload = {
            token: this.tokenLoan,
            amount: 1000000,
            exchange1: this.getNumOfExchange(exchange1.name),
            exchange2: 2,
            byteExchange1: exchange1.bytes
        }
        return this.utils.encodeAbi(model, payload)
    }

    async getParamsEncoding(exchangeToBuy, nft, collectionAddr) {
        try {
            const bytesParams = await exchangeToBuy.getParams(nft.tokenId, collectionAddr);
            const encodeParamsExchange1 = {
                bytes: bytesParams,
                name: exchangeToBuy.exchange
            }
            return this.encodingAllParams(encodeParamsExchange1, "", nft.price);

        } catch (error) {
            return error;
        }
    }

    callFlashloan(bytesAllParams) {
        // call flashloan with all params for flashloan and arbitrage parameters encoding
    }

    async comparePrices(nfts, amm, collectionAddr, exchangeToBuy) {
        const priceInEth = this.utils.convertToEth(amm.collections[collectionAddr].sellQuote);
        const difference = priceInEth - Number(nfts[0].price);
        if (difference > 0) {
            Logger.info(`Maybe profitable arbitrage ${nfts[0].tokenId} on collection ${amm.collections[collectionAddr].name} buy on ${exchangeToBuy.exchange}: ${nfts[0].price} sell to ${amm.exchange}: ${priceInEth} DIFFERENCE: ${difference}`);
            if (this.isProfitableGas()) {
                try {
                    const bytesAllParams = await this.getParamsEncoding(exchangeToBuy, nfts[0], collectionAddr);
                    console.log(bytesAllParams);
                    this.callFlashloan(bytesAllParams);

                } catch (error) {
                    Logger.error('CONMPARE PRICE ENCODING', error)

                }

            }
        }
    }

    manageExchanges(responses) {
        responses.forEach((element, index) => {
            responses.forEach((el, i) => {
                if (i === index) return;
                this.comparePrices(element, el);
            });
        });
    }

    async manageArbitrage(element) {
        const { amm, toCompare } = element;

        await amm.getTrendingCollections();
        for await (const collectionAddr of Object.keys(amm.collections)) {
            for await (const exchange of toCompare) {
                const nfts = await exchange.getNftsOnCollection(collectionAddr);
                if (_.isEmpty(nfts)) Logger.warn(`Collection ${amm.collections[collectionAddr].name} not found on ${exchange.exchange}`);

                else this.comparePrices(nfts, amm, collectionAddr, exchange)
            }
        }
    }


    async start() {
        Logger.trace('START ARBITRAGE');
        try {
            this.exchanges.forEach(element => {
                this.manageArbitrage(element)
            });
        } catch (error) {
            console.log(error);
        }
    }
}