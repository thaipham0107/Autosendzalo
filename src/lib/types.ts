export interface ZaloAccount {
  id: string
  phone: string
  name: string
  avatar?: string
  loginStatus: 'connected' | 'disconnected' | 'pending'
  addedAt: string
  lastActive?: string
  friendCount?: number
}

export interface ZaloFriend {
  id: string
  accountId: string
  name: string
  phone?: string
  avatar?: string
  addedAt: string
}

export interface CustomerGroup {
  id: string
  name: string
  description?: string
  accountId: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  accountId: string
  groupId: string
  content: string
  images: string[]
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed'
  totalRecipients: number
  sentCount: number
  failedCount: number
  intervalSeconds: number
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface SendLog {
  id: string
  campaignId: string
  friendId: string
  friendName: string
  status: 'pending' | 'sent' | 'failed'
  sentAt?: string
  error?: string
}
