"use client";
import React, { useState, useEffect } from "react";
import { useQuizData } from "../../../context/quizDataContext";
import SockJS from "sockjs-client";
import * as stomp from "webstomp-client";
import { useRouter } from "next/navigation";

interface IClientQuestion {
    questionNumber: number;
    text: string;
    options: string[];
    category: string;
    imageUrl: string;
    tags: string[];
    timeLimitInSeconds: number;
    isLastQuestion: boolean;
}

export default function Question() {
    const [currentQuestion, setCurrentQuestion] = useState<IClientQuestion | null>(null);
    const [disableOptionSelect, setDisableOptionSelect] = useState(true);
    const [timer, setTimer] = useState(13);
    const [redirectToBounty, setRedirectToBounty] = useState(false);
    const router = useRouter();

    const { quizGlobalData, setGlobalQuizData } = useQuizData();

    useEffect(() => {
        const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
        const ws = new SockJS(URI);
        const stompClient = stomp.over(ws);

        stompClient.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClient.subscribe("/topic/question/" + quizGlobalData?.f_quizzId, (response) => {
                const f_question: IClientQuestion = JSON.parse(response.body);

                if (f_question.isLastQuestion && timer === 0) {
                    setRedirectToBounty(true); // Set state to redirect to bounty page
                } else {
                    setCurrentQuestion(f_question);
                    setTimer(f_question.timeLimitInSeconds);
                    setDisableOptionSelect(false);
                }
            });
        });

        return () => {
            stompClient.disconnect();
        };
    }, [quizGlobalData?.f_quizzId, timer]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timer > 0) {
                setTimer((prevTimer) => prevTimer - 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    function handleUserSelectedOption(option: string): void {
        if (currentQuestion && !disableOptionSelect) {
            setDisableOptionSelect(true);

            const t_walletAddress = localStorage.getItem("address");

            const requestData = {
                walletAddress: t_walletAddress,
                answer: option,
                quizzId: quizGlobalData?.f_quizzId,
                questionId: currentQuestion.questionNumber,
            };
            const URI = process.env.NEXT_PUBLIC_URI! + "/attempts/submit";

            fetch(URI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })
                .then((response) => {
                    console.log("Response:", response);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    }

    useEffect(() => {
        if (redirectToBounty) {
            console.log("Redirecting to bounty page...");
            router.push("/scores");
        }
    }, [redirectToBounty]);

    return (
        <div>
            <div>
                <div>Timer: {timer} seconds</div>
            </div>
            {currentQuestion && (
                <div>
                    <div>{currentQuestion.questionNumber + ""}</div>
                    <div>{currentQuestion.text}</div>
                    <div>
                        {currentQuestion.options.map((option: string, index: number) => (
                            <div key={index}>
                                <div
                                    onClick={() => handleUserSelectedOption(option)}
                                    style={{
                                        cursor: disableOptionSelect ? "not-allowed" : "pointer",
                                        opacity: disableOptionSelect ? 0.5 : 1,
                                    }}
                                >
                                    {option}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
