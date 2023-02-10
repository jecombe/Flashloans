// import axios from 'axios'

import ArbitrageNft from "./ArbitrageNft.js";



// const request = (endpoint, data = {}) => {
//     const opt = {
//         url: `https://api.rarible.org/v0.1${endpoint}`,
//         method: 'GET',
//          data
//     }
//     return axios(opt)
// }

// const arrayCollections = (array) => {
//    return  array.reduce((acc, el) => {
//         if (el.blockchain === 'ETHEREUM') {
//             acc[el.id] = el
//         }
//         return acc;
//     }, {})
// }

// const start = async () => {
//     console.log('start');
//     try {
//         const r = await request('/data/trending/collections',{
//             blockchain: 'ETHEREUM',
//             period: 'D1',
//             limit: 50,
//         });
//         console.log(r.data);
//     //     const collections = arrayCollections(r.data.collections);
//     //    console.log(collections);
//         // console.log(r);
//         // r.data.collections.forEach(element => {
//         //     console.log(element);
            
//         // });

//     } catch (error) {
//         console.log(error);

//     }
// }
// start()

const options = {
    platforms: ['OPENSEA', "X2Y2"],
    numberTrending: 5,
    numberNfts: 5
}
const arbitrage = new ArbitrageNft(options)

arbitrage.start()