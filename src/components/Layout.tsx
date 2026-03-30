import Head from "next/head";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Navbar, { type NavbarProps } from "@/components/Navbar";

type LayoutProps = {
    children: ReactNode;
    title?: string;
    description?: string;
};

function getTab(pathname: string): NavbarProps["tab"] {
    switch (pathname) {
        case "/":
            return "home";
        case "/wordPractice":
            return "wordPractice";
        case "/articlePractice":
            return "articlePractice";
        case "/about":
            return "about";
        default:
            return "home";
    }
}

export default function Layout({
    children,
    title = "行列高手",
    description = "一個為了練習行列所開發的工具",
}: LayoutProps) {
    const router = useRouter();
    const tab = getTab(router.pathname);

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar tab={tab} />
            {children}
            <Footer />
        </>
    );
}
