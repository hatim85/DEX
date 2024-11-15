import React, { useState } from 'react';
import { addLiquidity, removeLiquidity, simulateSwap } from './Api.js';
import { ethers } from 'ethers';

const Dex = () => {
    const [tokenA, setTokenA] = useState("ETH");
    const [tokenB, setTokenB] = useState("DAI");
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [liquidityAmount, setLiquidityAmount] = useState("");
    const [swapAmount, setSwapAmount] = useState("");
    const [swapResult, setSwapResult] = useState(null);
    const [walletAddress, setWalletAddress] = useState("");
    const [isKeplrConnected, setIsKeplrConnected] = useState(false);
    const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
    const [chain, setChain] = useState("");
    const [selectedChain, setSelectedChain] = useState(''); // State for selected chain
    const [slippageTolerance, setSlippageTolerance] = useState(0.5); // Slippage tolerance for swap

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
            setChain('Cosmos');
        } catch (error) {
            console.error("Failed to connect to Keplr", error);
            alert("Failed to connect to Keplr. Please try again.");
        }
    };

    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                setIsMetamaskConnected(true);
                setChain('Ethereum');
            } catch (error) {
                console.error("Failed to connect to MetaMask", error);
                alert("Failed to connect to MetaMask. Please try again.");
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const handleConnectWallet = () => {
        if (selectedChain === 'Ethereum') {
            connectMetaMask();
        } else if (selectedChain === 'Cosmos') {
            connectKeplr('cosmoshub-4');
        } else {
            alert("Please select a valid chain.");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress("");
        setIsKeplrConnected(false);
        setIsMetamaskConnected(false);
        setChain("");
        setSelectedChain('');
    };

    const handleAddLiquidity = async () => {
        const result = await addLiquidity({
            tokenA,
            tokenB,
            amountA,
            amountB,
            slippageTolerance,
            senderAddress: walletAddress,
            chainUid: selectedChain,
        });

        if (result) {
            alert("Liquidity added successfully!");
        } else {
            alert("Failed to add liquidity.");
        }
    };

    const handleRemoveLiquidity = async () => {
        const result = await removeLiquidity({
            tokenA,
            tokenB,
            liquidityAmount,
            senderAddress: walletAddress,
            chainUid: selectedChain,
        });

        if (result) {
            alert("Liquidity removed successfully!");
        } else {
            alert("Failed to remove liquidity.");
        }
    };

    const handleSwap = async () => {
        try {
            const result = await simulateSwap({
                amountIn: swapAmount,
                assetIn: tokenA,
                assetOut: tokenB,
                contract: "0x5C69bEe701ef814a2B6a3EDD4B3C2A2e3F01f3e2",
                minAmountOut: (swapAmount * (1 - slippageTolerance / 100)).toString(),
                swaps: [tokenA, tokenB],
            });

            if (result) {
                setSwapResult({
                    amount_out: result.amount_out,
                    asset_out: tokenB,
                    estimatedGas: result.estimated_gas,
                });
                alert(`Swap simulated successfully. You would receive ${result.amount_out} ${tokenB}.`);
            } else {
                alert("Failed to simulate swap.");
            }
        } catch (error) {
            console.error("Error simulating swap:", error);
            alert("An error occurred while simulating the swap.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold mb-6 text-center text-purple-500">DEX Interface</h1>

                {/* Chain Selection */}
                <div className="flex justify-between mb-6">
                    <div className="flex space-x-4">
                        <select
                            value={selectedChain}
                            onChange={(e) => setSelectedChain(e.target.value)}
                            className="bg-gray-700 text-white p-2 rounded-lg"
                        >
                            <option value="">Select Chain</option>
                            <option value="Ethereum">Ethereum</option>
                            <option value="Cosmos">Cosmos</option>
                        </select>
                        <button
                            onClick={handleConnectWallet}
                            disabled={!selectedChain}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"
                        >
                            Connect Wallet for {selectedChain}
                        </button>
                    </div>
                </div>

                {/* Wallet Connection Section */}
                {walletAddress && (
                    <div className="bg-gray-700 p-4 mb-6 rounded-lg">
                        <p className="font-semibold text-lg">Connected Wallet: {walletAddress}</p>
                        <p>Connected Chain: {chain}</p>
                        <button
                            onClick={disconnectWallet}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                )}

                {/* Add Liquidity */}
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Add Liquidity</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={tokenA}
                            onChange={(e) => setTokenA(e.target.value)}
                            placeholder="Token A (e.g., ETH)"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="text"
                            value={tokenB}
                            onChange={(e) => setTokenB(e.target.value)}
                            placeholder="Token B (e.g., DAI)"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="number"
                            value={amountA}
                            onChange={(e) => setAmountA(e.target.value)}
                            placeholder="Amount of Token A"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="number"
                            value={amountB}
                            onChange={(e) => setAmountB(e.target.value)}
                            placeholder="Amount of Token B"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={handleAddLiquidity}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg"
                    >
                        Add Liquidity
                    </button>
                </div>

                {/* Remove Liquidity */}
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Remove Liquidity</h2>
                    <input
                        type="number"
                        value={liquidityAmount}
                        onChange={(e) => setLiquidityAmount(e.target.value)}
                        placeholder="Liquidity Amount to Remove"
                        className="bg-gray-600 text-white p-3 rounded-lg w-full"
                    />
                    <button
                        onClick={handleRemoveLiquidity}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
                    >
                        Remove Liquidity
                    </button>
                </div>

                {/* Swap Tokens */}
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-center text-purple-400">Swap Tokens</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={tokenA}
                            onChange={(e) => setTokenA(e.target.value)}
                            placeholder="From Token (e.g., ETH)"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="text"
                            value={tokenB}
                            onChange={(e) => setTokenB(e.target.value)}
                            placeholder="To Token (e.g., DAI)"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="number"
                            value={swapAmount}
                            onChange={(e) => setSwapAmount(e.target.value)}
                            placeholder="Amount to Swap"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                        <input
                            type="number"
                            value={slippageTolerance}
                            onChange={(e) => setSlippageTolerance(e.target.value)}
                            placeholder="Slippage Tolerance (%)"
                            className="bg-gray-600 text-white p-3 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={handleSwap}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg"
                    >
                        Swap
                    </button>
                    {swapResult && (
                        <div className="mt-4 text-center text-white">
                            <p>Swap Result: {swapResult.amount_out} {swapResult.asset_out}</p>
                            <p>Estimated Gas: {swapResult.estimatedGas} wei</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dex;
