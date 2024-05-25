require("dotenv").config();
const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../contracts/abi/Depositor.json");
const ERC20MockABI = require("../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    currentChainID,
    getWallet,
    getCurrentChainId,
} = require("./helper")

async function approveToken(wallet, tokenAddress, amountIn) {
    const tokenContract = new Contract(tokenAddress, ERC20MockABI, wallet);
    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), 18);

    const tx = await tokenContract.approve(DEPOSITOR_ADDRESS, amountInWei);
    console.log(tx.toString());
}

async function deposit(tokenSymbol, amountIn) {
    const wallet = getWallet(currentChainID);

    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);
    console.log(depositorContract);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"][tokenSymbol];
    const tokenAddress = tokenInfo.address;
    const tokenDecimals = tokenInfo.decimals;

    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenDecimals);
    const value = ethers.utils.parseEther("0.002");
    const gasLimit = ethers.utils.hexlify(1000000);
    await approveToken(wallet, tokenAddress, amountIn);

    const tx = await depositorContract.deposit(tokenAddress, amountInWei, {
        gasLimit: gasLimit,
        value: value,
    });
    await tx.wait();
    console.log(tx.hash);
}

module.exports = {
    deposit
}