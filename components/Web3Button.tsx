"use client";
import React from "react";
import { ethers } from "ethers";

interface Web3ButtonProps {
    address: string | null;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const Web3Button: React.FC<Web3ButtonProps> = ({ address, setAddress, isConnected, setIsConnected }) => {
    const [buttonClicked, setButtonClicked] = React.useState<boolean>(false);

    const handleClick = async () => {
        try {
            if ((window as any).ethereum) {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
                const selectedAddress = accounts[0];
                setAddress(selectedAddress);
                setIsConnected(true);
                setButtonClicked(true);
                localStorage.setItem("address", selectedAddress);
                localStorage.setItem("walletAddress", selectedAddress);
            } else {
                console.error("MetaMask not found.");
            }
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    return (
        <div>
            <button onClick={handleClick} disabled={buttonClicked || isConnected}>
                Connect To FileCoin
            </button>
        </div>
    );
};

export default Web3Button;
