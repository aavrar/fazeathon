'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Trophy, TrendingUp, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Streamer {
  _id: string
  name: string
  twitchUsername: string
  color: string
}

interface CommunityStats {
  streamerId: string
  streamerName: string
  color: string
  count: number
  percentage: number
}

export default function PredictPage() {
  const { user, refreshUser } = useUser()
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [selectedWinner, setSelectedWinner] = useState<string>('')
  const [userStreamerSubCount, setUserStreamerSubCount] = useState('')
  const [totalCombinedSubs, setTotalCombinedSubs] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [communityStats, setCommunityStats] = useState<CommunityStats[]>([])
  const [totalPredictions, setTotalPredictions] = useState(0)
  const [userPrediction, setUserPrediction] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamersRes, predictionsRes] = await Promise.all([
          fetch('/api/streamers'),
          fetch(`/api/predictions/today?anonymousId=${localStorage.getItem('anonymousId')}`),
        ])

        const streamersData = await streamersRes.json()
        const predictionsData = await predictionsRes.json()

        if (streamersData.success) {
          setStreamers(streamersData.streamers)
        }

        if (predictionsData.success) {
          setCommunityStats(predictionsData.communityStats)
          setTotalPredictions(predictionsData.totalPredictions)
          setUserPrediction(predictionsData.userPrediction)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Please wait while we load your profile')
      return
    }

    if (!user.teamId) {
      setError('Please select a team first')
      return
    }

    if (!selectedWinner || !userStreamerSubCount || !totalCombinedSubs) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/predictions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId: localStorage.getItem('anonymousId'),
          winnerId: selectedWinner,
          userStreamerSubCount: parseInt(userStreamerSubCount),
          totalCombinedSubs: parseInt(totalCombinedSubs),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        await refreshUser()
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(data.error || 'Failed to submit prediction')
      }
    } catch (err) {
      setError('Failed to submit prediction')
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Daily Predictions</h1>
            <p className="text-muted-foreground">
              Predict today's subscriber growth and earn points & coins
            </p>
          </div>

          {!user?.teamId && (
            <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="pt-6">
                <p className="font-medium">
                  You must select a team before making predictions.
                </p>
                <Link
                  href="/join"
                  className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Choose Your Team
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Correct winner: <span className="font-bold">+100 points</span></p>
                <p>• Sub count within 5%: <span className="font-bold">+50 points</span></p>
                <p>• Sub count within 10%: <span className="font-bold">+25 points</span></p>
                <p>• 3-day streak: <span className="font-bold">2x multiplier</span></p>
                <p>• 7-day streak: <span className="font-bold">3x multiplier</span></p>
                <p className="pt-2 text-yellow-600 dark:text-yellow-400">
                  +10 coins just for predicting!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Community Predictions
                </CardTitle>
                <CardDescription>{formatNumber(totalPredictions)} predictions made today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {communityStats.map((stat) => (
                  <div key={stat.streamerId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{stat.streamerName}</span>
                      <span className="text-sm font-bold">{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {userPrediction ? (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Your Prediction Submitted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-medium">Predicted Winner:</span>{' '}
                  {userPrediction.predictions?.winnerId?.name || 'Loading...'}
                </p>
                <p>
                  <span className="font-medium">Your Team Sub Count:</span>{' '}
                  {formatNumber(userPrediction.predictions.userStreamerSubCount)}
                </p>
                <p>
                  <span className="font-medium">Total Combined Subs:</span>{' '}
                  {formatNumber(userPrediction.predictions.totalCombinedSubs)}
                </p>
                <p className="text-sm text-muted-foreground pt-2">
                  Check back tomorrow to see your results!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Make Your Prediction</CardTitle>
                <CardDescription>
                  Predictions lock at the end of today. Choose wisely!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Which streamer will gain the most subs today?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {streamers.map((streamer) => (
                        <button
                          key={streamer._id}
                          type="button"
                          onClick={() => setSelectedWinner(streamer._id)}
                          className={`p-3 border-2 rounded-md transition-all ${
                            selectedWinner === streamer._id
                              ? 'ring-2 ring-offset-2'
                              : 'hover:border-gray-400'
                          }`}
                          style={{
                            borderColor: selectedWinner === streamer._id ? streamer.color : undefined,
                            ['--tw-ring-color' as any]: selectedWinner === streamer._id ? streamer.color : undefined,
                          }}
                        >
                          <p className="font-semibold">{streamer.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="userSubs" className="block text-sm font-medium mb-2">
                      Predicted sub count for YOUR team (end of day)
                    </label>
                    <input
                      id="userSubs"
                      type="number"
                      min="0"
                      value={userStreamerSubCount}
                      onChange={(e) => setUserStreamerSubCount(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="e.g., 55000"
                      disabled={!user?.teamId}
                    />
                  </div>

                  <div>
                    <label htmlFor="totalSubs" className="block text-sm font-medium mb-2">
                      Total combined subs (all 6 streamers)
                    </label>
                    <input
                      id="totalSubs"
                      type="number"
                      min="0"
                      value={totalCombinedSubs}
                      onChange={(e) => setTotalCombinedSubs(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="e.g., 250000"
                      disabled={!user?.teamId}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  {success && (
                    <p className="text-green-500 text-sm">
                      Prediction submitted successfully! +10 coins earned
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !user?.teamId || success}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  >
                    {submitting ? 'Submitting...' : 'Submit Prediction'}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
