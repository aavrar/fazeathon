'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  teamName: string
  teamColor: string
  points: number
  coins: number
  level: number
  currentStreak: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
}

interface TeamStat {
  teamId: string
  teamName: string
  teamColor: string
  totalPoints: number
  memberCount: number
  avgPoints: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'individual' | 'team'>('individual')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const data = await response.json()

        if (data.success) {
          setLeaderboard(data.leaderboard)
          setTeamStats(data.teamStats)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />
    return <span className="text-muted-foreground">#{rank}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">
              See how you stack up against other fans
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedTab('individual')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'individual'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setSelectedTab('team')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'team'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Teams
            </button>
          </div>

          {selectedTab === 'individual' ? (
            <Card>
              <CardHeader>
                <CardTitle>Top 100 Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{entry.username}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: entry.teamColor }}
                          >
                            {entry.teamName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Level {entry.level}</span>
                          <span>{entry.accuracy}% accuracy</span>
                          {entry.currentStreak > 0 && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <TrendingUp className="h-3 w-3" />
                              {entry.currentStreak} streak
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatNumber(entry.points)}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No players yet. Be the first to make predictions!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {teamStats.map((team, index) => (
                <Card
                  key={team.teamId}
                  style={{ borderLeft: `4px solid ${team.teamColor}` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{team.teamName}</CardTitle>
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(team.totalPoints)}</p>
                        <p className="text-xs text-muted-foreground">Total Points</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatNumber(team.avgPoints)}</p>
                        <p className="text-xs text-muted-foreground">Avg per Player</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{formatNumber(team.memberCount)} members</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {teamStats.length === 0 && (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No teams yet
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
