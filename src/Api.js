const API_BASE_URL = "https://testnet.api.euclidprotocol.com/api/v1"; // Replace with the actual base URL

/**
 * Add Liquidity to a Pool
 */
export const addLiquidity = async ({
    pairInfo,
    token1Liquidity,
    token2Liquidity,
    slippageTolerance,
    senderAddress,
    chainUid,
}) => {
    try {
        const payload = {
            pair_info: pairInfo,
            sender: {
                address: senderAddress,
                chain_uid: chainUid,
            },
            slippage_tolerance: slippageTolerance,
            token_1_liquidity: token1Liquidity,
            token_2_liquidity: token2Liquidity,
        };

        const response = await fetch(`${API_BASE_URL}/execute/liquidity/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Add Liquidity Error: ${errorDetails}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Add Liquidity Response:", data);
        return data;
    } catch (error) {
        console.error("Error adding liquidity:", error);
        return null;
    }
};

/**
 * Remove Liquidity from a Pool
 */
export const removeLiquidity = async ({
    pair,
    lpAllocation,
    senderAddress,
    chainUid,
    vlpAddress,
    crossChainAddresses = [],
    timeout = null,
}) => {
    try {
        const payload = {
            cross_chain_addresses: crossChainAddresses,
            lp_allocation: lpAllocation,
            pair,
            sender: {
                address: senderAddress,
                chain_uid: chainUid,
            },
            timeout,
            vlp_address: vlpAddress,
        };

        const response = await fetch(`${API_BASE_URL}/execute/liquidity/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Remove Liquidity Error: ${errorDetails}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Remove Liquidity Response:", data);
        return data;
    } catch (error) {
        console.error("Error removing liquidity:", error);
        return null;
    }
};

/**
 * Simulate a Swap Transaction
 */
export const simulateSwap = async ({
    amountIn,
    assetIn,
    assetOut,
    contract,
    minAmountOut,
    swaps,
}) => {
    try {
        // Validate inputs
        if (typeof assetIn !== 'string' || typeof assetOut !== 'string') {
            throw new Error(
                `Invalid asset types. Expected strings but received assetIn: ${typeof assetIn}, assetOut: ${typeof assetOut}`
            );
        }

        const payload = {
            amount_in: amountIn,
            asset_in: assetIn, // Ensure this is a string
            asset_out: assetOut, // Ensure this is a string
            contract,
            min_amount_out: minAmountOut,
            swaps,
        };

        const response = await fetch(`${API_BASE_URL}/simulate-swap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error(`Simulate Swap Error: ${errorDetails}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Simulate Swap Response:", data);
        return data; // Should include amount_out and estimated_gas
    } catch (error) {
        console.error("Error simulating swap:", error.message);
        throw error;
    }
};


/**
 * Execute a Swap Transaction
 */
export const swapRequest = async ({
    amount_in,
    asset_in,
    asset_out,
    min_amount_out,
    sender,
    swaps,
    cross_chain_addresses = [],
    partner_fee = null,
    timeout = null,
}) => {
    try {
        // Prepare the payload for the swap request with nested `asset_in` and `sender` as JSON objects
        const payload = {
            amount_in,
            asset_in: {
                token: asset_in.token,
                token_type: {
                    smart: {
                        contract_address: asset_in.contract_address, // Dynamic contract address
                    },
                },
            },
            asset_out,
            min_amount_out,
            sender: {
                address: sender.address,
                chain_uid: sender.chain_uid, // The sender's chain UID
            },
            swaps,
            cross_chain_addresses,
            partner_fee,
            timeout,
        };

        // Sending POST request to the swap execution endpoint
        const response = await fetch(`${API_BASE_URL}/execute/swap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Swap Execution Error: ${errorDetails}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Swap Execution Response:", data);
        return data;
    } catch (error) {
        console.error("Error executing swap:", error);
        throw error;
    }
};
