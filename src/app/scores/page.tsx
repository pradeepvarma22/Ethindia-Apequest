"use client";
import React, { useState, useEffect } from "react";
import "../globals.css";

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

    return (
        <div className="page-wrapper">
            <div className="scores">Scores List</div>
            <div className="score-grid">
                {scoresList.map((score, index) => (
                    <div  key={index}>
                        <div className="user-wrapper"><span className="left">User:</span> <span className="right">{score.userName}</span></div>
                        <div className="user-wrapper"><span className="left">Score:</span> <span className="right">{score.score}</span></div>
                        <div className="user-wrapper"><span className="left">Amount:</span> <span className="right">{score.amount}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
