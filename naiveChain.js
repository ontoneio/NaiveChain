//Block Structure
class Block {
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash.toString();
  };
};
// Block Hash
const calculateHash = (index, previousHash, timestamp, data, hash) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};
// Generate Block
const generateNextBlock = (blockData) => {
  let previousBlock = getLatestBlock();
  let nextIndex = previousBlock.index + 1;
  let nextTimeStamp = new Date().getTime() / 1000;
  let nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimeStamp, blockData);
  return new Block(nextIndex, previousBlock.hash, nextTimeStamp, blockData, nextHash);
};
