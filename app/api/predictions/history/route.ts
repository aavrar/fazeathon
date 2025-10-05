import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Prediction from '@/lib/models/Prediction'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const anonymousId = searchParams.get('anonymousId')

    if (!anonymousId) {
      return NextResponse.json(
        { error: 'anonymousId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ anonymousId })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const predictions = await Prediction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('predictions.winnerId')
      .lean()

    return NextResponse.json({
      success: true,
      predictions,
    })
  } catch (error) {
    console.error('Get prediction history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
