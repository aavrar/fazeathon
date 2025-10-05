'use client'

import { useEffect, useState } from 'react'
import { StreamerCard } from './StreamerCard'
import { Navbar } from './Navbar'
import { formatNumber } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

interface StreamerData {
  streamerId: string
  streamerName: string
  twitchUsername: string
  color: string
  data: {
    totalSubs: number
    paidSubs: number
    giftedSubs: number
    growth: number
    timestamp: string
  } | null
}

interface DashboardData {
  streamers: StreamerData[]
  totalCombinedSubs: number
  lastUpdated: string
}

export function Dashboard() {
  const { user } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/subs/latest')
      if (!response.ok) throw new Error('Failed to fetch data')

      const result = await response.json()
      if (result.success) {
        setData(result)
        setLastUpdated(new Date())
        setError(null)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {user && !user.teamId && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="container mx-auto px-4 py-3 text-center">
            <p className="font-medium">
              Pick your champion to start earning points and coins!
            </p>
            <Link
              href="/join"
              className="inline-block mt-2 px-4 py-1.5 bg-white text-purple-600 rounded-md font-semibold hover:bg-gray-100"
            >
              Choose Your Team
            </Link>
          </div>
        </div>
      )}

      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Live Tracker</h1>
              <p className="text-muted-foreground mt-1">
                Real-time subscriber tracking updated every 5 minutes
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Combined Subscribers</p>
          <p className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {formatNumber(data.totalCombinedSubs)}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.streamers.map((streamer, index) => (
            <StreamerCard
              key={streamer.streamerId}
              streamer={streamer}
              rank={index + 1}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
