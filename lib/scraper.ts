import * as cheerio from 'cheerio'

export interface ScrapedSubData {
  twitchUsername: string
  totalSubs: number
  paidSubs: number
  giftedSubs: number
  primeSubs?: number
  tier1Subs?: number
  tier2Subs?: number
  tier3Subs?: number
}

export async function scrapeTwitchTrackerSubs(
  twitchUsername: string
): Promise<ScrapedSubData | null> {
  try {
    const url = `https://twitchtracker.com/${twitchUsername}/subscribers`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      next: {
        revalidate: 0
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${twitchUsername}: ${response.status}`)
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    let totalSubs = 0
    let paidSubs = 0
    let giftedSubs = 0
    let primeSubs = 0
    let tier1Subs = 0
    let tier2Subs = 0
    let tier3Subs = 0

    $('div.g-col-4').each((_, element) => {
      const label = $(element).find('p').first().text().trim()
      const valueText = $(element).find('p').last().text().trim()
      const value = parseInt(valueText.replace(/,/g, '')) || 0

      if (label.includes('Active Subscriptions')) {
        totalSubs = value
      } else if (label.includes('Active Paid Subscriptions')) {
        paidSubs = value
      } else if (label.includes('Active Gifted Subscriptions')) {
        giftedSubs = value
      }
    })

    $('div.row').each((_, element) => {
      const text = $(element).text()

      if (text.includes('Prime')) {
        const match = text.match(/(\d{1,3}(?:,\d{3})*)\s*Prime/)
        if (match) {
          primeSubs = parseInt(match[1].replace(/,/g, '')) || 0
        }
      }

      if (text.includes('Tier 1')) {
        const match = text.match(/(\d{1,3}(?:,\d{3})*)\s*Tier 1/)
        if (match) {
          tier1Subs = parseInt(match[1].replace(/,/g, '')) || 0
        }
      }

      if (text.includes('Tier 2')) {
        const match = text.match(/(\d{1,3}(?:,\d{3})*)\s*Tier 2/)
        if (match) {
          tier2Subs = parseInt(match[1].replace(/,/g, '')) || 0
        }
      }

      if (text.includes('Tier 3')) {
        const match = text.match(/(\d{1,3}(?:,\d{3})*)\s*Tier 3/)
        if (match) {
          tier3Subs = parseInt(match[1].replace(/,/g, '')) || 0
        }
      }
    })

    if (totalSubs === 0) {
      console.error(`No subscriber data found for ${twitchUsername}`)
      return null
    }

    return {
      twitchUsername,
      totalSubs,
      paidSubs,
      giftedSubs,
      primeSubs,
      tier1Subs,
      tier2Subs,
      tier3Subs,
    }
  } catch (error) {
    console.error(`Error scraping ${twitchUsername}:`, error)
    return null
  }
}

export async function scrapeAllStreamers(
  streamers: string[]
): Promise<ScrapedSubData[]> {
  const results = await Promise.allSettled(
    streamers.map((username) => scrapeTwitchTrackerSubs(username))
  )

  return results
    .filter((result) => result.status === 'fulfilled' && result.value !== null)
    .map((result) => (result as PromiseFulfilledResult<ScrapedSubData>).value)
}
