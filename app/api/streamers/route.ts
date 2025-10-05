import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Streamer from '@/lib/models/Streamer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const streamers = await Streamer.find({}).sort({ name: 1 })

    return NextResponse.json({
      success: true,
      streamers,
    })
  } catch (error) {
    console.error('Get streamers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
