import axios from 'axios';
import _ from 'lodash';

export default class {

    constructor(utils) {
        this.exchange = 'sudoswap'
        this.collections = {
        }
        this.utils = utils;
    }

    async request(url, data = {}, method, headers) {
        let opt = {}
        if (method === 'GET') {
            opt = {
                url,
                params: data,
                method,
                headers
            }
        } else {
            opt = {
                url,
                data,
                method,
                headers
            }

        }
        return axios(opt)
    }

    async getNftmetaData(contractAddress, tokenId) {

        const url = "https://sudoapi.xyz/v1/alchemy/getNFTMetadata"
        const body = {
            contractAddress,
            tokenId
        }

        const headers = {
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "Referer": "https://sudoswap.xyz/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }

        const rep = await this.request(url, body, "GET", headers)
        console.log(rep.data.id.tokenMetadata);

    }


    async getNftsOnCollection(collectionAddr, name) {

        const headers = {
            "content-type": "application/json",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "Referer": "https://sudoswap.xyz/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        const addr = collectionAddr.toLowerCase()
        const body = `{\"query\":\"\\n      {\\n        collection(id: \\\"${addr}\\\") {\\n          pairs(first: 900, skip: 0) {\\n    id\\n    collection {\\n      id\\n    }\\n    owner {\\n      id\\n    }\\n    token {\\n      id\\n      name\\n      symbol\\n      decimals\\n    }\\n    type\\n    assetRecipient\\n    bondingCurve\\n    delta\\n    fee\\n    spotPrice\\n    nftIds\\n    ethBalance\\n    tokenBalance\\n    ethVolume}\\n        }\\n      }\"}`;

        try {
            const rep = await this.request('https://api.thegraph.com/subgraphs/name/zeframlou/sudoswap', body, 'POST', headers)
            return rep.data.data.collection.pairs.reduce((acc, el) => {
                //  if (name == 'Genuine Undead') console.log(el);
                if (!_.isEmpty(el.nftIds)) {

                    acc.push({
                        ids: el.nftIds,
                        fee: el.fee,
                        spotPrice: el.spotPrice,
                        ownerId: el.owner.id

                    })
                }
                return acc;

            }, [])
        } catch (error) {
            return error;
        }

        // console.log(rep.data.data.collection.pairs, name);
    }


    async getNftsOnCollections() {
        for await (const collection of Object.keys(this.collections)) {
            console.log(this.collections[collection].name);
            const res = await this.getNftsOnCollection(collection, this.collections[collection].name)
            this.collections[collection].nfts = res
        }
        return this.collections
    }


    async getNft(data) {
        const header = {
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "Referer": "https://sudoswap.xyz/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        };
        const rep = await this.request('https://sudoapi.xyz/v1/collections', data, "GET", header)
        return rep.data.collections.reduce((acc, el) => {
            //if (Number(el.analytics.volume_24_hour) !== 0)
            if (Number(el.sell_quote) && Number(el.buy_quote)) {

                acc[el.address] = {
                    name: el.name,
                    symbol: el.symbol,
                    sellQuote: Number(el.sell_quote),
                    buyQuote: Number(el.buy_quote),
                    tvl: Number(el.offer_tvl),
                    id: el._id,
                    nfts: []
                }
            }
            return acc;
        }, {})
    }

    async getTrendingCollections(number = 20) {

        // fetch("https://sudoapi.xyz/v1/collections?sort=volume_all_time&desc=true&pageNumber=1", {
        //     "headers": {
        //       "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
        //       "sec-ch-ua-mobile": "?0",
        //       "sec-ch-ua-platform": "\"macOS\"",
        //       "Referer": "https://sudoswap.xyz/",
        //       "Referrer-Policy": "strict-origin-when-cross-origin"
        //     },
        //     "body": null,
        //     "method": "GET"
        //   });
        let i = 1;
        const promises = []
        while (i !== number) {
            const data = {
                sort: 'volume_all_time',
                desc: true,
                pageNumber: i,
            }
            i += 1;;
            promises.push(this.getNft(data));
        }
        try {

            const rep = await Promise.all(promises);
            let newObj = {}
            rep.forEach(obj => {
                newObj = { ...newObj, ...obj };
            });
            this.collections = newObj;
            return this.collections;
        } catch (error) {

        }
        // try {
        //     const rep = await this.request('https://sudoapi.xyz/v1/collections', data, "GET", header)

        //     this.collections = rep.data.collections.reduce((acc, el) => {
        //         //if (Number(el.analytics.volume_24_hour) !== 0)
        //         if (Number(el.sell_quote) && Number(el.buy_quote)) {

        //             acc[el.address] = {
        //                 name: el.name,
        //                 symbol: el.symbol,
        //                 sellQuote: Number(el.sell_quote),
        //                 buyQuote: Number(el.buy_quote),
        //                 tvl: Number(el.offer_tvl),
        //                 id: el._id,
        //                 nfts: []
        //             }
        //         }
        //         return acc;
        //     }, {})
        //     return this.collections;

        // } catch (error) {
        //     return error;
        // }

    }

}