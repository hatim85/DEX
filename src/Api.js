const API_BASE_URL = "https://testnet.api.euclidprotocol.com/api/v1"; // Replace with actual base URL
const API_KEY = "your_api_key_here"; // Replace with your actual API key

/**
 * Utility function for making API requests
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request payload
 * @returns {Promise<object|null>} - JSON response or null in case of failure
 */
const apiRequest = async (endpoint, method = "GET", body = null) => {
    try {
        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        };

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            console.error(`API request failed: ${response.status} ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error during API request to ${endpoint}:`, error);
        return null;
    }
};

/**
 * Add Liquidity to a Pool
 * @param {Object} pairInfo - Information about the token pair (token_1 and token_2).
 * @param {string} token1Liquidity - Amount of liquidity to add for the first token.
 * @param {string} token2Liquidity - Amount of liquidity to add for the second token.
 * @param {number} slippageTolerance - Slippage tolerance in percentage (1-100).
 * @param {string} senderAddress - Address of the sender adding liquidity.
 * @param {string} chainUid - Chain UID of the sender.
 * @returns {Promise<Object|null>} - The response from the API or null in case of an error.
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
 * @param {Object} pair - Information about the token pair.
 * @param {string} lpAllocation - Amount of liquidity pool allocation to remove.
 * @param {string} senderAddress - Address of the sender removing liquidity.
 * @param {string} chainUid - Chain UID of the sender.
 * @param {string} vlpAddress - VLP contract address for the pool.
 * @param {Array<Object>} crossChainAddresses - (Optional) Cross-chain addresses for releasing the asset.
 * @param {number} [timeout=null] - (Optional) Timeout in seconds for the operation (min: 30, max: 240).
 * @returns {Promise<Object|null>} - The response from the API or null in case of an error.
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
 * @param {string} amountIn - The amount of the input asset being swapped in.
 * @param {string} assetIn - The asset ID of the input asset.
 * @param {string} assetOut - The asset ID of the output asset.
 * @param {string} contract - The router contract address for the swap.
 * @param {string} minAmountOut - The minimum amount of the output asset for the swap to be considered successful.
 * @param {Array<string>} swaps - A list of swaps to execute to get from `asset_in` to `asset_out`.
 * @returns {Promise<Object|null>} - The simulated result, including the amount of output asset.
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
        const payload = {
            amount_in: amountIn,
            asset_in: assetIn,
            asset_out: assetOut,
            contract: contract,
            min_amount_out: minAmountOut,
            swaps: swaps,
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Simulated Swap Response:", data);
        return data;
    } catch (error) {
        console.error("Error simulating swap:", error);
        return null;
    }
};
