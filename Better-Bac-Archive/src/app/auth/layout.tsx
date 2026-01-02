import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BetterBac | Authenticate',
  description: 'Like ManageBac, only better.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      {children}
    </main>
  );
}
