import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { ZaloAccount, ZaloFriend, CustomerGroup, Campaign, SendLog } from '@/lib/types'

interface AppState {
  accounts: ZaloAccount[]
  friends: ZaloFriend[]
  groups: CustomerGroup[]
  campaigns: Campaign[]
  sendLogs: SendLog[]
  activeAccountId: string | null

  // Account actions
  addAccount: (phone: string, name: string) => ZaloAccount
  updateAccount: (id: string, updates: Partial<ZaloAccount>) => void
  removeAccount: (id: string) => void
  setActiveAccount: (id: string | null) => void

  // Friend actions
  addFriend: (accountId: string, friend: Omit<ZaloFriend, 'id' | 'accountId' | 'addedAt'>) => void
  removeFriend: (id: string) => void
  getFriendsByAccount: (accountId: string) => ZaloFriend[]

  // Group actions
  createGroup: (accountId: string, name: string, description?: string) => CustomerGroup
  updateGroup: (id: string, updates: Partial<CustomerGroup>) => void
  deleteGroup: (id: string) => void
  addFriendsToGroup: (groupId: string, friendIds: string[]) => void
  removeFriendFromGroup: (groupId: string, friendId: string) => void
  getGroupsByAccount: (accountId: string) => CustomerGroup[]

  // Campaign actions
  createCampaign: (data: Omit<Campaign, 'id' | 'status' | 'sentCount' | 'failedCount' | 'createdAt'>) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  getCampaignsByAccount: (accountId: string) => Campaign[]

  // Send log actions
  addSendLog: (log: Omit<SendLog, 'id'>) => void
  updateSendLog: (id: string, updates: Partial<SendLog>) => void
  getLogsByCampaign: (campaignId: string) => SendLog[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      friends: [],
      groups: [],
      campaigns: [],
      sendLogs: [],
      activeAccountId: null,

      addAccount: (phone, name) => {
        const account: ZaloAccount = {
          id: uuidv4(),
          phone,
          name,
          loginStatus: 'connected',
          addedAt: new Date().toISOString(),
        }
        set((state) => ({ accounts: [...state.accounts, account] }))
        return account
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      removeAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          friends: state.friends.filter((f) => f.accountId !== id),
          groups: state.groups.filter((g) => g.accountId !== id),
          activeAccountId: state.activeAccountId === id ? null : state.activeAccountId,
        }))
      },

      setActiveAccount: (id) => set({ activeAccountId: id }),

      addFriend: (accountId, friend) => {
        const newFriend: ZaloFriend = {
          id: uuidv4(),
          accountId,
          addedAt: new Date().toISOString(),
          ...friend,
        }
        set((state) => ({ friends: [...state.friends, newFriend] }))
      },

      removeFriend: (id) => {
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== id),
          groups: state.groups.map((g) => ({
            ...g,
            memberIds: g.memberIds.filter((mid) => mid !== id),
          })),
        }))
      },

      getFriendsByAccount: (accountId) => {
        return get().friends.filter((f) => f.accountId === accountId)
      },

      createGroup: (accountId, name, description) => {
        const group: CustomerGroup = {
          id: uuidv4(),
          accountId,
          name,
          description,
          memberIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ groups: [...state.groups, group] }))
        return group
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        }))
      },

      deleteGroup: (id) => {
        set((state) => ({ groups: state.groups.filter((g) => g.id !== id) }))
      },

      addFriendsToGroup: (groupId, friendIds) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  memberIds: [...new Set([...g.memberIds, ...friendIds])],
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }))
      },

      removeFriendFromGroup: (groupId, friendId) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  memberIds: g.memberIds.filter((id) => id !== friendId),
                  updatedAt: new Date().toISOString(),
                }
              : g
          ),
        }))
      },

      getGroupsByAccount: (accountId) => {
        return get().groups.filter((g) => g.accountId === accountId)
      },

      createCampaign: (data) => {
        const campaign: Campaign = {
          ...data,
          id: uuidv4(),
          status: 'draft',
          sentCount: 0,
          failedCount: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ campaigns: [...state.campaigns, campaign] }))
        return campaign
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      getCampaignsByAccount: (accountId) => {
        return get().campaigns.filter((c) => c.accountId === accountId)
      },

      addSendLog: (log) => {
        const newLog: SendLog = { id: uuidv4(), ...log }
        set((state) => ({ sendLogs: [...state.sendLogs, newLog] }))
      },

      updateSendLog: (id, updates) => {
        set((state) => ({
          sendLogs: state.sendLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }))
      },

      getLogsByCampaign: (campaignId) => {
        return get().sendLogs.filter((l) => l.campaignId === campaignId)
      },
    }),
    {
      name: 'autosendzalo-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        friends: state.friends,
        groups: state.groups,
        campaigns: state.campaigns,
        sendLogs: state.sendLogs,
        activeAccountId: state.activeAccountId,
      }),
    }
  )
)
