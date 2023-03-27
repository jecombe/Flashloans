import OpenSea2 from "./OpenSea.js";

// USE THIS FOR GOERLI

const opensea = new OpenSea2("0x00000000000001ad428e4906aE43D8F9852d0dD6");
const buyNft = async (tokenId, collecitonAddr) => {
    const tx = await opensea.buy(collecitonAddr, tokenId)
    console.log('Tx: ', tx);
}

 buyNft("1737", "0x56c59a204f2f7c38fedbee7a6cb6940f712ea300")