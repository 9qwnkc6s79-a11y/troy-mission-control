// Google Places API (New) Service for Reviews
// Documentation: https://developers.google.com/maps/documentation/places/web-service/op-overview

const GOOGLE_PLACES_API_BASE = 'https://places.googleapis.com/v1'

interface GoogleConfig {
  apiKey: string
  placeIdLittleElm: string
  placeIdProsper: string
}

function getConfig(): GoogleConfig {
  return {
    apiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    placeIdLittleElm: process.env.GOOGLE_PLACE_ID_LITTLE_ELM || '',
    placeIdProsper: process.env.GOOGLE_PLACE_ID_PROSPER || ''
  }
}

// Types
export interface ReviewData {
  rating: number
  totalReviews: number
  recentReviews: Review[]
  thisMonthCount: number
}

export interface Review {
  authorName: string
  rating: number
  text: string
  time: Date
  relativeTime: string
  profilePhotoUrl?: string
}

export interface LocationReviewData {
  littleElm: ReviewData | null
  prosper: ReviewData | null
}

// Get place ID based on location
function getPlaceId(location: 'little-elm' | 'prosper'): string {
  const config = getConfig()
  return location === 'little-elm' ? config.placeIdLittleElm : config.placeIdProsper
}

// Fetch place details including reviews using Places API (New)
export async function fetchPlaceDetails(location: 'little-elm' | 'prosper'): Promise<ReviewData | null> {
  const config = getConfig()

  if (!config.apiKey) {
    console.error('Google Places API key not configured')
    return null
  }

  const placeId = getPlaceId(location)
  if (!placeId) {
    console.error(`Place ID not configured for ${location}`)
    return null
  }

  try {
    // Places API (New) uses different endpoint format
    const response = await fetch(
      `${GOOGLE_PLACES_API_BASE}/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': config.apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Places API error:', response.status, errorText)
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()

    // Process reviews from new API format
    const reviews: Review[] = (data.reviews || []).map((review: any) => ({
      authorName: review.authorAttribution?.displayName || 'Anonymous',
      rating: review.rating || 0,
      text: review.text?.text || '',
      time: new Date(review.publishTime || Date.now()),
      relativeTime: review.relativePublishTimeDescription || '',
      profilePhotoUrl: review.authorAttribution?.photoUri
    }))

    // Count reviews from this month
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthCount = reviews.filter(r => r.time >= thisMonthStart).length

    return {
      rating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
      recentReviews: reviews,
      thisMonthCount
    }
  } catch (error) {
    console.error('Error fetching place details:', error)
    return null
  }
}

// Fetch reviews for all locations
export async function fetchAllLocationReviews(): Promise<LocationReviewData> {
  const [littleElm, prosper] = await Promise.all([
    fetchPlaceDetails('little-elm'),
    fetchPlaceDetails('prosper')
  ])

  return { littleElm, prosper }
}

// Search for a place by name using Places API (New)
export async function searchPlace(query: string): Promise<{ placeId: string, name: string, address: string }[]> {
  const config = getConfig()

  if (!config.apiKey) {
    console.error('Google Places API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `${GOOGLE_PLACES_API_BASE}/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': config.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: query
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Places search error:', response.status, errorText)
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.places || []).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || ''
    }))
  } catch (error) {
    console.error('Error searching places:', error)
    return []
  }
}
