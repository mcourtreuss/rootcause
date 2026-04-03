import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' })

export const metadata = {
  title: 'RootCause — Your Garden Companion',
  description:
    'Smart beginner gardening planner with forecast-aware planting advice, watering guides, and companion planting recommendations.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans bg-cream text-bark min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
