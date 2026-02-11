'use client'

import { Instagram, Facebook, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react'
import { mockData } from '@/data/mockData'

export function MarketingHighlights() {
  const { marketingData } = mockData

  const socialStats = [
    {
      platform: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      followers: marketingData.socialMedia.instagram.followers,
      engagement: marketingData.socialMedia.instagram.engagement,
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      followers: marketingData.socialMedia.facebook.followers,
      engagement: marketingData.socialMedia.facebook.engagement,
    },
  ]

  const totalFollowers =
    marketingData.socialMedia.instagram.followers +
    marketingData.socialMedia.facebook.followers +
    marketingData.socialMedia.tiktok.followers

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
      <div className="boundaries-gradient px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Marketing Highlights</h3>
          <TrendingUp className="h-5 w-5 text-white opacity-80" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Total Reach */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-boundaries-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-boundaries-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Followers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalFollowers.toLocaleString()}
              </p>
            </div>
          </div>
          <span className="text-sm text-green-600 font-medium">+8.2%</span>
        </div>

        {/* Social Platforms */}
        <div className="space-y-3">
          {socialStats.map((social) => (
            <div key={social.platform} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${social.bgColor}`}>
                  <social.icon className={`h-4 w-4 ${social.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {social.platform}
                  </p>
                  <p className="text-xs text-gray-500">
                    {social.followers.toLocaleString()} followers
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <Heart className="h-3 w-3" />
                  <span className="text-sm font-medium">{social.engagement}%</span>
                </div>
                <p className="text-xs text-gray-500">engagement</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Campaigns */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Active Campaigns</p>
          <div className="space-y-2">
            {marketingData.campaigns.slice(0, 2).map((campaign) => (
              <div key={campaign.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    campaign.status === 'active' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300">{campaign.name}</span>
                </div>
                <span className="text-gray-500">{campaign.conversions} conversions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
