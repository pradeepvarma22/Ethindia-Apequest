import "./globals.css";
import type { Metadata } from "next";
import Web3ModalProvider from "./web3-provider";
import { QuizDataProvider } from "../../context/quizDataContext";
export const metadata: Metadata = {
    title: "apequest",
    description: "Apequest Dapp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Web3ModalProvider>
                    <QuizDataProvider>{children}</QuizDataProvider>
                </Web3ModalProvider>
            </body>
        </html>
    );
}