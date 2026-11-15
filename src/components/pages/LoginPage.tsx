'use client'

import { useState } from 'react'
import { Send, Eye, EyeOff, Lock } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

const CREDENTIALS: Record<string, string> = {
  'c4c08d28811434162774856e0a38fccb184556d187c35e17dcbb0454e6e2e8aa':
    '7f4b675467950e4d4b752d427c1fdb24bb97682ace8a8f61f7006dbac2f34d6d',
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    setError('')

    const userHash = await sha256(username.trim().toLowerCase())
    const passHash = await sha256(password)

    if (CREDENTIALS[userHash] === passHash) {
      try {
        sessionStorage.setItem('asz_auth', '1')
      } catch {}
      onLogin()
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Send size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AutoSendZalo</h1>
          <p className="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <Lock size={13} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!username || !password || loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Phiên đăng nhập tự động hết khi đóng trình duyệt
        </p>
      </div>
    </div>
  )
}
