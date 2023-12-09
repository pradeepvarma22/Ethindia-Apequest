"use client";
import React, { useState, useEffect } from "react";
import "../globals.css";
import SockJS from "sockjs-client";
import * as stomp from "webstomp-client";

interface IScores {
    userName: string;
    score: number;
    amount: number;
    walletAddress: string;
}

export default function Scores() {
    const [scoresList, setScoresList] = useState<IScores[]>([]);

    useEffect(() => {
        const t_quizzId = localStorage.getItem("game_pin");
        if (t_quizzId) {
            fetchScores(t_quizzId);
        }
    }, []);

    const fetchScores = async (quizzId: string) => {
        const URI = process.env.NEXT_PUBLIC_URI + "/quiz/scores/" + quizzId;

        try {
            const response = await fetch(URI);
            if (!response.ok) {
                throw new Error("Failed to fetch scores");
            }
            const scoresData: IScores[] = await response.json();
            setScoresList(scoresData);
        } catch (err) {
            console.log(err);
        }
    };

    // stompClient.send("/apequest/updateUserData", JSON.stringify(consolidated_userdata), {});
    useEffect(() => {
        const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
        const ws = new SockJS(URI);
        const stompClient = stomp.over(ws);

        stompClient.connect({}, () => {
            console.log("Connected to WebSocket");
            let t_quizzId = localStorage.getItem("quizzId")!;

            t_quizzId = "1";

            stompClient.send("/apequest/trigger-event", t_quizzId+"", {});
        });
    }, []);

    return (
        <div className="page-wrapper">
            <div className="scores">Scores List</div>
            <div className="score-grid">
                {scoresList.map((score, index) => (
                    <div key={index}>
                        <div className="user-wrapper">
                            <span className="left">User:</span> <span className="right">{score.userName}</span>
                        </div>
                        <div className="user-wrapper">
                            <span className="left">Score:</span> <span className="right">{score.score}</span>
                        </div>
                        <div className="user-wrapper">
                            <span className="left">Amount:</span> <span className="right">{score.amount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
