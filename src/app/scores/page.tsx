"use client";
import React, { useState, useEffect } from "react";

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
        <div>
            <div>Scores List</div>
            <div>
                {scoresList.map((score, index) => (
                    <div key={index}>
                        <span>User: {score.userName}</span>
                        <span>Score: {score.score}</span>
                        <span>Amount: {score.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
