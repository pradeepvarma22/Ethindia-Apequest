"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import * as stomp from "webstomp-client";
import { ethers } from "ethers";

const EventPage = () => {
    const [walletTransactions, setWalletTransactions] = useState([]);

    const sendEtherToAddress = async (rpcURL: string, privateKey: string, toAddress: string, amountInEther: string) => {
        const provider = new ethers.providers.JsonRpcProvider(rpcURL);
        const wallet = new ethers.Wallet(privateKey, provider);
        const amountToSend = ethers.utils.parseEther(amountInEther.toString());

        try {
            const transaction = await wallet.sendTransaction({
                to: toAddress,
                value: amountToSend,
            });

            console.log("Transaction hash:", transaction.hash);
        } catch (error) {
            console.log(error);
            throw error; // Re-throw the error for handling in the caller
        }
    };

    useEffect(() => {
        const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
        const ws = new SockJS(URI);
        const stompClient = stomp.over(ws);

        stompClient.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClient.subscribe("/topic/transfer-eth", async (response) => {
                try {
                    const data = JSON.parse(response.body);
                    const transactions = data.map((item: any) => ({
                        walletAddress: item.walletAddress,
                        amountInEther: item.amount, // Assuming amount is provided in Ether
                    }));

                    const rpcURL = "https://api.mycelium.calibration.node.glif.io/";
                    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;

                    const sendTransactions = transactions.map(async (tx: any) => {
                        try {
                            await sendEtherToAddress(rpcURL, privateKey, tx.walletAddress, tx.amountInEther);
                        } catch (error) {
                            console.log(error);
                        }
                    });

                    await Promise.all(sendTransactions);
                    setWalletTransactions(transactions);
                } catch (error) {
                    console.log(error);
                }
            });
        });
    }, []);

    return (
        <div>
            <h2>Wallet Transactions</h2>
        </div>
    );
};

export default EventPage;
