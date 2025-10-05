'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface StreamerData {
  streamerId: string
  streamerName: string
  twitchUsername: string
  color: string
  data: {
    totalSubs: number
    growth: number
  } | null
}

interface HistoryData {
  [streamerId: string]: {
    timestamp: string
    totalSubs: number
  }[]
}

export default function AnalyticsPage() {
  const [streamers, setStreamers] = useState<StreamerData[]>([])
  const [historyData, setHistoryData] = useState<HistoryData>({})
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestRes = await fetch('/api/subs/latest')
        const latestData = await latestRes.json()

        if (latestData.success) {
          setStreamers(latestData.streamers)

          const historyPromises = latestData.streamers.map(async (streamer: StreamerData) => {
            const res = await fetch(`/api/subs/history?streamerId=${streamer.streamerId}&days=${days}`)
            const data = await res.json()

            return {
              streamerId: streamer.streamerId,
              history: data.data || [],
            }
          })

          const histories = await Promise.all(historyPromises)

          const historyMap: HistoryData = {}
          histories.forEach((h) => {
            historyMap[h.streamerId] = h.history
          })

          setHistoryData(historyMap)
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const chartData = streamers.length > 0 && Object.keys(historyData).length > 0
    ? (historyData[streamers[0].streamerId] || []).map((entry, index) => {
        const dataPoint: any = {
          date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }

        streamers.forEach((streamer) => {
          const history = historyData[streamer.streamerId] || []
          dataPoint[streamer.streamerName] = history[index]?.totalSubs || 0
        })

        return dataPoint
      })
    : []

  const sortedByGrowth = [...streamers]
    .filter((s) => s.data !== null)
    .sort((a, b) => (b.data?.growth || 0) - (a.data?.growth || 0))

  const sortedByTotal = [...streamers]
    .filter((s) => s.data !== null)
    .sort((a, b) => (b.data?.totalSubs || 0) - (a.data?.totalSubs || 0))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Compare streamer performance and track trends
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Streamers Comparison</CardTitle>
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
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {streamers.map((streamer) => (
                      <Line
                        key={streamer.streamerId}
                        type="monotone"
                        dataKey={streamer.streamerName}
                        stroke={streamer.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top by Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedByTotal.map((streamer, index) => (
                    <div key={streamer.streamerId} className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: streamer.color }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{streamer.streamerName}</p>
                        <p className="text-sm text-muted-foreground">
                          @{streamer.twitchUsername}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {formatNumber(streamer.data?.totalSubs || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">subscribers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top by Today's Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedByGrowth.map((streamer, index) => (
                    <div key={streamer.streamerId} className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: streamer.color }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{streamer.streamerName}</p>
                        <p className="text-sm text-muted-foreground">
                          @{streamer.twitchUsername}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            (streamer.data?.growth || 0) >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {(streamer.data?.growth || 0) >= 0 ? '+' : ''}
                          {formatNumber(streamer.data?.growth || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
