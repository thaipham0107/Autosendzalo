'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Phone, User, ArrowLeft, Shield, Eye, EyeOff, Smartphone } from 'lucide-react'

interface AddAccountPageProps {
  onBack: () => void
  onSuccess: () => void
}

export default function AddAccountPage({ onBack, onSuccess }: AddAccountPageProps) {
  const { addAccount, setActiveAccount } = useAppStore()
  const [step, setStep] = useState<'info' | 'qr' | 'phone'>('info')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loginMethod, setLoginMethod] = useState<'qr' | 'phone'>('qr')
  const [loading, setLoading] = useState(false)

  const handleAddAccount = () => {
    if (!phone || !name) return
    setLoading(true)

    setTimeout(() => {
      const account = addAccount(phone, name)
      setActiveAccount(account.id)
      setLoading(false)
      onSuccess()
    }, 1000)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Thêm tài khoản Zalo</h1>
        <p className="text-gray-500 mt-1">Đăng nhập để quản lý gửi tin nhắn</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Shield size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Bảo mật tài khoản</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Mật khẩu của bạn <strong>không được lưu trữ</strong>. Chỉ lưu thông tin tài khoản cơ bản
            để hiển thị và quản lý.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên hiển thị
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên hiển thị cho tài khoản"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Số điện thoại Zalo
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phương thức đăng nhập
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLoginMethod('qr')}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                loginMethod === 'qr'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-1">📱</div>
              <div className="text-sm font-medium">Quét mã QR</div>
              <div className="text-xs text-gray-500 mt-0.5">Dùng app Zalo quét</div>
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                loginMethod === 'phone'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone size={18} className="mb-1 text-gray-600" />
              <div className="text-sm font-medium">Số điện thoại</div>
              <div className="text-xs text-gray-500 mt-0.5">Nhập OTP xác thực</div>
            </button>
          </div>
        </div>

        {loginMethod === 'qr' && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-40 h-40 bg-white border-2 border-gray-200 rounded-lg mx-auto flex items-center justify-center mb-3">
              <div className="text-gray-400 text-xs text-center">
                <div className="text-3xl mb-2">⬜</div>
                <p>Mã QR sẽ hiển thị</p>
                <p>sau khi kết nối</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Mở app Zalo → Cài đặt → Thiết bị đã đăng nhập → Thêm thiết bị
            </p>
          </div>
        )}

        {loginMethod === 'phone' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700">
              Nhập số điện thoại ở trên và nhấn "Thêm tài khoản" để nhận mã OTP xác thực.
            </p>
          </div>
        )}

        <button
          onClick={handleAddAccount}
          disabled={!phone || !name || loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Thêm tài khoản'
          )}
        </button>
      </div>
    </div>
  )
}
