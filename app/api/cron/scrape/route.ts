import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Streamer from '@/lib/models/Streamer'
import SubData from '@/lib/models/SubData'
import { scrapeAllStreamers } from '@/lib/scraper'
import { seedStreamers } from '@/lib/seedStreamers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    await seedStreamers()

    const streamers = await Streamer.find({})

    if (streamers.length === 0) {
      return NextResponse.json({ error: 'No streamers found' }, { status: 404 })
    }

    const usernames = streamers.map((s) => s.twitchUsername)

    const scrapedData = await scrapeAllStreamers(usernames)

    const savedData = []

    for (const data of scrapedData) {
      const streamer = streamers.find(
        (s) => s.twitchUsername.toLowerCase() === data.twitchUsername.toLowerCase()
      )

      if (!streamer) continue

      const previousData = await SubData.findOne({
        streamerId: streamer._id,
      }).sort({ timestamp: -1 })

      const growth = previousData
        ? data.totalSubs - previousData.totalSubs
        : 0

      const subDataEntry = new SubData({
        streamerId: streamer._id,
        timestamp: new Date(),
        totalSubs: data.totalSubs,
        paidSubs: data.paidSubs,
        giftedSubs: data.giftedSubs,
        primeSubs: data.primeSubs,
        tier1Subs: data.tier1Subs,
        tier2Subs: data.tier2Subs,
        tier3Subs: data.tier3Subs,
        growth,
      })

      await subDataEntry.save()
      savedData.push({
        streamer: streamer.name,
        totalSubs: data.totalSubs,
        growth,
      })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    await SubData.deleteMany({ timestamp: { $lt: thirtyDaysAgo } })

    return NextResponse.json({
      success: true,
      scrapedCount: scrapedData.length,
      data: savedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
