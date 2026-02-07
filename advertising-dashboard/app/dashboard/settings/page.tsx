'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, ExternalLink } from 'lucide-react';

const integrations = [
  {
    name: 'Meta Business API',
    description: 'Campaign performance, reach, spend, results',
    envVars: ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID', 'META_BUSINESS_ID'],
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis/',
    setupSteps: [
      'Create a Meta App at developers.facebook.com',
      'Add Marketing API product',
      'Generate a long-lived access token',
      'Set META_ACCESS_TOKEN in environment variables',
      'Set META_AD_ACCOUNT_ID=468165461888446',
      'Set META_BUSINESS_ID=1264820400638644',
    ],
  },
  {
    name: 'Google Ads API',
    description: 'Store visits, local campaigns, distance performance',
    envVars: [
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID',
      'GOOGLE_ADS_DEVELOPER_TOKEN',
    ],
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
    setupSteps: [
      'Apply for Google Ads API access at ads.google.com/home/tools/api-center/',
      'Create OAuth 2.0 credentials in Google Cloud Console',
      'Generate refresh token using OAuth flow',
      'Set all GOOGLE_ADS_* environment variables',
      'Note: Developer token requires approval from Google',
    ],
  },
  {
    name: 'Toast POS API',
    description: 'Sales data, transactions, product performance',
    envVars: ['TOAST_CLIENT_ID', 'TOAST_CLIENT_SECRET', 'TOAST_RESTAURANT_ID'],
    docsUrl: 'https://doc.toasttab.com/openapi/',
    setupSteps: [
      'Apply for Toast API access (requires Toast partner program)',
      'Alternative: Use CSV upload for Toast sales data',
      'Export from Toast: Reports → Sales Summary → Export CSV',
      'Upload CSV through the Upload Data page',
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings & Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure API integrations for live data
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{integration.name}</p>
                    <p className="text-xs text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <Badge variant="default">Not Configured</Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            💡 The dashboard uses realistic sample data until you configure live API credentials. 
            All features work the same way — just with your actual numbers.
          </p>
        </CardContent>
      </Card>

      {/* Setup Guides */}
      {integrations.map((integration) => (
        <Card key={integration.name} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{integration.name} Setup</CardTitle>
              <a
                href={integration.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {/* Environment Variables */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Required Environment Variables:</p>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {integration.envVars.map((envVar) => (
                  <div key={envVar} className="text-green-400">
                    {envVar}=your_value_here
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Steps */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Setup Steps:</p>
              <ol className="space-y-2">
                {integration.setupSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="font-bold text-amber-700 mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Vercel Deployment */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Vercel Deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">1.</span>
              <div>
                Push this project to a GitHub repository
                <div className="mt-1 bg-gray-900 rounded p-2 font-mono text-xs text-gray-300">
                  git init && git add . && git commit -m &quot;init&quot; && git push
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">2.</span>
              Go to <strong>vercel.com</strong> → Import Project → Select repo
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">3.</span>
              Add environment variables in Vercel project settings
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">4.</span>
              Deploy! Dashboard will use sample data until APIs are configured
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
