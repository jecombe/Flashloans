import { ethers } from 'ethers';
import _ from 'lodash';
import Sudoswap from './exchanges/Sudoswap.js';
import OpenSea from './exchanges/OpenSea.js';

export default class {
    constructor(options) {
        this.exchanges = [
            {

                amm: new Sudoswap(),
                toCompare: [new OpenSea()]
            },
            // {

            //     amm: new SoonSwap(),
            //     toCompare: [new OpenSea()]

            // }
        ];
    }

    getDifference(compare, exchangeA, toCompare, exchangeB) {
        console.log(compare);
        const grossDifference = compare.
            console.log(`COMPARE COLLECTION ${compare.name} ON ${exchangeA} TO ${exchangeB}`);
    }


    comparePrices(exchangeToCompare, amm, collectionAddr, exchangeToBuy) {
        //console.log(exchangeToCompare, collection, collectionAddr);
        
        const priceInEth = Number(ethers.formatUnits(
            `${amm.collections[collectionAddr].sellQuote}`,
            18
        )).toFixed(4)
        // console.log(priceInEth, exchangeToCompare, collectionAddr);
        const difference = priceInEth - Number(exchangeToCompare[0].price);
        if (difference > 0) {
            console.log(`MAYBE PROFITABLE ARBITRAGE NFT ${exchangeToCompare[0].tokenId} ON COLLECTION ${amm.collections[collectionAddr].name} BUY_PRICE_${exchangeToBuy.exchange}: ${exchangeToCompare[0].price} SELL_PRICE_${amm.exchange}: ${priceInEth} FOR DIFFERENCE ${difference}` );
           //exchangeToBuy.this.getNftProfitable();
        }
        // console.log(compare);
        // console.log(Object.keys(compare));


        // Object.keys(response[compare]).forEach(element => {
        //     console.log("==============================",element);
        // });
        // console.log(response[compareArray[0]], response[toCompareArray[0]]);


    }

    manageExchanges(responses) {
        const length = responses.length - 1;
        responses.forEach((element, index) => {

            responses.forEach((el, i) => {
                if (i === index) return;
                //console.log(Object.keys(element));
                // console.log('start', el, 'fin');
                this.comparePrices(element, el)

            });
        });
    }

    async manageArbitrage(element) {
        const promises = [];
        const { amm, toCompare } = element;

        await amm.getTrendingCollections();
        for await (const collectionAddr of Object.keys(amm.collections)) {
            // console.log(collectionAddr,'fin');
            for await (const exchange of toCompare) {
                const rep = await exchange.getNftsOnCollection(collectionAddr);
                // console.log(rep);

                if (_.isEmpty(rep)) console.log(`COLLECTION ${amm.collections[collectionAddr].name}  NOT FOUND ON ${exchange.exchange}`);

                else this.comparePrices(rep, amm, collectionAddr, exchange)
            }
        }




        //        this.manageExchanges(response)
        // return this.manageArbitrage(element);
    }


    async start() {
        try {

            this.exchanges.forEach(element => {
                //  console.log(element);
                this.manageArbitrage(element)
            });

            // await this.manageArbitrage()
            //  console.log(rep);
            //  const nfts = await this.sudoswap.getNftsOnCollections();
            //  Object.keys(nfts).forEach(element => {
            //     if (nfts[element].name === 'Webaverse Genesis Pass') console.log(nfts[element], nfts[element].nfts );
            //  });

            // const nfts = await this.sudoswap.getNftsOnCollection('0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B');
            // console.log(nfts);
            //await this.sudoswap.getNftmetaData('0xED5AF388653567Af2F388E6224dC7C4b3241C544', '1543')
            // {
            //     id: '0xb3041791fefe9284074713e4e14a6c4ddeeb57f9',
            //     collection: { id: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b' },
            //     owner: { id: '0x2079c29be9c8095042edb95f293b5b510203d6ce' },
            //     token: null,
            //     type: '2',
            //     assetRecipient: '0x0000000000000000000000000000000000000000',
            //     bondingCurve: '0x432f962d8209781da23fb37b6b59ee15de7d9841',
            //     delta: '1040000000000000000',
            //     fee: '30000000000000000',
            //     spotPrice: '4730001260379510219',
            //     nftIds: [
            //       '1175',  '1674',  '3489',  '3566',
            //       '3671',  '3769',  '4281',  '4414',
            //       '5798',  '7608',  '7828',  '8529',
            //       '8647',  '8821',  '8870',  '9670',
            //       '9913',  '10399', '11505', '11951',
            //       '13285', '13513', '13756', '14071',
            //       '15723', '15977', '16872', '16896',
            //       '16942', '17117', '17336', '17692',
            //       '17717', '18378'
            //     ],
            //     ethBalance: '977601129121582439',
            //     tokenBalance: null,
            //     ethVolume: '1442138387444966139425'
            //   }

        } catch (error) {
            console.log(error);
        }

        // console.log("END", this.collections['0x764aeebcf425d56800ef2c84f2578689415a2daa'].platforms.OPENSEA.nfts);
        // console.log("END2", this.collections['0x764aeebcf425d56800ef2c84f2578689415a2daa'].platforms.X2Y2.nfts);

        // for await (const element of Object.keys(this.collections)) {
        //   const promises = [this.getPriceRarible(element), this.getPriceOpenSea(element) ]
        //   const res = await Promise.all(promises)
        //   console.log(res);
        //     // console.log(this.collections);
        //     // this.collections[Object.keys(element)[0]].rarible = pricesRarible;
        // }

        //const priceOpenSea = await this.getPriceOpenSea() 
    }
}