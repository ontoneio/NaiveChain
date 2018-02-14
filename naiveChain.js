'use strict';
const CryptoJS = require("crypto-js");
const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : []; 

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
const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('!>>> Invalid index <<<!');
      return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('!>>> Invalid previousHash <<<!');
        return false
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log('!>>> Invalid hash: ' + calculateHash(newBlock) + ' ' + newBlock.hash);
        return false
    }
    return true
}
// Choose the longest chain
const replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());       
    } else {
        console.log('!>>> Received blockchain invalid <<<!');        
    }
};
// Controlling the node
const initHttpServer = () => {
    const app = express(); 
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.post('/mineBlock', (req, res) => {
        let newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};
