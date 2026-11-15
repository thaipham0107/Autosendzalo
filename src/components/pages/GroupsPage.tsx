'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Plus, Trash2, Users, Edit2, Check, X, Search, UserPlus } from 'lucide-react'

export default function GroupsPage() {
  const {
    activeAccountId,
    getGroupsByAccount,
    getFriendsByAccount,
    createGroup,
    updateGroup,
    deleteGroup,
    addFriendsToGroup,
    removeFriendFromGroup,
  } = useAppStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [friendSearch, setFriendSearch] = useState('')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])

  const groups = activeAccountId ? getGroupsByAccount(activeAccountId) : []
  const friends = activeAccountId ? getFriendsByAccount(activeAccountId) : []
  const selectedGroup = groups.find((g) => g.id === selectedGroupId)

  const groupMembers = selectedGroup
    ? friends.filter((f) => selectedGroup.memberIds.includes(f.id))
    : []

  const nonMembers = friends.filter(
    (f) => !selectedGroup?.memberIds.includes(f.id) &&
      f.name.toLowerCase().includes(friendSearch.toLowerCase())
  )

  const handleCreateGroup = () => {
    if (!newGroupName || !activeAccountId) return
    const group = createGroup(activeAccountId, newGroupName, newGroupDesc)
    setSelectedGroupId(group.id)
    setNewGroupName('')
    setNewGroupDesc('')
    setShowCreateModal(false)
  }

  const handleAddMembers = () => {
    if (!selectedGroupId || selectedFriendIds.length === 0) return
    addFriendsToGroup(selectedGroupId, selectedFriendIds)
    setSelectedFriendIds([])
    setFriendSearch('')
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
          <h1 className="text-xl font-bold text-gray-900">Nhóm khách hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{groups.length} nhóm</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          Tạo nhóm
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Groups list */}
        <div className="col-span-5">
          {groups.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-xl">
              <Users size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có nhóm nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all ${
                    selectedGroupId === group.id
                      ? 'border-blue-500 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {editingGroupId === group.id ? (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          updateGroup(group.id, { name: editName })
                          setEditingGroupId(null)
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingGroupId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {group.memberIds.length} thành viên
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingGroupId(group.id)
                            setEditName(group.name)
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Xóa nhóm này?')) {
                              deleteGroup(group.id)
                              if (selectedGroupId === group.id) setSelectedGroupId(null)
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group details */}
        <div className="col-span-7">
          {selectedGroup ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{selectedGroup.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedGroup.memberIds.length} thành viên</p>
              </div>

              {/* Add members */}
              <div className="p-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Thêm thành viên
                </p>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm bạn bè..."
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {nonMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2 text-center">
                      {friends.length === 0 ? 'Chưa có bạn bè' : 'Tất cả đã trong nhóm'}
                    </p>
                  ) : (
                    nonMembers.map((f) => (
                      <label
                        key={f.id}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriendIds.includes(f.id)}
                          onChange={(e) =>
                            setSelectedFriendIds((prev) =>
                              e.target.checked
                                ? [...prev, f.id]
                                : prev.filter((id) => id !== f.id)
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-xs text-gray-700">{f.name}</span>
                        {f.phone && <span className="text-xs text-gray-400">{f.phone}</span>}
                      </label>
                    ))
                  )}
                </div>
                {selectedFriendIds.length > 0 && (
                  <button
                    onClick={handleAddMembers}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                  >
                    <UserPlus size={12} />
                    Thêm {selectedFriendIds.length} người
                  </button>
                )}
              </div>

              {/* Current members */}
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Thành viên hiện tại
                </p>
                {groupMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2 text-center">Chưa có thành viên</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {groupMembers.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                            {f.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-700">{f.name}</span>
                          {f.phone && <span className="text-xs text-gray-400">{f.phone}</span>}
                        </div>
                        <button
                          onClick={() => removeFriendFromGroup(selectedGroup.id, f.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl flex items-center justify-center h-48 text-gray-400 text-sm">
              Chọn nhóm để quản lý thành viên
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Tạo nhóm khách hàng</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Khách hàng VIP, Tiềm năng..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Mô tả về nhóm này..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Tạo nhóm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
