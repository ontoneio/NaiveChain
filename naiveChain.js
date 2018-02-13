'use strict';
const CryptoJS = require("crypto-js");
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");

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
// Storing the blocks
const getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "JAM Genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};
const blockchain = [getGenesisBlock()];
// Validate Integrity of Blocks