import opensea from 'opensea-js';
import ethers from 'ethers';
import dotenv from 'dotenv';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
dotenv.config();
const factoryAbi = require("./Seaport.json");
import Web3 from "web3";
import axios from 'axios';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default class {
    constructor(seaportAddress) {
        this.provider = new HDWalletProvider({
            mnemonic: {
                phrase: process.env.MEMO_PHRASES
            },
            providerOrUrl: process.env.PROVIDER
        });
        this.customHttpProvider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
        this.wallet = new ethers.Wallet(process.env.SECRET_KEY, this.customHttpProvider);

        this.seaport = new opensea.OpenSeaPort(this.provider, {
            networkName: opensea.Network.Goerli,
            //networkName: opensea.Network.Main,

            //apiKey: process.env.KEY_OPENSEA

        });
        this.contractWithSigner = new ethers.Contract(seaportAddress, factoryAbi, this.wallet);
    }

    async getOrder(side, tokenId, assetContractAddress) {

        return this.seaport.api.getOrder({
            side,
            assetContractAddress,
            tokenId,
        })
    }

    createOrder(order) {
        const basicOrderParameters = {
            considerationToken: order.protocolData.parameters.consideration[0].token,
            considerationIdentifier: Number(ethers.BigNumber.from('0').toString()),
            considerationAmount: undefined,
            offerer: undefined,
            zone: order.protocolData.parameters.zone,
            offerToken: undefined,
            offerIdentifier: undefined,
            offerAmount: 1,
            basicOrderType: 0,
            startTime: undefined,
            endTime: undefined,
            zoneHash: order.protocolData.parameters.zoneHash,
            salt: undefined,
            offererConduitKey: order.protocolData.parameters.conduitKey,
            fulfillerConduitKey: order.protocolData.parameters.conduitKey,
            totalOriginalAdditionalRecipients: undefined,
            additionalRecipients: [],
            signature: undefined
        }

        basicOrderParameters.offerer = ethers.utils.getAddress(order.maker.address);
        basicOrderParameters.offerToken = order.protocolData.parameters.offer[0].token;
        basicOrderParameters.offerIdentifier = ethers.BigNumber.from(order.protocolData.parameters.offer[0].identifierOrCriteria).toString();
        basicOrderParameters.startTime = order.listingTime;
        basicOrderParameters.endTime = order.expirationTime;
        basicOrderParameters.salt = order.protocolData.parameters.salt;
        basicOrderParameters.totalOriginalAdditionalRecipients = order.protocolData.parameters.totalOriginalConsiderationItems - 1
        basicOrderParameters.signature = order.protocolData.signature;
        for (let consider of order.protocolData.parameters.consideration) {
            if (consider.recipient === basicOrderParameters.offerer) {
                basicOrderParameters.considerationAmount = ethers.BigNumber.from(consider.startAmount).toString();
                continue;
            }
            basicOrderParameters.additionalRecipients.push({
                amount: ethers.BigNumber.from(consider.startAmount).toString(),
                recipient: consider.recipient
            },
            );
        }

        return basicOrderParameters;
    }

    sendOrder(orderPayload, price) {
        return this.contractWithSigner.fulfillBasicOrder(orderPayload,
            {
                gasLimit: 300000,
                value: ethers.BigNumber.from(price)
            })
    }

    getSignature(order) {
        const payload = {
            orderHash: order.orderHash,
            protocol: order.protocolAddress,
            wallet: order.maker.address
        }
        const options = {
            method: 'POST',
            url: 'https://testnet-api.opensea.io/v2/listings/fulfillment_data',
            headers: {
                'X-API-KEY': 'a0672943ce854d16a94e4509aa388ef1',
                'content-type': 'application/json'
            },
            data: {
                listing: {
                    hash: payload.orderHash,
                    chain: 'ethereum',
                    protocol_address: payload.protocol
                },
                fulfiller: { address: payload.wallet }
            }
        };

        return axios
            .request(options)

    }

    async buy(collectionAddr, tokenId) {
        try {
            const order = await this.getOrder('ask', tokenId, collectionAddr)
            await sleep(1000);
            const orderPayload = this.createOrder(order)
         console.log(order);
            const signature = await this.getSignature(order);
            const sg = signature.data.fulfillment_data.transaction.input_data.parameters.signature;
            console.log(signature.data.fulfillment_data.transaction.input_data.parameters.signature);

            orderPayload.signature = sg;
            // const response = await this.sendOrder(orderPayload, order.currentPrice)
            // console.log("transaction pending: ", response.hash);
            // return response.wait();
            //const res = Web3EthAbi.encodeFunctionSignature("0x0000000000000000000000000000000000000000", 0, 9750000000000000, "0xBc946Ee42fe482A7d1D83D6B68F0D0529E141610","0x0000000000000000000000000000000000000000","0x317a8Fe0f1C7102e7674aB231441E485c64c178A", 540219, 1,1675207801,1677627001,"0x0000000000000000000000000000000000000000000000000000000000000000", "0x360c6ebe000000000000000000000000000000000000000003e13fafe88ec3f9","0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",1,"");
            //console.log(res);
            const res =
            {
                "basicOrderParameters": {
                    "considerationToken": 'address',
                    "considerationIdentifier": 'uint256',
                    "considerationAmount": 'uint256',
                    "offerer": 'address',
                    "zone": 'address',
                    "offerToken": 'address',
                    "offerIdentifier": 'uint256',
                    "offerAmount": 'uint256',
                    "basicOrderType": 'uint8',
                    "startTime": 'uint256',
                    "endTime": 'uint256',
                    "zoneHash": 'bytes32',
                    "salt": 'uint256',
                    "offererConduitKey": 'bytes32',
                    "fulfillerConduitKey": 'bytes32',
                    "totalOriginalAdditionalRecipients": 'uint256',
                    "additionalRecipients[]": {
                        "amount": "uint256",
                        "recipient": "address"
                    },
                    "signature": 'bytes'
                }
            };
            const web3 = new Web3;
            const encodeP = web3.eth.abi.encodeParameter(res, orderPayload);
            console.log(encodeP);
            const encodeParams = {
                "encodeParams": {
                    "token": "address",
                    "amount": "uint256",
                    "exchange1": "uint256",
                    "exchange2": "uint256",
                    "byteExchange1": "bytes"
                }

            }
            const payload = {
                token: "0xCCB14936C2E000ED8393A571D15A2672537838Ad", //"0xCCB14936C2E000ED8393A571D15A2672537838Ad",
                amount: ethers.BigNumber.from("10000000000000000").toString(),
                exchange1: 1,
                exchange2: 2,
                byteExchange1: encodeP
            }


            const encode = web3.eth.abi.encodeParameter(encodeParams, payload);
            console.log(encode);

        } catch (error) {
            console.log(error, "eeeeeeee");
        }
    }


    //    async buy(tokenAddress, tokenId) {
    //     const query = {
    //         asset_contract_address: tokenAddress, //
    //         token_ids: [tokenId],
    //         side: OrderSide.Sell

    //     }

    //     const {orders, count} = await this.seaport.api.getOrders(query)
    //     console.log(orders);
    //    }


    /*    async buy() {
    
    
            const provider = new ethers.providers.JsonRpcProvider(
                "https://goerli.infura.io/v3/81e15a8a445c4533bc162fda86a60ff1"
            );
            const signer = new ethers.Wallet("3ab0d293af1b84c2eddaa75198ef710a85e06a1b9aafe9e01fdad8275c922f44", provider);
    
            const offerer = "0xd452c6230A575A147C4207d7c54E482d0b078d45"
            const seaport = new Seaport(signer);
    
            const { executeAllActions } = await seaport.createOrder(
                {
                    offer: [
                        {
                            itemType: 2,
                            token: "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b",
                            identifier: "1170751"
                        },
                    ],
                    consideration: [
                        {
                            amount: ethers.utils.parseEther("1").toString(),
                            recipient: offerer,
                        },
                    ],
                },
                offerer
            );
        
            // const signedOrder = await seaport.signOrder(order);
            // console.log(signedOrder);
           const order = await executeAllActions();
          console.log(order);
        }*/
}