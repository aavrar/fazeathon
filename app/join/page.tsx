'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface Streamer {
  _id: string
  name: string
  twitchUsername: string
  color: string
  description: string
}

export default function JoinPage() {
  const { user, updateUser, loading: userLoading } = useUser()
  const router = useRouter()
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const response = await fetch('/api/streamers')
        const data = await response.json()

        if (data.success) {
          setStreamers(data.streamers)
        }
      } catch (error) {
        console.error('Failed to fetch streamers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreamers()
  }, [])

  useEffect(() => {
    if (user?.teamId) {
      router.push('/')
    }
  }, [user, router])

  const handleSelectTeam = async () => {
    if (!selectedTeam || submitting) return

    setSubmitting(true)

    try {
      await updateUser({ teamId: selectedTeam } as any)
      router.push('/')
    } catch (error) {
      console.error('Failed to select team:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (userLoading || loading) {
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Choose Your Champion</h1>
            <p className="text-lg text-muted-foreground">
              Select a streamer to represent in the Faze Subathon competition
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You can switch teams once per week, but you'll lose your streak bonus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {streamers.map((streamer) => (
              <Card
                key={streamer._id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTeam === streamer._id
                    ? 'ring-2 ring-offset-2'
                    : ''
                }`}
                style={{
                  borderLeft: `4px solid ${streamer.color}`,
                  ['--tw-ring-color' as any]: selectedTeam === streamer._id ? streamer.color : undefined,
                }}
                onClick={() => setSelectedTeam(streamer._id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{streamer.name}</CardTitle>
                    {selectedTeam === streamer._id && (
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: streamer.color }}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{streamer.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">@{streamer.twitchUsername}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleSelectTeam}
              disabled={!selectedTeam || submitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
