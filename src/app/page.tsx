'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardPage from '@/components/pages/DashboardPage'
import AddAccountPage from '@/components/pages/AddAccountPage'
import FriendsPage from '@/components/pages/FriendsPage'
import GroupsPage from '@/components/pages/GroupsPage'
import CampaignsPage from '@/components/pages/CampaignsPage'

export default function Home() {
  const [page, setPage] = useState('dashboard')

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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">{renderPage()}</div>
      </main>
    </div>
  )
}

function SettingsPage() {
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
    </div>
  )
}
