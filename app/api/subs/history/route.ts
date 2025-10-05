import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SubData from '@/lib/models/SubData'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamerId = searchParams.get('streamerId')
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 7

    if (!streamerId) {
      return NextResponse.json(
        { error: 'streamerId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const historyData = await SubData.find({
      streamerId,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: historyData,
      days,
    })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
