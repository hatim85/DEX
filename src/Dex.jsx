import React, { useState } from "react";
import { addLiquidity, removeLiquidity, simulateSwap, swapRequest } from "./Api.js";

const Dex = () => {
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [liquidityAmount, setLiquidityAmount] = useState("");
    const [swapAmount, setSwapAmount] = useState("");
    const [swapResult, setSwapResult] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [isKeplrConnected, setIsKeplrConnected] = useState(false);
    const [selectedTokenA, setSelectedTokenA] = useState("");
    const [selectedTokenB, setSelectedTokenB] = useState("");

    const chainData = [
        { chainId: "osmosis", name: "Osmosis", prefix: "osmo", contract: "osmo18gghjrgcp8gh0m2r796rku50385usc65euf3lqv8hs57mkx7guhqlrcx6d" },
        { chainId: "nibiru", name: "Nibiru", prefix: "nibi", contract: "nibi1rwrwsyny3ew703ru0k2tgscwktrqsw9kyg5ykaydrxy0fq7gz6ksuyqfnm" },
        { chainId: "neutron", name: "Neutron", prefix: "neutron", contract: "neutron1cpwa5pagnych4a42wj80k06wv7p3n39kzffdc8vczta3g0g0ee2spj5n3j" },
        { chainId: "coreum", name: "Coreum", prefix: "core", contract: "testcore18x9pxj50r39hsakzaanq2vq8xmdgxmwg5qr4ku34elwuqvexhv6s7l873c" },
        { chainId: "stargaze", name: "Stargaze", prefix: "stars", contract: "stars193jxyq40le6dpzs49ejfjh4my4yuule502fzmwycfn8ls30rlkjq9z6mxk" },
        { chainId: "vsl", name: "VSL", prefix: "vsl", contract: "nibi1hevc4apgvjwrvmxud483nmd4ayfffear8hpjd9arm0mzr9rsa9sq40j2rl" },
    ];

    const tokenData = {
        osmosis: ["OSMO", "ATOM", "JUNO"],
        nibiru: ["NIB", "UST"],
        neutron: ["NTRN"],
        coreum: ["CORE"],
        stargaze: ["STARS"],
        vsl: ["VSL", "VCOIN"],
    };

    const getChainForToken = (token) => {
        for (const chain of chainData) {
            if (tokenData[chain.chainId].includes(token)) {
                return chain;
            }
        }
        throw new Error(`Token ${token} is not associated with any chain.`);
    };

    const connectKeplr = async (chainId) => {
        if (!window.getOfflineSigner || !window.keplr) {
            alert("Please install the Keplr extension!");
            return;
        }

        try {
            await window.keplr.enable(chainId);
            const offlineSigner = window.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            setWalletAddress(accounts[0].address);
            setIsKeplrConnected(true);
            alert(`Connected to ${chainId}. Address: ${accounts[0].address}`);
        } catch (error) {
            console.error("Failed to connect to Keplr", error);
            alert("Failed to connect to Keplr. Please try again.");
        }
    };

    const handleAddLiquidity = async () => {
        const result = await addLiquidity({
            tokenA: selectedTokenA,
            tokenB: selectedTokenB,
            amountA,
            amountB,
            senderAddress: walletAddress,
        });

        if (result) {
            alert("Liquidity added successfully!");
        } else {
            alert("Failed to add liquidity.");
        }
    };

    const handleRemoveLiquidity = async () => {
        const result = await removeLiquidity({
            tokenA: selectedTokenA,
            tokenB: selectedTokenB,
            liquidityAmount,
            senderAddress: walletAddress,
        });

        if (result) {
            alert("Liquidity removed successfully!");
        } else {
            alert("Failed to remove liquidity.");
        }
    };

    const handleSwap = async () => {
        if (!swapAmount || !selectedTokenA || !selectedTokenB) {
            alert("Please fill in all fields for swap.");
            return;
        }

        try {
            const chainA = getChainForToken(selectedTokenA);
            const chainB = getChainForToken(selectedTokenB);

            // if (chainA.chainId !== chainB.chainId) {
            //     alert("Cross-chain swaps are not supported yet.");
            //     return;
            // }

            const contractAddress = chainA.contract;

            const swapExecutionResult = await swapRequest({
                amount_in: swapAmount,
                asset_in: {
                    token: selectedTokenA,
                    token_type: {
                        smart: { contract_address: contractAddress },
                    },
                },
                asset_out: selectedTokenB,
                cross_chain_addresses: [],
                min_amount_out: "1",
                sender: {
                    address: walletAddress,
                    chain_uid: chainA.chainId,
                },
                swaps: [selectedTokenA, selectedTokenB],
            });

            if (!swapExecutionResult) {
                alert("Failed to execute swap.");
                return;
            }

            alert(`Swap executed successfully! You swapped ${swapAmount} ${selectedTokenA} for ${selectedTokenB}.`);

            console.log("swapamt: ",swapAmount)
            console.log("tka: ",selectedTokenA)
            console.log("tkb: ",selectedTokenB)
            console.log("contract: ",contractAddress)
            const simulationResult = await simulateSwap({
                amountIn: swapAmount,
                assetIn: selectedTokenA,
                assetOut: selectedTokenB,
                contract: contractAddress,
                minAmountOut: "1",
                swaps: [selectedTokenA, selectedTokenB],
            });

            if (simulationResult) {
                setSwapResult({
                    amount_out: simulationResult.amount_out,
                    asset_out: selectedTokenB,
                    estimatedGas: simulationResult.estimated_gas,
                });

                alert(`Swap simulated successfully. You would receive ${simulationResult.amount_out} ${selectedTokenB}.`);
            } else {
                alert("Failed to simulate swap.");
            }
        } catch (error) {
            console.error("Error during swap process:", error);
            alert("An error occurred while processing the swap.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold mb-6 text-center text-purple-500">DEX Interface</h1>

                {!walletAddress && (
                    <div className="mb-6">
                        <button
                            onClick={() => connectKeplr("osmosis")}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
                        >
                            Connect Wallet
                        </button>
                    </div>
                )}

                {walletAddress && (
                    <div className="bg-gray-700 p-4 mb-6 rounded-lg">
                        <p className="font-semibold text-lg">Connected Wallet: {walletAddress}</p>
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to disconnect the wallet?")) {
                                    setWalletAddress("");
                                    setIsKeplrConnected(false);
                                    alert("Wallet disconnected successfully.");
                                }
                            }}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                )}

                {/* Add Liquidity Section */}
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Add Liquidity</h2>
                    <input
                        type="number"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                        placeholder="Amount of Token A"
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    />
                    <input
                        type="number"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                        placeholder="Amount of Token B"
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    />
                    <button
                        onClick={handleAddLiquidity}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                    >
                        Add Liquidity
                    </button>
                </div>

                {/* Remove Liquidity Section */}
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Remove Liquidity</h2>
                    <input
                        type="number"
                        value={liquidityAmount}
                        onChange={(e) => setLiquidityAmount(e.target.value)}
                        placeholder="Amount of Liquidity to Remove"
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    />
                    <button
                        onClick={handleRemoveLiquidity}
                        className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
                    >
                        Remove Liquidity
                    </button>
                </div>

                {/* Swap Section */}
                <div className="bg-gray-700 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Swap Tokens</h2>
                    <select
                        value={selectedTokenA}
                        onChange={(e) => setSelectedTokenA(e.target.value)}
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    >
                        <option value="">Select Token A</option>
                        {Object.keys(tokenData).map((chain) =>
                            tokenData[chain].map((token) => (
                                <option key={token} value={token}>
                                    {token}
                                </option>
                            ))
                        )}
                    </select>
                    <select
                        value={selectedTokenB}
                        onChange={(e) => setSelectedTokenB(e.target.value)}
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    >
                        <option value="">Select Token B</option>
                        {Object.keys(tokenData).map((chain) =>
                            tokenData[chain].map((token) => (
                                <option key={token} value={token}>
                                    {token}
                                </option>
                            ))
                        )}
                    </select>
                    <input
                        type="number"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        placeholder="Amount to Swap"
                        className="bg-gray-600 text-white p-3 rounded-lg w-full mb-4"
                    />
                    <button
                        onClick={handleSwap}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg"
                    >
                        Execute Swap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dex;
