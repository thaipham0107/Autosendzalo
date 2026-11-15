'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import {
  Plus,
  Play,
  Pause,
  Square,
  Clock,
  Image,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
} from 'lucide-react'
import type { Campaign } from '@/lib/types'

export default function CampaignsPage() {
  const {
    activeAccountId,
    getGroupsByAccount,
    getCampaignsByAccount,
    getFriendsByAccount,
    createCampaign,
    updateCampaign,
    addSendLog,
    updateSendLog,
    getLogsByCampaign,
    groups,
    friends,
  } = useAppStore()

  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  // Create form state
  const [form, setForm] = useState({
    name: '',
    groupId: '',
    content: '',
    intervalSeconds: 30,
  })
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accountGroups = activeAccountId ? getGroupsByAccount(activeAccountId) : []
  const accountCampaigns = activeAccountId ? getCampaignsByAccount(activeAccountId) : []
  const selectedCampaign = accountCampaigns.find((c) => c.id === selectedCampaignId)

  // Send queue runner ref
  const runnerRef = useRef<NodeJS.Timeout | null>(null)
  const runningCampaignRef = useRef<string | null>(null)

  const runNextSend = useCallback(
    (campaignId: string) => {
      const { campaigns, sendLogs, updateCampaign, updateSendLog } = useAppStore.getState()
      const campaign = campaigns.find((c) => c.id === campaignId)
      if (!campaign || campaign.status !== 'running') return

      const logs = sendLogs.filter((l) => l.campaignId === campaignId)
      const pending = logs.filter((l) => l.status === 'pending')

      if (pending.length === 0) {
        updateCampaign(campaignId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        })
        runningCampaignRef.current = null
        return
      }

      const nextLog = pending[0]
      updateSendLog(nextLog.id, {
        status: 'sent',
        sentAt: new Date().toISOString(),
      })
      updateCampaign(campaignId, {
        sentCount: campaign.sentCount + 1,
      })

      runnerRef.current = setTimeout(() => runNextSend(campaignId), campaign.intervalSeconds * 1000)
    },
    []
  )

  const handleStartCampaign = (campaign: Campaign) => {
    if (runnerRef.current) clearTimeout(runnerRef.current)
    runningCampaignRef.current = campaign.id

    // Create pending logs if first time
    const existingLogs = getLogsByCampaign(campaign.id)
    if (existingLogs.length === 0) {
      const group = groups.find((g) => g.id === campaign.groupId)
      if (!group) return
      for (const friendId of group.memberIds) {
        const friend = friends.find((f) => f.id === friendId)
        if (friend) {
          addSendLog({
            campaignId: campaign.id,
            friendId,
            friendName: friend.name,
            status: 'pending',
          })
        }
      }
    }

    updateCampaign(campaign.id, {
      status: 'running',
      startedAt: campaign.startedAt || new Date().toISOString(),
    })

    runnerRef.current = setTimeout(() => runNextSend(campaign.id), campaign.intervalSeconds * 1000)
  }

  const handlePauseCampaign = (campaign: Campaign) => {
    if (runnerRef.current) clearTimeout(runnerRef.current)
    runningCampaignRef.current = null
    updateCampaign(campaign.id, { status: 'paused' })
  }

  const handleStopCampaign = (campaign: Campaign) => {
    if (runnerRef.current) clearTimeout(runnerRef.current)
    runningCampaignRef.current = null
    updateCampaign(campaign.id, { status: 'completed', completedAt: new Date().toISOString() })
  }

  // Manually mark one recipient as sent (honest manual-send flow)
  const handleMarkSent = (campaign: Campaign, logId: string) => {
    const { sendLogs: allLogs } = useAppStore.getState()
    const log = allLogs.find((l) => l.id === logId)
    if (!log || log.status !== 'pending') return
    updateSendLog(logId, { status: 'sent', sentAt: new Date().toISOString() })
    const remaining = allLogs.filter(
      (l) => l.campaignId === campaign.id && l.status === 'pending' && l.id !== logId
    )
    updateCampaign(campaign.id, {
      sentCount: campaign.sentCount + 1,
      startedAt: campaign.startedAt || new Date().toISOString(),
      ...(remaining.length === 0
        ? { status: 'completed', completedAt: new Date().toISOString() }
        : { status: campaign.status === 'draft' ? 'running' : campaign.status }),
    })
  }

  useEffect(() => {
    return () => {
      if (runnerRef.current) clearTimeout(runnerRef.current)
    }
  }, [])

  // Restart running campaigns on mount
  useEffect(() => {
    if (!activeAccountId) return
    const running = accountCampaigns.find((c) => c.status === 'running')
    if (running && !runningCampaignRef.current) {
      runningCampaignRef.current = running.id
      runnerRef.current = setTimeout(() => runNextSend(running.id), running.intervalSeconds * 1000)
    }
  }, [activeAccountId])

  // When opening a campaign detail, build the recipient list for manual sending
  useEffect(() => {
    if (view !== 'detail' || !selectedCampaign) return
    if (getLogsByCampaign(selectedCampaign.id).length > 0) return
    const group = groups.find((g) => g.id === selectedCampaign.groupId)
    if (!group) return
    for (const friendId of group.memberIds) {
      const friend = friends.find((f) => f.id === friendId)
      if (friend) {
        addSendLog({
          campaignId: selectedCampaign.id,
          friendId,
          friendName: friend.name,
          status: 'pending',
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedCampaignId])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - images.length
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreateCampaign = () => {
    if (!form.name || !form.groupId || !form.content || !activeAccountId) return
    const group = accountGroups.find((g) => g.id === form.groupId)
    if (!group) return

    createCampaign({
      name: form.name,
      accountId: activeAccountId,
      groupId: form.groupId,
      content: form.content,
      images,
      totalRecipients: group.memberIds.length,
      intervalSeconds: form.intervalSeconds,
    })

    setForm({ name: '', groupId: '', content: '', intervalSeconds: 30 })
    setImages([])
    setView('list')
  }

  if (!activeAccountId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Chọn tài khoản Zalo trước
      </div>
    )
  }

  if (view === 'create') {
    return <CreateCampaignForm
      groups={accountGroups}
      form={form}
      setForm={setForm}
      images={images}
      setImages={setImages}
      fileInputRef={fileInputRef}
      onImageUpload={handleImageUpload}
      onSubmit={handleCreateCampaign}
      onCancel={() => setView('list')}
    />
  }

  if (view === 'detail' && selectedCampaign) {
    return <CampaignDetail
      campaign={selectedCampaign}
      logs={getLogsByCampaign(selectedCampaign.id)}
      groups={groups}
      onBack={() => setView('list')}
      onStart={() => handleStartCampaign(selectedCampaign)}
      onPause={() => handlePauseCampaign(selectedCampaign)}
      onStop={() => handleStopCampaign(selectedCampaign)}
      onMarkSent={(logId: string) => handleMarkSent(selectedCampaign, logId)}
    />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chiến dịch gửi tin</h1>
          <p className="text-sm text-gray-500 mt-0.5">{accountCampaigns.length} chiến dịch</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          Tạo chiến dịch
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
        <strong>Lưu ý:</strong> App không tự động gửi tin Zalo. Đây là công cụ soạn nội dung và
        <strong> hỗ trợ gửi tay</strong>: mở chi tiết chiến dịch để copy nội dung từng người, gửi
        trong Zalo rồi đánh dấu đã gửi. Bộ đếm "Bắt đầu" chỉ mô phỏng tiến độ theo giãn cách.
      </div>

      {accountCampaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có chiến dịch nào</p>
          <button
            onClick={() => setView('create')}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Tạo chiến dịch đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {accountCampaigns.map((campaign) => {
            const group = accountGroups.find((g) => g.id === campaign.groupId)
            const progress = campaign.totalRecipients > 0
              ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
              : 0

            return (
              <div
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-sm">{campaign.content}</p>
                    {group && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        <Users size={10} className="inline mr-1" />
                        {group.name} · {campaign.totalRecipients} người
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    {campaign.status === 'draft' || campaign.status === 'paused' ? (
                      <button
                        onClick={() => handleStartCampaign(campaign)}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        title="Bắt đầu"
                      >
                        <Play size={14} />
                      </button>
                    ) : campaign.status === 'running' ? (
                      <button
                        onClick={() => handlePauseCampaign(campaign)}
                        className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        title="Tạm dừng"
                      >
                        <Pause size={14} />
                      </button>
                    ) : null}
                    {(campaign.status === 'running' || campaign.status === 'paused') && (
                      <button
                        onClick={() => handleStopCampaign(campaign)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Dừng"
                      >
                        <Square size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCampaignId(campaign.id)
                        setView('detail')
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{campaign.sentCount}/{campaign.totalRecipients} đã gửi</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        campaign.status === 'completed' ? 'bg-green-500' :
                        campaign.status === 'running' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {campaign.images.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {campaign.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-8 h-8 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {campaign.images.length > 4 && (
                      <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{campaign.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreateCampaignForm({
  groups,
  form,
  setForm,
  images,
  setImages,
  fileInputRef,
  onImageUpload,
  onSubmit,
  onCancel,
}: any) {
  const selectedGroup = groups.find((g: any) => g.id === form.groupId)

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-xl font-bold text-gray-900">Tạo chiến dịch gửi tin</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        {/* Campaign name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên chiến dịch *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="VD: Khuyến mãi tháng 11, Flash sale cuối năm..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhóm khách hàng *</label>
          <select
            value={form.groupId}
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Chọn nhóm —</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.memberIds.length} người)
              </option>
            ))}
          </select>
          {selectedGroup && (
            <p className="text-xs text-blue-600 mt-1">
              Sẽ gửi đến {selectedGroup.memberIds.length} người trong nhóm "{selectedGroup.name}"
            </p>
          )}
          {groups.length === 0 && (
            <p className="text-xs text-orange-500 mt-1">
              Chưa có nhóm khách hàng. Vui lòng tạo nhóm trước.
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nội dung tin nhắn *
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Nhập nội dung ưu đãi, khuyến mãi..."
            rows={5}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.content.length} ký tự</p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Hình ảnh đính kèm
            <span className="text-gray-400 font-normal ml-1">(tối đa 5 ảnh)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((img: string, i: number) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setImages((prev: string[]) => prev.filter((_: string, idx: number) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                <Image size={18} />
                <span className="text-xs mt-1">Thêm ảnh</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
          />
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Giãn cách giữa các lần gửi
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={300}
              step={5}
              value={form.intervalSeconds}
              onChange={(e) => setForm({ ...form, intervalSeconds: Number(e.target.value) })}
              className="flex-1"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 min-w-[80px] text-center">
              <span className="text-sm font-bold text-blue-700">{form.intervalSeconds}s</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <Clock size={10} className="inline mr-1" />
            Gửi mỗi {form.intervalSeconds} giây · Thời gian ước tính:{' '}
            {selectedGroup
              ? formatDuration(selectedGroup.memberIds.length * form.intervalSeconds)
              : '—'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          onClick={onSubmit}
          disabled={!form.name || !form.groupId || !form.content}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Tạo chiến dịch
        </button>
      </div>
    </div>
  )
}

function CampaignDetail({ campaign, logs, groups, onBack, onStart, onPause, onStop, onMarkSent }: any) {
  const group = groups.find((g: any) => g.id === campaign.groupId)
  const sentLogs = logs.filter((l: any) => l.status === 'sent')
  const pendingLogs = logs.filter((l: any) => l.status === 'pending')
  const failedLogs = logs.filter((l: any) => l.status === 'failed')
  const progress = campaign.totalRecipients > 0
    ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
    : 0

  const [copied, setCopied] = useState(false)
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(campaign.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1">
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {(campaign.status === 'draft' || campaign.status === 'paused') && (
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <Play size={14} />
              {campaign.status === 'paused' ? 'Tiếp tục' : 'Tự đánh dấu'}
            </button>
          )}
          {campaign.status === 'running' && (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              <Pause size={14} />
              Tạm dừng
            </button>
          )}
          {(campaign.status === 'running' || campaign.status === 'paused') && (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              <Square size={14} />
              Dừng hẳn
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{sentLogs.length}</p>
          <p className="text-xs text-green-600">Đã gửi</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{pendingLogs.length}</p>
          <p className="text-xs text-blue-600">Chờ gửi</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{failedLogs.length}</p>
          <p className="text-xs text-red-600">Thất bại</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Tiến độ</span>
          <span className="text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              campaign.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{campaign.sentCount} người đã nhận</span>
          <span>Còn lại: {campaign.totalRecipients - campaign.sentCount}</span>
        </div>
      </div>

      {/* Content preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Nội dung tin nhắn
        </p>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{campaign.content}</p>
          {campaign.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {campaign.images.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Giãn cách: {campaign.intervalSeconds}s · Nhóm: {group?.name || '—'}
        </p>
      </div>

      {/* Manual send helper */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Gửi tay
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Copy nội dung, mở Zalo và gửi cho từng người, sau đó bấm "Đã gửi" bên dưới để theo dõi.
          {campaign.images.length > 0 && ' Ảnh cần tự đính kèm trong Zalo.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyContent}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Copy size={14} />
            {copied ? 'Đã copy!' : 'Copy nội dung'}
          </button>
          <a
            href="https://chat.zalo.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            <ExternalLink size={14} />
            Mở Zalo
          </a>
        </div>
      </div>

      {/* Send log */}
      {logs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nhật ký gửi tin ({logs.length})
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {logs.map((log: any) => (
              <div key={log.id} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.status === 'sent' ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : log.status === 'failed' ? (
                    <XCircle size={14} className="text-red-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm text-gray-700">{log.friendName}</span>
                </div>
                <div className="text-right">
                  {log.status === 'sent' && log.sentAt ? (
                    <span className="text-xs text-gray-400">
                      {new Date(log.sentAt).toLocaleTimeString('vi-VN')}
                    </span>
                  ) : log.status === 'pending' ? (
                    <button
                      onClick={() => onMarkSent(log.id)}
                      className="text-xs px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors"
                    >
                      Đã gửi
                    </button>
                  ) : (
                    <span className="text-xs text-red-400">{log.error || 'Lỗi'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-600' },
    running: { label: '● Đang gửi', color: 'bg-blue-100 text-blue-700' },
    paused: { label: 'Tạm dừng', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: '✓ Hoàn thành', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Lỗi', color: 'bg-red-100 text-red-700' },
  }
  const s = map[status] || map.draft
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  )
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return s > 0 ? `${m}p ${s}s` : `${m} phút`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}p` : `${h} giờ`
}
