import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Streamer from '@/lib/models/Streamer'
import SubData from '@/lib/models/SubData'

export const dynamic = 'force-dynamic'
export const revalidate = 30

export async function GET() {
  try {
    await connectDB()

    const streamers = await Streamer.find({})

    const latestSubData = await Promise.all(
      streamers.map(async (streamer) => {
        const latestData = await SubData.findOne({
          streamerId: streamer._id,
        })
          .sort({ timestamp: -1 })
          .lean()

        return {
          streamerId: streamer._id,
          streamerName: streamer.name,
          twitchUsername: streamer.twitchUsername,
          color: streamer.color,
          logoUrl: streamer.logoUrl,
          data: latestData || null,
        }
      })
    )

    const sorted = latestSubData
      .filter((s) => s.data !== null)
      .sort((a, b) => (b.data?.totalSubs || 0) - (a.data?.totalSubs || 0))

    const totalCombinedSubs = sorted.reduce(
      (sum, s) => sum + (s.data?.totalSubs || 0),
      0
    )

    return NextResponse.json({
      success: true,
      streamers: sorted,
      totalCombinedSubs,
      lastUpdated: sorted[0]?.data?.timestamp || new Date(),
    })
  } catch (error) {
    console.error('Get latest subs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
