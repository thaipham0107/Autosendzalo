'use client'

import { useAppStore } from '@/store/appStore'
import { Users, MessageSquare, Send, TrendingUp, Plus, AlertCircle } from 'lucide-react'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { accounts, friends, groups, campaigns, activeAccountId, getFriendsByAccount, getGroupsByAccount, getCampaignsByAccount } = useAppStore()

  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  const accountFriends = activeAccountId ? getFriendsByAccount(activeAccountId) : []
  const accountGroups = activeAccountId ? getGroupsByAccount(activeAccountId) : []
  const accountCampaigns = activeAccountId ? getCampaignsByAccount(activeAccountId) : []

  const runningCampaigns = accountCampaigns.filter((c) => c.status === 'running')
  const completedCampaigns = accountCampaigns.filter((c) => c.status === 'completed')
  const totalSent = accountCampaigns.reduce((sum, c) => sum + c.sentCount, 0)

  if (!activeAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Chưa chọn tài khoản</h2>
        <p className="text-gray-500 text-sm mb-4 max-w-xs">
          Chọn một tài khoản Zalo ở sidebar hoặc thêm tài khoản mới để bắt đầu
        </p>
        <button
          onClick={() => onNavigate('add-account')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Thêm tài khoản
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
            {activeAccount?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{activeAccount?.name}</h2>
            <p className="text-blue-200 text-sm">{activeAccount?.phone}</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              activeAccount?.loginStatus === 'connected'
                ? 'bg-green-400/20 text-green-200'
                : 'bg-gray-400/20 text-gray-200'
            }`}>
              {activeAccount?.loginStatus === 'connected' ? '● Đã kết nối' : '○ Ngắt kết nối'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={20} className="text-blue-500" />}
          label="Bạn bè"
          value={accountFriends.length}
          bg="bg-blue-50"
          onClick={() => onNavigate('friends')}
        />
        <StatCard
          icon={<Users size={20} className="text-purple-500" />}
          label="Nhóm KH"
          value={accountGroups.length}
          bg="bg-purple-50"
          onClick={() => onNavigate('groups')}
        />
        <StatCard
          icon={<MessageSquare size={20} className="text-green-500" />}
          label="Chiến dịch"
          value={accountCampaigns.length}
          bg="bg-green-50"
          onClick={() => onNavigate('campaigns')}
        />
        <StatCard
          icon={<Send size={20} className="text-orange-500" />}
          label="Tin đã gửi"
          value={totalSent}
          bg="bg-orange-50"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            icon="👥"
            title="Quản lý bạn bè"
            desc="Xem & nhập danh sách bạn bè"
            onClick={() => onNavigate('friends')}
          />
          <QuickAction
            icon="📂"
            title="Tạo nhóm khách hàng"
            desc="Phân nhóm bạn bè theo danh mục"
            onClick={() => onNavigate('groups')}
          />
          <QuickAction
            icon="📤"
            title="Tạo chiến dịch gửi tin"
            desc="Soạn & gửi tin nhắn hàng loạt"
            onClick={() => onNavigate('campaigns')}
          />
        </div>
      </div>

      {/* Recent campaigns */}
      {accountCampaigns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Chiến dịch gần đây</h3>
            <button
              onClick={() => onNavigate('campaigns')}
              className="text-xs text-blue-600 hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-2">
            {accountCampaigns.slice(0, 3).map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{campaign.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {campaign.sentCount}/{campaign.totalRecipients} người đã nhận
                  </p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, bg, onClick }: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`${bg} rounded-xl p-4 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        {onClick && <span className="text-xs text-gray-400">→</span>}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function QuickAction({ icon, title, desc, onClick }: {
  icon: string
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
    running: { label: 'Đang gửi', color: 'bg-blue-100 text-blue-700' },
    paused: { label: 'Tạm dừng', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Lỗi', color: 'bg-red-100 text-red-700' },
  }
  const s = map[status] || map.draft
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}
