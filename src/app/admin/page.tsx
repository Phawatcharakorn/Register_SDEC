'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(
        error.message.includes('Invalid login')
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
          : 'เกิดข้อผิดพลาด กรุณาลองใหม่',
      )
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ku-green font-bold text-ku-gold text-lg">
            SDEC
          </div>
          <h1 className="text-xl font-bold text-gray-900">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="mt-1 text-sm text-gray-500">SDEC Admin Portal</p>
        </div>

        {/* Card */}
        <div className="section-card">
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">อีเมล</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ku.th"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          ระบบนี้สำหรับเจ้าหน้าที่ SDEC เท่านั้น
        </p>
      </div>
    </main>
  )
}
