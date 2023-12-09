"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useQuizData } from "../../../context/quizDataContext";
import SockJS from "sockjs-client";
import * as stomp from "webstomp-client";
import Timer from "../../../components/timer";

interface IClientQuestion {
    questionNumber: Number;
    text: String;
    options: [];
    category: String;
    imageUrl: String;
    tags: [];
    timeLimitInSeconds: Number;
    isLastQuestion: boolean;
}

export default function Question() {
    const { chain } = useNetwork();
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<IClientQuestion | null>(null);
    const [disableOptionSelect, setDisableOptionSelect] = useState(false);
    // const [userData, setUserData] = useState<IUserData | null>(null);

    const { quizGlobalData, setGlobalQuizData } = useQuizData();

    console.log(quizGlobalData);

    useEffect(() => {
        const URI = process.env.NEXT_PUBLIC_URI + "/apequest-ws-endpoint/";
        const ws = new SockJS(URI);
        const stompClient = stomp.over(ws);

        stompClient.connect({}, () => {
            console.log("Connected to WebSocket");

            stompClient.subscribe("/topic/question/" + quizGlobalData?.f_quizzId, (response) => {
                console.log("------------------- Response --------------------");
                console.log(response);

                const f_question: IClientQuestion = JSON.parse(response.body);
                setCurrentQuestion(f_question);
                console.log("---------------- Question ---------------------------");
                console.log(f_question);
            });
        });
    }, []);

    useEffect(() => {
        setDisableOptionSelect(false);
    }, [currentQuestion?.questionNumber]);


    function handleUserSelectedOption(event: any){
        console.log(event);
    }

    return (
        <div>
            <div>
                <div>
                    {/* <Timer key={currentQuestion?.questionNumber} questionNumber={currentQuestion?.questionNumber} /> */}
                </div>
                {currentQuestion && (
                    <div>
                        <div>{currentQuestion.questionNumber + ""}</div>
                        <div>{currentQuestion.text}</div>
                        <div>
                            {currentQuestion.options.map((option: string, index: number) => (
                                <div key={index}>
                                    <div onClick={handleUserSelectedOption}>{option}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
