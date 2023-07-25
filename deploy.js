const fs = require("fs");
const ethers = require("ethers");

// const solc = require("solc")

require("dotenv").config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  const encryptedKey = fs.readFileSync("./.encryptedKey.json", "utf8");

  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedKey,
    process.env.PRIVATE_KEY_PASSWORD
  );
  wallet = await wallet.connect(provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");

  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");

  const contract = await contractFactory.deploy();
  console.log(`Contract deployed to ${contract.address}`);

  const deploymentReceipt = await contract.deployTransaction.wait(1);

  let currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number: ${currentFavoriteNumber.toString()}`);

  console.log("Updating favorite number...");
  let transactionResponse = await contract.store("7");
  let transactionReceipt = await transactionResponse.wait(1);

  currentFavoriteNumber = await contract.retrieve();
  console.log(`New Favorite Number: ${currentFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
