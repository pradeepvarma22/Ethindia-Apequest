"use client";
import React, { useState, useEffect } from "react";
import { Web3Button } from "@web3modal/react";
import { useAccount, useNetwork } from "wagmi";
import { useRouter } from "next/navigation";

interface User {
    walletAddress: string;
    userName: string;
}

const setLocalStorage = (key: string, value: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export default function Apequest() {
    const { chain } = useNetwork();
    const { address, isConnected } = useAccount();
    const [username, setUsername] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleWalletConnect = async () => {
        try {
            if (!address || !username || address.trim() === "" || username.trim() === "") {
                setError("Address or username is empty or null.");
                return;
            }

            const user = {
                walletAddress: address!,
                userName: username!,
            };

            const URI = process.env.NEXT_PUBLIC_URI! + "/users/create-user-if-not-exists";
            const response = await fetch(URI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            if (response.ok) {
                console.log("User created successfully");
                setLocalStorage("walletAddress", address!);
                setLocalStorage("username", username!);
                router.push("/input-pin");
            } else {
                setError("Failed to create user");
            }
        } catch (error) {
            setError(`Error creating user: ${error}`);
        }
    };

    useEffect(() => {
        if (isConnected && isSaved) {
            handleWalletConnect();
        }
    }, [isSaved]);

    return (
        <div>
            <div>{!isConnected && <Web3Button />}</div>

            <div>
                {isConnected && !isSaved && (
                    <div>
                        <input type="text" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} />
                        <button onClick={(e) => setIsSaved(true)}>save</button>
                    </div>
                )}
            </div>

            {isConnected && <div>Your address: {address}</div>}
            {error && <div>Error: {error}</div>}
        </div>
    );
}
