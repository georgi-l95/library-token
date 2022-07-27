const { ethers } = require("ethers");
const LIBWrapper = require("../artifacts/contracts/LIBWrapper.sol/LIBWrapper.json");
const LIBToken = require("../artifacts/contracts/LIB.sol/LIB.json");
const run = async function () {
  const providerURL = "http://localhost:8545";
  const walletPrivateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wrapperContractAddress = "0xe30B97dEF3B5F08E8c69B498a93A7A5d82505F67";

  //   const provider = new ethers.providers.JsonRpcProvider(providerURL);
  const provider = new hre.ethers.providers.InfuraProvider(
    "ropsten",
    "40c2813049e44ec79cb4d7e0d18de173"
  );
  const wallet = new ethers.Wallet(walletPrivateKey, provider);

  const wrapperContract = new ethers.Contract(
    wrapperContractAddress,
    LIBWrapper.abi,
    wallet
  );

  const libAddress = await wrapperContract.LIBToken();
  const tokenContract = new ethers.Contract(libAddress, LIBToken.abi, wallet);

  console.log(libAddress);

  const wrapValue = ethers.utils.parseEther("1");

  const wrapTx = await wrapperContract.wrap({ value: wrapValue });
  await wrapTx.wait();

  let balance = await tokenContract.balanceOf(wallet.address);
  console.log("Balance after wrapping:", balance.toString());

  let contractETHBalance = await provider.getBalance(wrapperContractAddress);
  console.log(
    "Contract LIB balance after wrapping:",
    contractETHBalance.toString()
  );

  const approveTx = await tokenContract.approve(
    wrapperContractAddress,
    wrapValue
  );
  await approveTx.wait();

  const unwrapTx = await wrapperContract.unwrap(wrapValue);
  await unwrapTx.wait();

  balance = await tokenContract.balanceOf(wallet.address);
  console.log("Balance after unwrapping:", balance.toString());
  contractETHBalance = await provider.getBalance(wrapperContractAddress);
  console.log(
    "Contract ETH balance after unwrapping:",
    contractETHBalance.toString()
  );
};

run();
