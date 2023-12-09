import type { Metadata } from "next";
import { QuizDataProvider } from "../../context/quizDataContext";
export const metadata: Metadata = {
    title: "apequest",
    description: "Apequest Dapp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <QuizDataProvider>{children}</QuizDataProvider>
            </body>
        </html>
    );
}
