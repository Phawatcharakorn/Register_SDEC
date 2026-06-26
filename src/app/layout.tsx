import type { Metadata } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-sans-thai',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'สมัคร SDEC | มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา',
  description: 'ระบบรับสมัครนิสิตเข้าร่วมศูนย์พัฒนานิสิตสู่ความเป็นเลิศ (SDEC)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm',
              error: '!border-red-200',
              success: '!border-green-200',
            },
          }}
        />
      </body>
    </html>
  )
}
