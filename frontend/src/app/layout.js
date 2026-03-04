import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: ['--font-inter'],
    display: 'swap',
})

export const metadata = {
    title: 'TestFlow - Test Management System',
    description: 'Personal Test Management System for QA Engineers',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className={inter.className}>{children}</body>
        </html>
    )
}
