"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface IUserData {
    userName: string;
    walletAddress: string;
}

const setLocalStorage = (key: string, value: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
    }
};

const removeLocalStorageItem = (key: string) => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(key);
    }
};

const GAME_PIN: string = "game_pin";

const Pin = () => {
    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gamePin, setGamePin] = useState<string>("");
    const router = useRouter();

    const fetchUserData = async (t_walletAddress: string) => {
        try {
            const URI = process.env.NEXT_PUBLIC_URI! + `/users/get-user-data?walletAddress=${t_walletAddress}`;
            console.log("fetchUserData");
            console.log(URI);
            const response = await fetch(URI);
            console.log(response);
            if (response.ok) {
                const t_userData = await response.json();
                console.log(t_userData);
                setUserData(t_userData);
            } else {
                setError("Failed to fetch user data");
            }
        } catch (error) {
            setError("Error fetching user data");
        }
    };

    const validateQuizzPin = async () => {
        try {
            const URI = `${process.env.NEXT_PUBLIC_URI}/quiz/validate-id/${gamePin}`;

            const response = await fetch(URI, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(URI);
            const data = await response.json(); // true or false
            console.log("Validated Data");
            console.log(response);
            console.log(data);

            if (response.ok) {
                setLocalStorage(GAME_PIN, gamePin);

                router.push("/waiting-page");
            } else {
                setError("Invalid game PIN");
            }
        } catch (error) {
            setError("Error starting quiz: " + error);
        }
    };

    async function waitFunction(t_walletAddress: string) {
        console.log("Fetching User data");
        await fetchUserData(t_walletAddress);
    }

    useEffect(() => {
        removeLocalStorageItem(GAME_PIN);
        const t_walletAddress = localStorage.getItem("walletAddress");
        if (t_walletAddress) {
            setIsConnected(true);
        }

        if (t_walletAddress) {
            // connected to wallet

            waitFunction(t_walletAddress);
        } else {
            router.push("/");
        }
    }, [isConnected, address]);

    return (
        <div>
            <div>
                {userData ? (
                    <div>
                        <h2>User Details:</h2>
                        <p>Username: {userData.userName}</p>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
            <div>
                <div>Game PIN</div>
                <input type="text" value={gamePin} onChange={(e) => setGamePin(e.target.value)} />
                <button onClick={validateQuizzPin}>Start Quiz</button>
            </div>
            <div> {error && <div>{error}</div>}</div>
        </div>
    );
};

export default Pin;
