export function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export function generateUsername(): string {
  const adjectives = [
    'Swift', 'Bold', 'Silent', 'Fierce', 'Cosmic', 'Neon', 'Shadow', 'Thunder',
    'Crystal', 'Phantom', 'Blazing', 'Mystic', 'Elite', 'Rapid', 'Stellar'
  ]
  const nouns = [
    'Wolf', 'Tiger', 'Eagle', 'Dragon', 'Phoenix', 'Viper', 'Falcon', 'Panther',
    'Hawk', 'Lion', 'Warrior', 'Knight', 'Hunter', 'Champion', 'Legend'
  ]

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 9999)

  return `${adj}${noun}${num}`
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
