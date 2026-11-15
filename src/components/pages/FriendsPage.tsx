'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Search, Plus, Trash2, Upload, User, Phone, ChevronDown } from 'lucide-react'

export default function FriendsPage() {
  const { activeAccountId, getFriendsByAccount, addFriend, removeFriend } = useAppStore()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [bulkText, setBulkText] = useState('')

  const friends = activeAccountId ? getFriendsByAccount(activeAccountId) : []
  const filtered = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.phone && f.phone.includes(search))
  )

  const handleAddFriend = () => {
    if (!newName || !activeAccountId) return
    addFriend(activeAccountId, { name: newName, phone: newPhone })
    setNewName('')
    setNewPhone('')
    setShowAddModal(false)
  }

  const handleBulkImport = () => {
    if (!activeAccountId) return
    const lines = bulkText.split('\n').filter((l) => l.trim())
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim())
      const name = parts[0]
      const phone = parts[1] || ''
      if (name) {
        addFriend(activeAccountId, { name, phone })
      }
    }
    setBulkText('')
    setShowImportModal(false)
  }

  if (!activeAccountId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Chọn tài khoản Zalo trước
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Danh sách bạn bè</h1>
          <p className="text-sm text-gray-500 mt-0.5">{friends.length} người bạn</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Upload size={15} />
            Nhập hàng loạt
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Thêm bạn
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Friends list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {friends.length === 0
              ? 'Chưa có bạn bè nào. Thêm mới hoặc nhập hàng loạt.'
              : 'Không tìm thấy kết quả'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tên
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày thêm
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((friend) => (
                <tr key={friend.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{friend.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{friend.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(friend.addedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddModal && (
        <Modal title="Thêm bạn bè mới" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddFriend}
                disabled={!newName}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Thêm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <Modal title="Nhập hàng loạt" onClose={() => setShowImportModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-medium mb-1">Định dạng:</p>
              <p>Mỗi dòng một người: <code className="bg-gray-200 px-1 rounded">Tên, Số điện thoại</code></p>
              <p className="mt-1 text-gray-400">Ví dụ:</p>
              <pre className="text-gray-500 mt-0.5">Nguyễn Văn A, 0901234567{'\n'}Trần Thị B, 0912345678</pre>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Nhập danh sách bạn bè..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Nhập ({bulkText.split('\n').filter((l) => l.trim()).length} người)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
