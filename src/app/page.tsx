import Image from 'next/image'
import Link from 'next/link'
import ApplicationForm from '@/components/forms/ApplicationForm'
import HeroSection from '@/components/HeroSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header */}
      <header className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 50%, #0D47A1 100%)' }}>

        {/* Hexagon pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="white" strokeWidth="1.2"/>
                <polygon points="0,2 24,14 24,38 0,50" fill="none" stroke="white" strokeWidth="0.8"/>
                <polygon points="56,2 80,14 80,38 56,50" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)"/>
          </svg>
        </div>

        {/* Soft orbs */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #90CAF9, transparent)' }}/>
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #BBDEFB, transparent)' }}/>

        {/* Content */}
        <div className="relative mx-auto max-w-3xl px-6 py-10 sm:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:gap-6">

            {/* Logo with glow ring */}
            <div className="shrink-0">
              <div className="relative h-20 w-20 rounded-2xl shadow-xl"
                style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.25), 0 0 24px rgba(255,255,255,0.15)' }}>
                <div className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-white/30">
                  <Image
                    src="/sdec-logo.jpg"
                    alt="SDEC Logo"
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
              </p>
              <h1 className="text-2xl font-bold leading-snug sm:text-3xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ
              </h1>
              <p className="text-sm font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                Student Development and Excellence Center
              </p>
            </div>
          </div>
        </div>

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #FFC107, #FFD700, transparent)' }}/>
      </header>

      {/* Form area */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <div className="mb-8">
          <HeroSection />
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">สมัครเข้าร่วม SDEC</h2>
          <p className="mt-1 text-sm text-gray-500">
            กรุณากรอกข้อมูลให้ครบถ้วนและตรวจสอบความถูกต้องก่อนกดส่งใบสมัคร
          </p>
        </div>

        <ApplicationForm />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} SDEC · มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
          </p>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
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
