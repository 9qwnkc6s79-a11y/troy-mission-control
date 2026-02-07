'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Upload, CheckCircle, AlertCircle, Coffee } from 'lucide-react';

interface UploadResult {
  success: boolean;
  message: string;
  summary?: {
    days: number;
    total_revenue: number;
    total_transactions: number;
    date_range: { start: string; end: string };
  };
}

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<'Little Elm' | 'Prosper'>('Little Elm');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('location', selectedLocation);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    setIsUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Sales Data</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import Toast POS CSV exports to correlate with ad performance
        </p>
      </div>

      {/* Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-700" />
            How to Export from Toast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">1.</span>
              Log in to Toast at <strong>pos.toasttab.com</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">2.</span>
              Navigate to <strong>Reports → Sales Summary</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">3.</span>
              Set your date range and select the location
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">4.</span>
              Click <strong>Export → CSV</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-amber-700">5.</span>
              Upload the CSV file below
            </li>
          </ol>
          <p className="mt-3 text-xs text-gray-400">
            Supported columns: Date, Net Sales/Revenue, Order Count, Hour, Item Name, Quantity
          </p>
        </CardContent>
      </Card>

      {/* Location Selector */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Select Location</p>
          <div className="flex gap-3">
            {(['Little Elm', 'Prosper'] as const).map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  selectedLocation === location
                    ? 'border-amber-600 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                📍 {location}, TX
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {isUploading ? (
              <div>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700 mx-auto" />
                <p className="mt-4 text-gray-600">Processing CSV...</p>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="mt-3 text-gray-700 font-medium">
                  Drop your Toast CSV here or click to browse
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Uploading for: <strong>{selectedLocation}</strong>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
                {result.summary && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Days</p>
                      <p className="font-bold text-gray-900">{result.summary.days}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-bold text-gray-900">{formatCurrency(result.summary.total_revenue)}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Transactions</p>
                      <p className="font-bold text-gray-900">{formatNumber(result.summary.total_transactions)}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Date Range</p>
                      <p className="font-bold text-gray-900 text-xs">
                        {result.summary.date_range.start} → {result.summary.date_range.end}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
