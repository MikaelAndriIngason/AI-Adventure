/* eslint-disable @next/next/no-html-link-for-pages */
import "./globals.css";
import '../public/toastify.css';

import { AdventureProvider } from "./context/AdventureContext";
import { ToastContainer } from "react-toastify";

import { PTSerifFont } from "./lib/fonts";

export const metadata = {
    title: "AI Adventure",
    description: "AI storymaker"
}

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={PTSerifFont.className}>
                <AdventureProvider>
                    {children}
                    <ToastContainer
                        position="bottom-left"
                        autoClose={3000}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnHover={false}
                        theme="dark"
                    />
                </AdventureProvider>
            </body> 
        </html>
    );
}