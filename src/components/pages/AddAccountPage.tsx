'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Phone, User, ArrowLeft, Info } from 'lucide-react'

interface AddAccountPageProps {
  onBack: () => void
  onSuccess: () => void
}

export default function AddAccountPage({ onBack, onSuccess }: AddAccountPageProps) {
  const { addAccount, setActiveAccount } = useAppStore()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  const handleAddAccount = () => {
    if (!phone || !name) return
    const account = addAccount(phone, name)
    setActiveAccount(account.id)
    onSuccess()
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
        <h1 className="text-2xl font-bold text-gray-900">Thêm hồ sơ tài khoản</h1>
        <p className="text-gray-500 mt-1">Tạo hồ sơ để tổ chức khách hàng & chiến dịch</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Đây KHÔNG phải đăng nhập Zalo</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Ứng dụng <strong>không kết nối trực tiếp với Zalo</strong> và không đăng nhập tài khoản
            của bạn. Mục này chỉ tạo một <strong>hồ sơ cục bộ</strong> (tên + số điện thoại) để bạn
            tổ chức danh sách bạn bè, nhóm khách hàng và soạn nội dung chiến dịch. Danh sách bạn bè
            cần được <strong>thêm thủ công hoặc nhập từ file</strong>.
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
              placeholder="VD: Zalo bán hàng, Zalo CSKH..."
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
          <p className="text-xs text-gray-400 mt-1.5">
            Chỉ dùng để nhận diện hồ sơ. Không có mật khẩu, không có đăng nhập.
          </p>
        </div>

        <button
          onClick={handleAddAccount}
          disabled={!phone || !name}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Tạo hồ sơ
        </button>
      </div>
    </div>
  )
}
