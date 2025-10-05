'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Trophy, Coins, TrendingUp, Target, Award, Flame, Share2, Edit } from 'lucide-react'

interface PredictionHistory {
  _id: string
  date: string
  predictions: {
    winnerId: {
      name: string
      color: string
    }
    userStreamerSubCount: number
    totalCombinedSubs: number
  }
  scored: boolean
  pointsAwarded: number
  coinsAwarded: number
  accuracy: {
    winnerCorrect: boolean
  }
}

export default function ProfilePage() {
  const { user, loading: userLoading, updateUser } = useUser()
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/predictions/history?anonymousId=${localStorage.getItem('anonymousId')}`)
        const data = await response.json()

        if (data.success) {
          setPredictionHistory(data.predictions)
        }
      } catch (error) {
        console.error('Failed to fetch prediction history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchHistory()
    }
  }, [user])

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return

    try {
      await updateUser({ username: newUsername } as any)
      setEditingUsername(false)
      setNewUsername('')
    } catch (error) {
      console.error('Failed to update username:', error)
    }
  }

  const copyReferralLink = () => {
    if (!user) return
    const link = `${window.location.origin}?ref=${user.referralCode}`
    navigator.clipboard.writeText(link)
    alert('Referral link copied!')
  }

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const accuracyRate = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile</CardTitle>
                  {!editingUsername && (
                    <button
                      onClick={() => {
                        setEditingUsername(true)
                        setNewUsername(user.username)
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingUsername ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="New username"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateUsername}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUsername(false)}
                        className="px-3 py-1.5 border rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                )}

                {user.teamId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team</p>
                    <span
                      className="inline-block px-3 py-1 rounded-md text-white font-semibold"
                      style={{ backgroundColor: user.teamId.color }}
                    >
                      {user.teamId.name}
                    </span>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-500" />
                      <span className="text-sm">Points</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(user.points)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">Coins</span>
                    </div>
                    <span className="text-xl font-bold">{formatNumber(user.coins)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Level</span>
                    </div>
                    <span className="text-xl font-bold">{user.level}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={copyReferralLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Referral Link
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Earn 50 coins for each friend
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{accuracyRate}%</p>
                    <p className="text-xs text-muted-foreground">
                      {user.correctPredictions} / {user.totalPredictions} correct
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{user.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">
                      Best: {user.longestStreak} days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Predictions</CardTitle>
                  <CardDescription>Your last 10 predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-4">Loading...</p>
                  ) : predictionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {predictionHistory.map((prediction) => (
                        <div
                          key={prediction._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: prediction.predictions?.winnerId?.color }}
                              />
                              <p className="font-medium">{prediction.predictions?.winnerId?.name}</p>
                              {prediction.scored && prediction.accuracy?.winnerCorrect && (
                                <span className="text-xs text-green-500 font-semibold">✓ Correct</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(prediction.date).toLocaleDateString()}
                            </p>
                          </div>

                          {prediction.scored && (
                            <div className="text-right">
                              <p className="text-sm font-bold text-purple-600">
                                +{prediction.pointsAwarded} pts
                              </p>
                              <p className="text-xs text-yellow-600">
                                +{prediction.coinsAwarded} coins
                              </p>
                            </div>
                          )}

                          {!prediction.scored && (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No predictions yet. Make your first prediction today!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
