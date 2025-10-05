import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateUsername, generateReferralCode } from '@/lib/userUtils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anonymousId, referredBy } = body

    if (!anonymousId) {
      return NextResponse.json(
        { error: 'anonymousId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ anonymousId })

    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        isNew: false,
      })
    }

    const username = generateUsername()
    const referralCode = generateReferralCode()

    const user = new User({
      anonymousId,
      username,
      referralCode,
      referredBy: referredBy || undefined,
      lastActive: new Date(),
    })

    await user.save()

    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy })
      if (referrer) {
        referrer.coins += 50
        await referrer.save()
      }
    }

    return NextResponse.json({
      success: true,
      user,
      isNew: true,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
