'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { generateAnonymousId } from '@/lib/userUtils'

interface User {
  _id: string
  anonymousId: string
  username: string
  teamId?: {
    _id: string
    name: string
    twitchUsername: string
    color: string
  }
  coins: number
  points: number
  level: number
  achievements: string[]
  currentStreak: number
  longestStreak: number
  totalPredictions: number
  correctPredictions: number
  referralCode: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  updateUser: (updates: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const initializeUser = async () => {
    try {
      let anonymousId = localStorage.getItem('anonymousId')

      if (!anonymousId) {
        anonymousId = generateAnonymousId()
        localStorage.setItem('anonymousId', anonymousId)
      }

      const referralCode = new URLSearchParams(window.location.search).get('ref')

      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId,
          referredBy: referralCode || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const anonymousId = localStorage.getItem('anonymousId')
      if (!anonymousId) return

      const response = await fetch(`/api/user?anonymousId=${anonymousId}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    try {
      const anonymousId = localStorage.getItem('anonymousId')
      if (!anonymousId) return

      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId,
          updates,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  useEffect(() => {
    initializeUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
