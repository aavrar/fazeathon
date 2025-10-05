'use client'

import { useUser } from '@/contexts/UserContext'
import { formatNumber } from '@/lib/utils'
import { Coins, Trophy, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const { user, loading } = useUser()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Faze Subathon
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/leaderboard" className="text-sm hover:underline">
              Leaderboard
            </Link>
            <Link href="/predict" className="text-sm hover:underline">
              Predict
            </Link>
            <Link href="/analytics" className="text-sm hover:underline">
              Analytics
            </Link>

            {!loading && user && (
              <div className="flex items-center gap-4 border-l pl-4">
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{formatNumber(user.coins)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <span className="font-semibold">{formatNumber(user.points)}</span>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent hover:bg-accent/80"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.username}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
