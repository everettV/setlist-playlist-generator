import React, { useState, useEffect } from 'react';
import AffiliateService from '../services/AffiliateService';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<{
    totalClicks: number;
    clicksByPlatform: Record<string, number>;
    clicksBySource: Record<string, number>;
    recentClicks: any[];
  } | null>(null);

  const affiliateService = AffiliateService.getInstance();

  useEffect(() => {
    const data = affiliateService.getConversionAnalytics();
    setAnalytics(data);
  }, [affiliateService]);

  const handleClearData = () => {
    affiliateService.clearTrackingData();
    setAnalytics({
      totalClicks: 0,
      clicksByPlatform: {},
      clicksBySource: {},
      recentClicks: []
    });
  };

  if (!analytics) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
  }

  const estimatedRevenue = analytics.totalClicks * 15; // $15 average commission per click

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">💰 Affiliate Performance</h3>
        <button
          onClick={handleClearData}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics.totalClicks}</div>
          <div className="text-sm text-green-700">Ticket Clicks</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">${estimatedRevenue}</div>
          <div className="text-sm text-blue-700">Est. Revenue</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.totalClicks > 0 ? (analytics.totalClicks / 30).toFixed(1) : '0'}
          </div>
          <div className="text-sm text-purple-700">Daily Avg</div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Clicks by Platform</h4>
          <div className="space-y-2">
            {Object.entries(analytics.clicksByPlatform).map(([platform, count]) => (
              <div key={platform} className="flex justify-between items-center">
                <span className="capitalize text-sm text-gray-600">{platform}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(analytics.clicksByPlatform).length === 0 && (
              <p className="text-sm text-gray-500 italic">No clicks yet</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Clicks by Source</h4>
          <div className="space-y-2">
            {Object.entries(analytics.clicksBySource).map(([source, count]) => (
              <div key={source} className="flex justify-between items-center">
                <span className="capitalize text-sm text-gray-600">
                  {source.replace('_', ' ')}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(analytics.clicksBySource).length === 0 && (
              <p className="text-sm text-gray-500 italic">No clicks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {analytics.recentClicks.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Recent Ticket Clicks</h4>
          <div className="max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {analytics.recentClicks.map((click, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="font-medium">{click.artistName}</div>
                  <div className="text-gray-600">
                    {click.venue} • {new Date(click.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500">
                    {click.platform} • {click.estimatedPrice || 'Unknown price'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Getting Started */}
      {analytics.totalClicks === 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">🎯 Start Earning Commissions</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Your ticket affiliate program is ready! Users can now buy tickets through your app.
          </p>
          <div className="text-xs text-yellow-600">
            <p>• Set up affiliate IDs in your .env file</p>
            <p>• Each ticket sale earns 3-8% commission</p>
            <p>• Track conversions in real-time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;