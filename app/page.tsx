"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, getContract, parseUnits } from 'viem';
import { bsc } from 'viem/chains';
import '@reown/appkit-wallet-button/react';
import { useAppKit } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';

const MY_CONTRACT_ADDRESS = "0x8716D73c5D5a7158F6242dB5441694447315DC27";
const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const myContractABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "tokenAmount",
                type: "uint256",
            },
        ],
        name: "buyTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

const usdtContractABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];

const MAX_USD_RAISED = 100000;
const MAX_TOKENS = 100000000;

export default function Home() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [dollarAmount, setDollarAmount] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const inputRef = useRef(null);
    const [selectedToken, setSelectedToken] = useState('USDT');
    const { open } = useAppKit();
    const { disconnect } = useDisconnect();
    const [bnbPrice, setBnbPrice] = useState(0);
    const [usdRaised, setUsdRaised] = useState("52720"); //valor estático por enquanto

    const percentage = (parseFloat(usdRaised) / MAX_USD_RAISED) * 100;
    //@ts-ignore
    const formatPercentage = (percentage) => `${percentage.toFixed(2)}%`;
    //@ts-ignore
    const formatNumber = (number) => Number(number).toLocaleString('en-US');
    const tokensSold = 52720000; //valor estatico

    const fetchBnbPrice = async () => {
        try {
            const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
            const data = await response.json();
            setBnbPrice(parseFloat(data.price));
        } catch (error) {
            console.error("Erro ao buscar preço do BNB:", error);
            setError("Erro ao buscar preço do BNB.");
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
            }, 3000);

        }
    };

    useEffect(() => {
        const calculateTokens = async () => {
           if (selectedToken === 'BNB' && dollarAmount) {
                await fetchBnbPrice();
                if (bnbPrice > 0) {
                    const bnbToUsd = Number(dollarAmount) * bnbPrice;
                    const tokens = bnbToUsd / 0.001
                    setTokenAmount(tokens.toString());
                }
            } else if (selectedToken === 'USDT' && dollarAmount) {
                const tokens = Number(dollarAmount) / 0.001;
                setTokenAmount(tokens.toString());
            } else {
                setTokenAmount("");
            }
        };

        calculateTokens();
    }, [dollarAmount, selectedToken, bnbPrice]);

    const handleBuyTokens = async () => {
        if (!walletClient || !address) {
            setError("Carteira não conectada ou cliente não disponível");
            return;
        }

        try {
            const usdtCost = Number(tokenAmount) * 0.001;
            if (usdtCost <= 0) return;

            setIsBuying(true);
            const publicClient = createPublicClient({
                chain: bsc,
                transport: http(),
            });

            const myContractInstance = getContract({
                address: MY_CONTRACT_ADDRESS,
                abi: myContractABI,
                client: publicClient,
            });

            const usdtContractInstance = getContract({
                address: USDT_CONTRACT_ADDRESS,
                abi: usdtContractABI,
                client: publicClient,
            });

            await walletClient.writeContract({
                ...usdtContractInstance,
                functionName: "approve",
                args: [MY_CONTRACT_ADDRESS, parseUnits(usdtCost.toString(), 18)],
            });

            await walletClient.writeContract({
                ...myContractInstance,
                functionName: "buyTokens",
                args: [parseUnits(tokenAmount.toString(), 18)],
            });

            console.log("Tokens comprados com sucesso!");
            setError("");
        } catch (e) {
            setError("Ocorreu um erro ao comprar tokens.");
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
            }, 3000);
        } finally {
            setIsBuying(false);
        }
    };

    const handleMaxAmount = () => {
        if (address) {
            // Defina um valor máximo (ajuste conforme necessário)
            const max = 100000;
            setDollarAmount(max.toString());
        } else {
            setError("Carteira não conectada");
        }
    };
    //@ts-ignore
   const handleTokenSelect = () => {
    setSelectedToken('USDT');
  };
    //@ts-ignore
    const formatAddress = (addr) => {
        if (!addr) return "";
        const firstPart = addr.slice(0, 4);
        const lastPart = addr.slice(-4);
        return `Your Wallet: ${firstPart}******${lastPart}`;
    };

    const handleDisconnectWallet = () => {
        disconnect();
    };

    const handleWalletButtonClick = () => {
        open();
    };

    return (
        <div
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center overflow-hidden z-0"
            style={{ backgroundImage: 'url(/1.png)' }}
        >
            <div className="relative flex items-center justify-center min-h-screen overflow-y-auto z-10 px-4">
                <div
                  className="flex flex-col items-center w-[400px] h-fit max-h-[100vh] sm:px-5"
                >
                    <div className="flex flex-col items-center mb-2 mt-1">
                        <p className="text-white text-xl mt-0 mb-0">
                            <span className="font-bold bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent">
                                XSTP Presale
                            </span>
                        </p>
                        <p className="text-white text-sm mt-0 mb-0">Stage 1 Price: $ 0,001</p>
                        <p className="text-white text-sm mt-0 mb-0"></p>
                        <p className="text-white text-sm mt-0 mb-[-5]">Next Stage Price = $ 0.002</p>
                    </div>
                    <div className=" w-full h-[25px] rounded-[8px] border-2 border-white overflow-hidden mb-1 mt-2 relative px-0">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] flex items-center justify-center text-sm text-white font-bold px-4"
                            style={{ width: `${percentage}%` }}
                        >
                            {formatPercentage(percentage)}
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-start mb-2 mt-2  sm-px0">
                        <p className="text-white text-sm">
                            USD Raised:
                            <span className="bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent font-bold">
                                ${formatNumber(usdRaised)}
                            </span> /
                            <span className="bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent font-bold">
                                $100.000
                            </span>
                        </p>
                        <p className="text-white text-sm">
                            Tokens Sold:
                            <span className="bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent font-bold">
                                {formatNumber(tokensSold)}
                            </span> /
                            <span className="bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent font-bold">
                                {formatNumber(MAX_TOKENS)}
                            </span>
                        </p>
                    </div>
                    <div className="flex w-full mb-2 mt-1">
                        <button
                            onClick={handleTokenSelect}
                             className={`border rounded w-[33.33%] h-12 text-white font-bold flex items-center justify-center
                            ${selectedToken === 'BNB' ? 'bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]' : ''
                            }`}
                        >
                            <img src="/BNB.svg" alt="BNB" className="h-10 w-25 object-contain" />
                        </button>
                        <button
                             onClick={handleTokenSelect}
                            className={`ml-2 border rounded w-[33.33%] h-12 text-white font-bold flex items-center justify-center
                            ${selectedToken === 'USDT'
                                    ? 'bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]'
                                    : ''
                            }`}
                        >
                            <img src="/USDT.svg" alt="USDT" className="h-10 w-25 object-contain" />
                        </button>
                        <button
                           onClick={handleTokenSelect}
                            className={`ml-2 border rounded w-[33.33%] h-12 text-white font-bold flex items-center justify-center
                       ${selectedToken === 'CREDIT'
                                    ? 'bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]'
                                    : ''
                                }`}
                        >
                            <img src="/CARD.svg" alt="CARD" className="h-10 w-25 object-contain" />
                        </button>
                    </div>
                    <div className="w-full mb-0 flex flex-col text-left">
                        <div className="text-white text-sm  mb-1">
                            Amount in{" "}
                            {selectedToken === 'BNB' ? (
                                <span className="font-bold bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent">BNB</span>
                            ) : selectedToken === 'USDT' ? (
                                <span className="font-bold bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent">USDT</span>
                            ) : (
                                <span className="font-bold bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent">USDT</span>
                            )}
                             you pay:
                        </div>
                    </div>
                    <div className="flex w-full mb-2 mt-1">
                        <input
                            ref={inputRef}
                            type="number"
                            placeholder=" Investment"
                            value={dollarAmount}
                            onChange={(e) => setDollarAmount(e.target.value)}
                            className="border rounded w-[67%] text-black placeholder-gray-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none pl-2"
                        />
                        <button
                            onClick={handleMaxAmount}
                            className="ml-2 border border-white rounded p-2 w-[32%] text-white font-bold"
                            style={{ backgroundColor: 'transparent' }}
                        >
                            MAX
                        </button>
                    </div>
                    <div className="w-full mb-1 flex flex-col items-start">
                        <div className="text-white text-sm  mb-1">
                            Amount in <span className="font-bold bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent">XSTP</span> you receive:
                        </div>
                    </div>
                    <input
                        type="number"
                        placeholder="0"
                        value={tokenAmount}
                        readOnly
                        className="border rounded p-2 mb-3 w-full text-black placeholder-gray-500"
                    />
                    {isConnected ? (
                        <>
                            <button
                                onClick={handleBuyTokens}
                                className="font-bold py-2 px-4 rounded w-full text-white bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]"
                                disabled={isBuying}
                            >
                                {isBuying ? "Buying..." : "Buy Tokens"}
                            </button>
                            <div
                                className="mt-2 mb-1 text-center text-sm bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent"
                            >
                                {formatAddress(address)}
                            </div>
                            <button
                                onClick={handleDisconnectWallet}
                                className="mx-auto mt-1 font-bold py-1 px-3 rounded transform scale-80 text-sm text-white bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]"
                            >
                                Desconectar
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleWalletButtonClick}
                                className="mt-0 mb-0 font-bold py-2 px-4 rounded w-full text-white bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF]"
                            >
                                Connect Wallet
                            </button>
                            <div
                                className="text-red-500 mt-2 bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent text-center"
                            >
                                Please connect your wallet to buy tokens.
                            </div>
                            <p className="font-bold text-center bg-gradient-to-r from-[#FF1CF7] to-[#00F0FF] bg-clip-text text-transparent text-xl mt-4 mb-0">
                                Coming soon Wallet and Sales on
                            </p>
                            <div className="flex justify-center mt-2">
                                <img src="/app.png" alt="App Image" className="w-[360px]" />
                            </div>
                            
                        </>
                    )}
                    {showError && error && <div className="text-red-500 mt-0">{error}</div>}
                </div>
            </div>
        </div>
    );
}
