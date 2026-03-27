import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RootCause — Zone 9b Gardening Assistant',
  description:
    'Smart beginner gardening planner for Sunnyvale, CA (Zone 9b). Forecast-aware planting advice.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-emerald-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
