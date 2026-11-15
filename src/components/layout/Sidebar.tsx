'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import {
  Users,
  MessageSquare,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Send,
  LayoutDashboard,
  X,
  Menu,
} from 'lucide-react'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { accounts, activeAccountId, setActiveAccount } = useAppStore()
  const [accountsExpanded, setAccountsExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeAccount = accounts.find((a) => a.id === activeAccountId)

  const navigate = (page: string) => {
    onNavigate(page)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Send size={16} />
          </div>
          <div>
            <h1 className="font-bold text-sm">AutoSendZalo</h1>
            <p className="text-xs text-gray-400">Quản lý gửi tin</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-gray-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => navigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            activePage === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard size={16} />
          Tổng quan
        </button>

        <div>
          <button
            onClick={() => setAccountsExpanded(!accountsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200"
          >
            <span>Tài khoản Zalo</span>
            {accountsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {accountsExpanded && (
            <div className="mt-1 space-y-1">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    setActiveAccount(account.id)
                    navigate('dashboard')
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeAccountId === account.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-gray-900 ${
                        account.loginStatus === 'connected' ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="truncate font-medium text-xs">{account.name}</p>
                    <p className="truncate text-xs text-gray-500">{account.phone}</p>
                  </div>
                  {account.loginStatus === 'connected' ? (
                    <Wifi size={12} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <WifiOff size={12} className="text-gray-500 flex-shrink-0" />
                  )}
                </button>
              ))}

              <button
                onClick={() => navigate('add-account')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors border border-dashed border-gray-700"
              >
                <Plus size={14} />
                Thêm tài khoản
              </button>
            </div>
          )}
        </div>

        {activeAccountId && (
          <>
            <div className="pt-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                {activeAccount?.name}
              </p>
            </div>

            <button
              onClick={() => navigate('friends')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === 'friends'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Users size={16} />
              Danh sách bạn bè
            </button>

            <button
              onClick={() => navigate('groups')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === 'groups'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Users size={16} />
              Nhóm khách hàng
            </button>

            <button
              onClick={() => navigate('campaigns')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === 'campaigns'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <MessageSquare size={16} />
              Chiến dịch gửi tin
            </button>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => navigate('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            activePage === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <Settings size={16} />
          Cài đặt
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-700 flex items-center px-4 py-3 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
            <Send size={12} />
          </div>
          <span className="font-bold text-white text-sm">AutoSendZalo</span>
        </div>
        {activeAccount && (
          <span className="ml-auto text-xs text-gray-400 truncate max-w-[120px]">
            {activeAccount.name}
          </span>
        )}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-gray-900 text-white flex flex-col z-50 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col h-full flex-shrink-0">
        {sidebarContent}
      </div>
    </>
  )
}
