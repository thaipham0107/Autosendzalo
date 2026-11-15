'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardPage from '@/components/pages/DashboardPage'
import AddAccountPage from '@/components/pages/AddAccountPage'
import FriendsPage from '@/components/pages/FriendsPage'
import GroupsPage from '@/components/pages/GroupsPage'
import CampaignsPage from '@/components/pages/CampaignsPage'
import LoginPage from '@/components/pages/LoginPage'

function isAuthenticated() {
  try {
    return sessionStorage.getItem('asz_auth') === '1'
  } catch {
    return false
  }
}

export default function Home() {
  const [page, setPage] = useState('dashboard')
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setAuthed(isAuthenticated())
    setChecking(false)
  }, [])

  if (checking) return null

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />
  }

  const handleNavigate = (p: string) => setPage(p)

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'add-account':
        return (
          <AddAccountPage
            onBack={() => setPage('dashboard')}
            onSuccess={() => setPage('dashboard')}
          />
        )
      case 'friends':
        return <FriendsPage />
      case 'groups':
        return <GroupsPage />
      case 'campaigns':
        return <CampaignsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activePage={page} onNavigate={handleNavigate} />
      {/* pt-14 on mobile to clear the fixed top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6">{renderPage()}</div>
      </main>
    </div>
  )
}

function SettingsPage() {
  const handleLogout = () => {
    try { sessionStorage.removeItem('asz_auth') } catch {}
    window.location.reload()
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Cài đặt</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-medium text-gray-800 mb-3">Về ứng dụng</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>AutoSendZalo</strong> v1.0.0</p>
          <p>Công cụ hỗ trợ sales quản lý nhiều tài khoản Zalo và gửi tin nhắn hàng loạt theo nhóm khách hàng.</p>
          <ul className="list-disc list-inside space-y-1 mt-3 text-gray-500">
            <li>Dữ liệu được lưu trữ cục bộ trên trình duyệt</li>
            <li>Mật khẩu Zalo không được lưu trữ</li>
            <li>Tin nhắn được gửi có giãn cách để tránh bị khóa tài khoản</li>
          </ul>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-medium text-gray-800 mb-3">Phiên đăng nhập</h2>
        <p className="text-sm text-gray-500 mb-4">Phiên hiện tại sẽ tự động hết khi đóng trình duyệt.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
