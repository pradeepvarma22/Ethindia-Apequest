"use client";
import React, { useState, useEffect, useRef } from "react";
import { useQuizData } from "../../../context/quizDataContext";
import SockJS from "sockjs-client";
import * as Stomp from "webstomp-client";
import { useRouter } from "next/navigation";
import "../globals.css";

interface IClientQuestion {
    questionNumber: number;
    text: string;
    options: string[];
    category: string;
    imageUrl: string;
    tags: string[];
    timeLimitInSeconds: number;
    lastQuestion: boolean;
}

export default function Question() {
    const [currentQuestion, setCurrentQuestion] = useState<IClientQuestion | null>(null);
    const [disableOptionSelect, setDisableOptionSelect] = useState(true);
    const [lastQuestion, setLastQuestion] = useState(false);
    const [timer, setTimer] = useState(13);
    const router = useRouter();
    const { quizGlobalData } = useQuizData();

    useEffect(() => {

        // setCurrentQuestion({text:"who is your x ?", options:["A for apple","B for ball", "C for cat", "D for dog"], category: "",imageUrl:"",lastQuestion:false, questionNumber:1, tags:[
        //     ""], timeLimitInSeconds:10});

        const fetchQuestion = () => {
            const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
            const ws = new SockJS(URI);
            const stompClient = Stomp.over(ws);

            stompClient.connect({}, () => {
                console.log("Connected to WebSocket");

                stompClient.subscribe("/topic/question/" + quizGlobalData?.f_quizzId, (response) => {
                    const f_question: IClientQuestion = JSON.parse(response.body);
                    setCurrentQuestion(f_question);
                    setTimer(f_question.timeLimitInSeconds);
                    setDisableOptionSelect(false);
                });
            });

            return () => {
                stompClient.disconnect(() => {
                    console.log("Disconnected from WebSocket");
                });
            };
        };

        if (quizGlobalData?.f_quizzId) {
            fetchQuestion();
        }
    }, [quizGlobalData?.f_quizzId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                console.log("TIME" + prevTimer);

                if (prevTimer > 0) {
                    return prevTimer - 1;
                } else {
                    console.log("currentQuestion?.isLastQuestion" + currentQuestion?.lastQuestion);
                    if (currentQuestion?.lastQuestion) {
                        console.log("INSIDE");
                        setLastQuestion(true);
                    }
                    return prevTimer;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentQuestion]);

    useEffect(() => {
        console.log(lastQuestion)
        if(lastQuestion){
            console.log("Redirecting to bounty page...");
            router.push("/scores");    
        }
    }, [lastQuestion]);

    function handleUserSelectedOption(option: string): void {
        if (currentQuestion && !disableOptionSelect) {
            setDisableOptionSelect(true);

            const t_walletAddress = localStorage.getItem("address");
            const t_userName = localStorage.getItem("userName");

            const requestData = {
                walletAddress: t_walletAddress,
                answer: option,
                quizzId: quizGlobalData?.f_quizzId,
                questionId: currentQuestion.questionNumber,
                userName: t_userName
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

    return (
        <div className="page-wrapper question-grid">
            <div>
                <div>
                    <div className="timer-wrapper"><span className="timer">Timer</span> <span className="time">{timer}</span> <span className="seconds">seconds</span></div>
                </div>
                {currentQuestion && (
                    <div>
                        {/* <div>{currentQuestion.questionNumber + ""}</div> */}
                        <div className="timer-heading">{currentQuestion.text}</div>
                        <div className="answers-wrapper">
                            {currentQuestion.options.map((option: string, index: number) => (
                                <div key={index}>
                                    <div className="answer"
                                        onClick={() => handleUserSelectedOption(option)}
                                        style={{
                                            cursor: disableOptionSelect ? "not-allowed" : "pointer",
                                            // opacity: disableOptionSelect ? 0.5 : 1,
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
        </div>
    );
}
