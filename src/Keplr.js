// src/keplr.js
import { SigningStargateClient } from "@cosmjs/stargate";

// Cosmos Chain ID for the blockchain your DEX supports. Replace with your chain ID.
const COSMOS_CHAIN_ID = "cosmoshub-4";
const RPC_ENDPOINT = "https://rpc.cosmos.network"; // Replace with the RPC endpoint of your chosen chain

/**
 * Connect to Keplr Wallet and get user information
 */
export const connectKeplr = async () => {
    if (!window.keplr) {
        alert("Please install the Keplr extension");
        return null;
    }

    try {
        // Enable Keplr for the specific chain ID
        await window.keplr.enable(COSMOS_CHAIN_ID);

        // Get the offline signer from Keplr
        const offlineSigner = window.getOfflineSigner(COSMOS_CHAIN_ID);

        // Initialize the signing client
        const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, offlineSigner);

        // Get the user's account details
        const accounts = await offlineSigner.getAccounts();
        const address = accounts[0].address;

        return { client, address };
    } catch (error) {
        console.error("Error connecting to Keplr:", error);
        return null;
    }
};

/**
 * Query the balance of a specific token for the connected wallet address
 */
export const getBalance = async (address, denom) => {
    try {
        const response = await fetch(`${RPC_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}`);
        const data = await response.json();
        const balance = data.balances.find(bal => bal.denom === denom);
        return balance ? balance.amount : 0;
    } catch (error) {
        console.error("Error fetching balance:", error);
        return 0;
    }
};
