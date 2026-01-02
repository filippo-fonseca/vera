import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "BetterBac | Student Login",
    description: "Like ManageBac, only better.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
