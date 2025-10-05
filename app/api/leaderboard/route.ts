import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const teamId = searchParams.get('teamId')

    await connectDB()

    let query: any = {}

    if (teamId) {
      query.teamId = teamId
    }

    const users = await User.find(query)
      .sort({ points: -1 })
      .limit(100)
      .populate('teamId')
      .select('-anonymousId')
      .lean()

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      teamName: user.teamId?.name || 'No Team',
      teamColor: user.teamId?.color || '#888888',
      points: user.points,
      coins: user.coins,
      level: user.level,
      currentStreak: user.currentStreak,
      totalPredictions: user.totalPredictions,
      correctPredictions: user.correctPredictions,
      accuracy: user.totalPredictions > 0
        ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
        : 0,
    }))

    const teamStats = await User.aggregate([
      {
        $match: { teamId: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: '$teamId',
          totalPoints: { $sum: '$points' },
          memberCount: { $sum: 1 },
          avgPoints: { $avg: '$points' },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
    ])

    const populatedTeamStats = await Promise.all(
      teamStats.map(async (stat) => {
        const streamerInfo = await User.findOne({ teamId: stat._id })
          .populate('teamId')
          .select('teamId')

        return {
          teamId: stat._id,
          teamName: streamerInfo?.teamId?.name || 'Unknown',
          teamColor: streamerInfo?.teamId?.color || '#888888',
          totalPoints: stat.totalPoints,
          memberCount: stat.memberCount,
          avgPoints: Math.round(stat.avgPoints),
        }
      })
    )

    return NextResponse.json({
      success: true,
      leaderboard,
      teamStats: populatedTeamStats,
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
