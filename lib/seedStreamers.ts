import connectDB from './mongodb'
import Streamer from './models/Streamer'

export const STREAMERS = [
  {
    name: 'JasonTheWeen',
    twitchUsername: 'jasontheween',
    color: '#FF6B6B',
    description: 'Faze Clan member',
  },
  {
    name: 'Silky',
    twitchUsername: 'silky',
    color: '#4ECDC4',
    description: 'Faze Clan member',
  },
  {
    name: 'StableRonaldo',
    twitchUsername: 'stableronaldo',
    color: '#95E1D3',
    description: 'Faze Clan member',
  },
  {
    name: 'Lacy',
    twitchUsername: 'lacy',
    color: '#FFE66D',
    description: 'Faze Clan member',
  },
  {
    name: 'Adapt',
    twitchUsername: 'adapt',
    color: '#A8E6CF',
    description: 'Faze Clan member',
  },
  {
    name: 'Kaysan',
    twitchUsername: 'kaysan',
    color: '#C7CEEA',
    description: 'Faze Clan member',
  },
]

export async function seedStreamers() {
  try {
    await connectDB()

    for (const streamerData of STREAMERS) {
      await Streamer.findOneAndUpdate(
        { twitchUsername: streamerData.twitchUsername },
        streamerData,
        { upsert: true, new: true }
      )
    }

    console.log('Streamers seeded successfully')
  } catch (error) {
    console.error('Error seeding streamers:', error)
    throw error
  }
}
