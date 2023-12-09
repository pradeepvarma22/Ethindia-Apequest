"use client";
import React, { createContext, useContext, useState } from 'react';

interface QuizData {
  f_userName: string;
  f_walletAddress: string;
  f_quizzId: number;
}

interface QuizDataContextType {
  quizGlobalData: QuizData | null;
  setGlobalQuizData: React.Dispatch<React.SetStateAction<QuizData | null>>;
}

const QuizDataContext = createContext<QuizDataContextType | undefined>(undefined);

export function useQuizData() {
  const context = useContext(QuizDataContext);
  if (!context) {
    throw new Error('useQuizData must be used within a QuizDataProvider');
  }
  return context;
}

export function QuizDataProvider({ children }: { children: React.ReactNode }) {
  const [quizGlobalData, setGlobalQuizData] = useState<QuizData | null>(null);

  return (
    <QuizDataContext.Provider value={{ quizGlobalData, setGlobalQuizData }}>
      {children}
    </QuizDataContext.Provider>
  );
}
