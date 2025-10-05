'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatGrowth } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StreamerData {
  _id: string
  name: string
  twitchUsername: string
  color: string
  description: string
}

interface SubHistory {
  timestamp: string
  totalSubs: number
  growth: number
}

export default function StreamerPage() {
  const params = useParams()
  const username = params?.username as string

  const [streamer, setStreamer] = useState<StreamerData | null>(null)
  const [latestData, setLatestData] = useState<any>(null)
  const [history, setHistory] = useState<SubHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const streamersRes = await fetch('/api/streamers')
        const streamersData = await streamersRes.json()

        const foundStreamer = streamersData.streamers.find(
          (s: any) => s.twitchUsername.toLowerCase() === username?.toLowerCase()
        )

        if (!foundStreamer) {
          setLoading(false)
          return
        }

        setStreamer(foundStreamer)

        const [latestRes, historyRes] = await Promise.all([
          fetch('/api/subs/latest'),
          fetch(`/api/subs/history?streamerId=${foundStreamer._id}&days=${days}`),
        ])

        const latestDataRes = await latestRes.json()
        const historyData = await historyRes.json()

        const streamerLatest = latestDataRes.streamers.find(
          (s: any) => s.streamerId === foundStreamer._id
        )

        setLatestData(streamerLatest)

        if (historyData.success) {
          setHistory(historyData.data)
        }
      } catch (error) {
        console.error('Failed to fetch streamer data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchData()
    }
  }, [username, days])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!streamer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Streamer not found</p>
        </div>
      </div>
    )
  }

  const chartData = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    subs: h.totalSubs,
  }))

  const totalGrowth = history.length > 1
    ? history[history.length - 1].totalSubs - history[0].totalSubs
    : 0

  const isPositiveGrowth = totalGrowth >= 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div
            className="mb-8 p-6 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${streamer.color}22 0%, ${streamer.color}11 100%)`,
              borderLeft: `4px solid ${streamer.color}`,
            }}
          >
            <h1 className="text-4xl font-bold mb-2">{streamer.name}</h1>
            <p className="text-muted-foreground">@{streamer.twitchUsername}</p>
          </div>

          {latestData && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Subs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatNumber(latestData.data.totalSubs)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Today's Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {latestData.data.growth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <p
                      className={`text-2xl font-bold ${
                        latestData.data.growth >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {formatGrowth(latestData.data.growth)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Paid Subs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatNumber(latestData.data.paidSubs)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Gifted Subs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatNumber(latestData.data.giftedSubs)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subscriber Trend</CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDays(7)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      days === 7 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setDays(14)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      days === 14 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    14 Days
                  </button>
                  <button
                    onClick={() => setDays(30)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      days === 30 ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {days}-Day Growth:{' '}
                  <span
                    className={`font-bold ${
                      isPositiveGrowth ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formatGrowth(totalGrowth)}
                  </span>
                </p>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="subs"
                      stroke={streamer.color}
                      strokeWidth={2}
                      dot={{ fill: streamer.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
