'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatGrowth } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

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

interface StreamerCardProps {
  streamer: StreamerData
  rank: number
}

export function StreamerCard({ streamer, rank }: StreamerCardProps) {
  if (!streamer.data) {
    return null
  }

  const growth = streamer.data.growth
  const isPositive = growth >= 0

  return (
    <Link href={`/streamer/${streamer.twitchUsername}`}>
      <Card
        className="relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        style={{
          borderLeft: `4px solid ${streamer.color}`,
        }}
      >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {streamer.streamerName}
          </CardTitle>
          <span className="text-2xl font-bold text-muted-foreground">
            #{rank}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-3xl font-bold">
            {formatNumber(streamer.data.totalSubs)}
          </p>
          <p className="text-xs text-muted-foreground">Total Subscribers</p>
        </div>

        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatGrowth(growth)}
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div>
            <p className="font-medium">{formatNumber(streamer.data.paidSubs)}</p>
            <p className="text-muted-foreground">Paid</p>
          </div>
          <div>
            <p className="font-medium">{formatNumber(streamer.data.giftedSubs)}</p>
            <p className="text-muted-foreground">Gifted</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
