import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Prediction from '@/lib/models/Prediction'
import User from '@/lib/models/User'
import SubData from '@/lib/models/SubData'
import Streamer from '@/lib/models/Streamer'
import { startOfDay, subDays } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const yesterday = subDays(new Date(), 1)
    const startOfYesterday = startOfDay(yesterday)

    const unscored = await Prediction.find({
      date: startOfYesterday,
      scored: false,
    }).populate('userId')

    if (unscored.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No predictions to score',
        scored: 0,
      })
    }

    const streamers = await Streamer.find({})

    const endOfYesterday = new Date(startOfYesterday)
    endOfYesterday.setHours(23, 59, 59, 999)

    const yesterdaySubData = await Promise.all(
      streamers.map(async (streamer) => {
        const data = await SubData.findOne({
          streamerId: streamer._id,
          timestamp: { $gte: startOfYesterday, $lte: endOfYesterday },
        }).sort({ timestamp: -1 })

        return {
          streamerId: streamer._id,
          data,
        }
      })
    )

    const growthData = streamers.map((streamer) => {
      const yesterdayData = yesterdaySubData.find(
        (d) => d.streamerId.toString() === streamer._id.toString()
      )?.data

      return {
        streamerId: streamer._id,
        growth: yesterdayData?.growth || 0,
      }
    })

    const winner = growthData.reduce((max, current) =>
      current.growth > max.growth ? current : max
    )

    const totalCombinedSubs = yesterdaySubData.reduce(
      (sum, d) => sum + (d.data?.totalSubs || 0),
      0
    )

    const scoredResults = []

    for (const prediction of unscored) {
      const user = await User.findById(prediction.userId)

      if (!user) continue

      let points = 0
      let coins = 0

      const winnerCorrect = prediction.predictions.winnerId.toString() === winner.streamerId.toString()

      if (winnerCorrect) {
        points += 100
        coins += 20
      }

      const userTeamData = yesterdaySubData.find(
        (d) => d.streamerId.toString() === user.teamId?.toString()
      )?.data

      if (userTeamData) {
        const predictedSubs = prediction.predictions.userStreamerSubCount
        const actualSubs = userTeamData.totalSubs
        const accuracy = Math.abs(predictedSubs - actualSubs) / actualSubs

        if (accuracy <= 0.05) {
          points += 50
          coins += 10
        } else if (accuracy <= 0.10) {
          points += 25
          coins += 5
        }
      }

      const totalPredicted = prediction.predictions.totalCombinedSubs
      const totalAccuracy = Math.abs(totalPredicted - totalCombinedSubs) / totalCombinedSubs

      if (totalAccuracy <= 0.05) {
        points += 30
      } else if (totalAccuracy <= 0.10) {
        points += 15
      }

      if (user.currentStreak >= 7) {
        points *= 3
      } else if (user.currentStreak >= 3) {
        points *= 2
      }

      user.points += points
      user.coins += coins
      user.totalPredictions += 1

      if (winnerCorrect) {
        user.correctPredictions += 1
        user.currentStreak += 1

        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak
        }
      } else {
        user.currentStreak = 0
      }

      const newLevel = Math.floor(user.points / 1000) + 1
      if (newLevel > user.level) {
        user.level = newLevel
        user.coins += 50
      }

      await user.save()

      prediction.scored = true
      prediction.pointsAwarded = points
      prediction.coinsAwarded = coins
      prediction.accuracy = {
        winnerCorrect,
        subCountAccuracy: userTeamData ? Math.abs(prediction.predictions.userStreamerSubCount - userTeamData.totalSubs) : 0,
        totalSubsAccuracy: Math.abs(totalPredicted - totalCombinedSubs),
      }

      await prediction.save()

      scoredResults.push({
        username: user.username,
        points,
        coins,
        winnerCorrect,
      })
    }

    return NextResponse.json({
      success: true,
      scored: scoredResults.length,
      results: scoredResults,
      winner: streamers.find((s) => s._id.toString() === winner.streamerId.toString())?.name,
    })
  } catch (error) {
    console.error('Scoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
