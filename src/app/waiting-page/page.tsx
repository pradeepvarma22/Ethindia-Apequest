"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import * as stomp from "webstomp-client";
import { useQuizData } from "../../../context/quizDataContext";

interface UserData {
    userName: string;
    walletAddress: string;
}

interface QuizDetails {
    createdAt: Date | null;
    createdBy: string;
    gamePin: number;
    quizzTitle: string;
    status: string;
}

const GAME_PIN: string = "game_pin";

const WaitingPage = () => {
    const { setGlobalQuizData } = useQuizData();

    const [connectedUsers, setConnectedUsers] = useState<UserData[]>([]);

    const [address, setAddress] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gamePin, setGamePin] = useState<string>("");
    const router = useRouter();
    const [quizData, setQuizData] = useState<QuizDetails | null>(null);

    const fetchUserData = async (t_walletAddress: string) => {
        try {
            const URI = process.env.NEXT_PUBLIC_URI! + `/users/get-user-data?walletAddress=${t_walletAddress}`;
            console.log(URI);
            console.log("fetchUserData__2");
            const response = await fetch(URI);
            console.log(response);
            if (response.ok) {
                const t_userData = await response.json();
                setUserData(t_userData);
            } else {
                setError("Failed to fetch user data");
            }
        } catch (error) {
            setError("Error fetching user data");
        }
    };

    async function getQuizDetails() {
        try {
            const gamePinLocalStorage = localStorage.getItem(GAME_PIN);
            if (!gamePinLocalStorage) {
                throw new Error("Game pin not found");
            }
            console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
            console.log(gamePinLocalStorage);

            const URI = `${process.env.NEXT_PUBLIC_URI}/quiz/quiz-details/${Number(gamePinLocalStorage)}`;

            console.log(URI);
            const response = await fetch(URI, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(response);

            if (response.ok) {
                const quizzBasicData = await response.json();
                console.log(quizzBasicData);
                setQuizData(quizzBasicData);
            } else {
                throw new Error("Failed to fetch quiz data");
            }
        } catch (error) {
            console.error(error);
            setError("Error at getQuizDetails");
        }
    }

    async function waitFunction(t_walletAddress: string) {
        await fetchUserData(t_walletAddress);
        await getQuizDetails();
    }

    useEffect(() => {
        const t_walletAddress = localStorage.getItem("walletAddress");

        if (t_walletAddress) {
            // is connected
            setAddress(t_walletAddress);
            setIsConnected(true);
            const gamePinLocalStorage: string | null = localStorage.getItem(GAME_PIN);
            if (gamePinLocalStorage == null) {
                router.push("/input-page");
            }

            if (gamePinLocalStorage) {
                setGamePin(gamePinLocalStorage);
            }

            waitFunction(t_walletAddress);
        } else {
            router.push("/");
        }
    }, []);

    useEffect(() => {
        const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
        const ws = new SockJS(URI);
        const stompClient = stomp.over(ws);

        stompClient.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClient.subscribe("/topic/waiting-page-new-user", (response) => {
                const users = JSON.parse(response.body);
                console.log("-----------------waiting-page-new-user---------------");
                console.log(users);
                console.log(typeof users);
                setConnectedUsers(users);
            });

            let consolidated_userdata = {
                ...userData,
                ["gamePin"]: gamePin,
            };

            if (userData?.userName) {
                localStorage.setItem("userName", userData?.userName);
                stompClient.send("/apequest/updateUserData", JSON.stringify(consolidated_userdata), {});
            }

            console.log("xxxxxxxxxxxxxxxxxxxxxxxxx" + gamePin);
            stompClient.subscribe(`/topic/start-quiz-${gamePin}`, (message) => {
                console.log("Received message: status::::", message.body);

                if (message.body === "START") {
                    const gamePinLocalStorage = localStorage.getItem(GAME_PIN);
                    let userName_Local;
                    if (userData?.userName) {
                        userName_Local = userData?.userName;
                    } else {
                        userName_Local = localStorage.getItem("userName");
                    }

                    setGlobalQuizData({
                        f_quizzId: parseInt(gamePinLocalStorage!, 10),
                        f_userName: userName_Local!,
                        f_walletAddress: address!,
                    });

                    router.push("/question");
                }
            });
        });
    }, [userData?.userName, gamePin]);

    return (
        <div>
            <div>Please wait host will start the quizz</div>
            <div>
                Quizz details
                <div>
                    {quizData ? (
                        <div>
                            <b>Quiz Title: {quizData.quizzTitle}</b>
                            <p>Created At: {quizData.createdAt ? quizData.createdAt.toISOString() : "N/A"}</p>
                            <p>Created By: {quizData.createdBy}</p>
                            <p>Game Pin: {quizData.gamePin}</p>
                            <p>Status: {quizData.status}</p>
                        </div>
                    ) : (
                        <p>Loading quiz data...</p>
                    )}
                </div>
            </div>

            <h2>Connected Users</h2>
            <ul>
                {connectedUsers.map((user: UserData, index: number) => (
                    <div key={index}>
                        <ul>
                            <li key={index}>
                                <p>Name: {user.userName}</p>
                                <p>Wallet Address: {user.walletAddress}</p>
                            </li>
                        </ul>
                    </div>
                ))}
            </ul>

            <div>{error && <div>{error}</div>}</div>
        </div>
    );
};

export default WaitingPage;
