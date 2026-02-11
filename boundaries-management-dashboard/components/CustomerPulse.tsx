'use client'

import { Star, MessageSquare, ThumbsUp, MapPin } from 'lucide-react'

interface Review {
  id: number
  platform: 'Google' | 'Yelp' | 'Facebook'
  rating: number
  text: string
  author: string
  date: string
  location: 'Little Elm' | 'Prosper'
}

const recentReviews: Review[] = [
  {
    id: 1,
    platform: 'Google',
    rating: 5,
    text: 'Best coffee in town! The baristas are so friendly and the atmosphere is perfect for working.',
    author: 'Sarah M.',
    date: '2 days ago',
    location: 'Little Elm',
  },
  {
    id: 2,
    platform: 'Yelp',
    rating: 5,
    text: 'Love this place! Their signature latte is amazing. Will definitely be coming back.',
    author: 'Mike R.',
    date: '3 days ago',
    location: 'Prosper',
  },
  {
    id: 3,
    platform: 'Google',
    rating: 4,
    text: 'Great coffee and pastries. Gets busy on weekends but worth the wait.',
    author: 'Jennifer K.',
    date: '5 days ago',
    location: 'Little Elm',
  },
]

const reviewStats = {
  averageRating: 4.8,
  totalReviews: 342,
  thisMonth: 28,
  responseRate: 94,
}

export function CustomerPulse() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const platformColors = {
    Google: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    Yelp: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    Facebook: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
      <div className="boundaries-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Customer Pulse</h3>
          <MessageSquare className="h-5 w-5 text-white opacity-80" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Rating Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviewStats.averageRating}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <p>{reviewStats.totalReviews} reviews</p>
              <p className="text-green-600">+{reviewStats.thisMonth} this month</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">{reviewStats.responseRate}%</span>
            </div>
            <p className="text-xs text-gray-500">response rate</p>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Recent Reviews</p>
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${platformColors[review.platform]}`}>
                    {review.platform}
                  </span>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>— {review.author}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{review.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
