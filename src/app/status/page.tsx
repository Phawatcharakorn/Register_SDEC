import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import StatusChecker from '@/components/StatusChecker'

export const metadata: Metadata = {
  title: 'ตรวจสอบสถานะการสมัคร | SDEC',
}

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header — same style as main page */}
      <header className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 50%, #0D47A1 100%)' }}>

        {/* Hexagon pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="white" strokeWidth="1.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)"/>
          </svg>
        </div>
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #90CAF9, transparent)' }}/>

        <div className="relative mx-auto max-w-2xl px-6 py-8 sm:px-8">
          {/* Back link */}
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับหน้าหลัก
          </Link>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:gap-6">
            <div className="shrink-0">
              <div className="relative h-16 w-16 rounded-xl shadow-lg"
                style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.25)' }}>
                <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-white/30">
                  <Image src="/sdec-logo.jpg" alt="SDEC Logo" fill className="object-cover" sizes="64px" priority />
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
              </p>
              <h1 className="text-xl font-bold sm:text-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                ตรวจสอบสถานะการสมัคร
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Student Development and Excellence Center
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #FFC107, #FFD700, transparent)' }}/>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <StatusChecker />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-6">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SDEC · มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
          </p>
          <Link href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin
          </Link>
        </div>
      </footer>
    </main>
  )
}
