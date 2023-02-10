import axios from 'axios';
import _ from 'lodash';
import { ethers } from 'ethers';

const headersTwo = {
    'authority': 'api.uniswap.org',
    'accept': '*/*',
    'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': ' application/json',
    'origin': 'https://app.uniswap.org',
    'referer': 'https://app.uniswap.org/',
    'sec-ch-ua': "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': "macOS",
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
}
export default class {

    constructor() {
        this.exchange = 'opensea'
        this.collections = {
            [this.exchange]:{}
        }

    }

 
    async request(url, data = {}, method, headers) {
        const opt = {
            url,
            data,
            method,
            headers
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

    async getRouteNft(id, tokenId, price, exchange, collection, collectionName) {
        const priceInEth = ethers.utils.parseUnits(
            `${price}`,
            18
        );
        const option = `{\"sell\":[{\"symbol\":\"ETH\",\"name\":\"Ethereum\",\"decimals\":null,\"address\":\"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\",\"tokenType\":\"ERC20\",\"tokenId\":\"ETH\",\"amount\":1,\"priceInfo\":{\"basePrice\":\"${priceInEth.toString()}\",\"baseAsset\":\"ETH\",\"ETHPrice\":\"${priceInEth.toString()}\"}}],\"buy\":[{\"id\":\"${id}\",\"symbol\":\"ETH\",\"name\":\"\",\"decimals\":18,\"address\":\"${collection}\",\"tokenType\":\"ERC721\",\"tokenId\":\"${tokenId}\",\"marketplace\":\"${exchange.toLowerCase()}\",\"collectionName\":\"${collectionName}\",\"amount\":1,\"priceInfo\":{\"basePrice\":\"${priceInEth.toString()}\",\"baseAsset\":\"ETH\",\"ETHPrice\":\"${priceInEth.toString()}\"}}],\"sender\":\"${myAddr}\"}`;

        const test = await this.request('https://temp.api.uniswap.org/v1/nft/route', option, "POST", headersThree);

        if (_.isEmpty(test.data.route)) return false;

        return true;

    }

    async getNftProfitable(){

    }

    async getNftsOnCollection(collection) {
     
 // const option = "{\"operationName\":\"Asset\",\"variables\":{\"orderBy\":\"PRICE\",\"asc\":true,\"filter\":{\"listed\":true,\"marketplaces\":[\"OPENSEA\"],\"tokenSearchQuery\":\"\"},\"first\":25,\"address\":\"0xed5af388653567af2f388e6224dc7c4b3241c544\"},\"query\":\"query Asset($address: String!, $orderBy: NftAssetSortableField, $asc: Boolean, $filter: NftAssetsFilterInput, $first: Int, $after: String, $last: Int, $before: String) {\\n  nftAssets(\\n    address: $address\\n    orderBy: $orderBy\\n    asc: $asc\\n    filter: $filter\\n    first: $first\\n    after: $after\\n    last: $last\\n    before: $before\\n  ) {\\n    edges {\\n      node {\\n        id\\n        name\\n        ownerAddress\\n        image {\\n          url\\n          __typename\\n        }\\n        smallImage {\\n          url\\n          __typename\\n        }\\n        originalImage {\\n          url\\n          __typename\\n        }\\n        tokenId\\n        description\\n        animationUrl\\n        suspiciousFlag\\n        collection {\\n          name\\n          isVerified\\n          image {\\n            url\\n            __typename\\n          }\\n          creator {\\n            address\\n            profileImage {\\n              url\\n              __typename\\n            }\\n            isVerified\\n            __typename\\n          }\\n          nftContracts {\\n            address\\n            standard\\n            __typename\\n          }\\n          __typename\\n        }\\n        listings(first: 1) {\\n          edges {\\n            node {\\n              address\\n              createdAt\\n              endAt\\n              id\\n              maker\\n              marketplace\\n              marketplaceUrl\\n              orderHash\\n              price {\\n                currency\\n                value\\n                __typename\\n              }\\n              quantity\\n              startAt\\n              status\\n              taker\\n              tokenId\\n              type\\n              protocolParameters\\n              __typename\\n            }\\n            cursor\\n            __typename\\n          }\\n          __typename\\n        }\\n        rarities {\\n          provider\\n          rank\\n          score\\n          __typename\\n        }\\n        metadataUrl\\n        __typename\\n      }\\n      cursor\\n      __typename\\n    }\\n    totalCount\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n      hasPreviousPage\\n      startCursor\\n      __typename\\n    }\\n    __typename\\n  }\\n}\"}";
  //"method": "POST"
        //console.log(collection);
   //   const option = `{\"operationName\":\"Asset\",\"variables\":{\"orderBy\":\"PRICE\",\"asc\":true,\"filter\":{\"listed\":true,\"marketplaces\":[\"OPENSEA\"],\"tokenSearchQuery\":\"\"},\"first\":25,\"address\":\"${collection}\"},\"query\":\"query Asset($address: String!, $orderBy: NftAssetSortableField, $asc: Boolean, $filter: NftAssetsFilterInput, $first: Int, $after: String, $last: Int, $before: String) {\\n  nftAssets(\\n    address: $address\\n    orderBy: $orderBy\\n    asc: $asc\\n    filter: $filter\\n    first: $first\\n    after: $after\\n    last: $last\\n    before: $before\\n  ) {\\n    edges {\\n      node {\\n        id\\n        name\\n        ownerAddress\\n        image {\\n          url\\n          __typename\\n        }\\n        smallImage {\\n          url\\n          __typename\\n        }\\n        originalImage {\\n          url\\n          __typename\\n        }\\n        tokenId\\n        description\\n        animationUrl\\n        suspiciousFlag\\n        collection {\\n          name\\n          isVerified\\n          image {\\n            url\\n            __typename\\n          }\\n          creator {\\n            address\\n            profileImage {\\n              url\\n              __typename\\n            }\\n            isVerified\\n            __typename\\n          }\\n          nftContracts {\\n            address\\n            standard\\n            __typename\\n          }\\n          __typename\\n        }\\n        listings(first: 1) {\\n          edges {\\n            node {\\n              address\\n              createdAt\\n              endAt\\n              id\\n              maker\\n              marketplace\\n              marketplaceUrl\\n              orderHash\\n              price {\\n                currency\\n                value\\n                __typename\\n              }\\n              quantity\\n              startAt\\n              status\\n              taker\\n              tokenId\\n              type\\n              protocolParameters\\n              __typename\\n            }\\n            cursor\\n            __typename\\n          }\\n          __typename\\n        }\\n        rarities {\\n          provider\\n          rank\\n          score\\n          __typename\\n        }\\n        metadataUrl\\n        __typename\\n      }\\n      cursor\\n      __typename\\n    }\\n    totalCount\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n      hasPreviousPage\\n      startCursor\\n      __typename\\n    }\\n    __typename\\n  }\\n}\"}`;
        const option = `{\"operationName\":\"Asset\",\"variables\":{\"orderBy\":\"PRICE\",\"asc\":true,\"filter\":{\"listed\":true,\"marketplaces\":[\"OPENSEA\"],\"tokenSearchQuery\":\"\"},\"first\":25,\"address\":\"${collection.toLowerCase()}\"},\"query\":\"query Asset($address: String!, $orderBy: NftAssetSortableField, $asc: Boolean, $filter: NftAssetsFilterInput, $first: Int, $after: String, $last: Int, $before: String) {\\n  nftAssets(\\n    address: $address\\n    orderBy: $orderBy\\n    asc: $asc\\n    filter: $filter\\n    first: $first\\n    after: $after\\n    last: $last\\n    before: $before\\n  ) {\\n    edges {\\n      node {\\n        id\\n        name\\n        ownerAddress\\n        image {\\n          url\\n          __typename\\n        }\\n        smallImage {\\n          url\\n          __typename\\n        }\\n        originalImage {\\n          url\\n          __typename\\n        }\\n        tokenId\\n        description\\n        animationUrl\\n        suspiciousFlag\\n        collection {\\n          name\\n          isVerified\\n          image {\\n            url\\n            __typename\\n          }\\n          creator {\\n            address\\n            profileImage {\\n              url\\n              __typename\\n            }\\n            isVerified\\n            __typename\\n          }\\n          nftContracts {\\n            address\\n            standard\\n            __typename\\n          }\\n          __typename\\n        }\\n        listings(first: 1) {\\n          edges {\\n            node {\\n              address\\n              createdAt\\n              endAt\\n              id\\n              maker\\n              marketplace\\n              marketplaceUrl\\n              orderHash\\n              price {\\n                currency\\n                value\\n                __typename\\n              }\\n              quantity\\n              startAt\\n              status\\n              taker\\n              tokenId\\n              type\\n              protocolParameters\\n              __typename\\n            }\\n            cursor\\n            __typename\\n          }\\n          __typename\\n        }\\n        rarities {\\n          provider\\n          rank\\n          score\\n          __typename\\n        }\\n        metadataUrl\\n        __typename\\n      }\\n      cursor\\n      __typename\\n    }\\n    totalCount\\n    pageInfo {\\n      endCursor\\n      hasNextPage\\n      hasPreviousPage\\n      startCursor\\n      __typename\\n    }\\n    __typename\\n  }\\n}\"}`;

        const test = await this.request('https://api.uniswap.org/v1/graphql', option, "POST", headersTwo)
        return test.data.data.nftAssets.edges.reduce((acc, el) => {
           // console.log(el);
          //  const res = await acc;
            // const price = el.node.listings.edges[0].node.price.value;
            // const id = el.node.id;
            // const tokenId = el.node.tokenId;
          // const isAvailable = await this.getRouteNft(id, tokenId, price, exchange, collection, collectionName);
          //  if (isAvailable) {
           // console.log(el.node.listings.edges[0].node.price.value);
           //console.log(el.node);
                acc.push({
                    tokenId: el.node.tokenId,
                    id: el.node.id,
                    price: el.node.listings.edges[0].node.price.value
                })
           // }
            return acc;
        }, []);

    }


}