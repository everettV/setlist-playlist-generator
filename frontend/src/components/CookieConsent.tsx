import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface CookieConsentProps {
  onConsentChange?: (consent: ConsentPreferences) => void;
}

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  lastUpdated: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentPreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = Cookies.get('cookie-consent');
    if (!existingConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsedConsent = JSON.parse(existingConsent);
        setConsent(parsedConsent);
        if (onConsentChange) {
          onConsentChange(parsedConsent);
        }
      } catch (error) {
        // Invalid consent cookie, show banner again
        setShowBanner(true);
      }
    }
  }, [onConsentChange]);

  const saveConsent = (preferences: ConsentPreferences) => {
    const updatedConsent = {
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to cookie (expires in 1 year)
    Cookies.set('cookie-consent', JSON.stringify(updatedConsent), { 
      expires: 365,
      secure: true,
      sameSite: 'strict'
    });
    
    setConsent(updatedConsent);
    setShowBanner(false);
    setShowPreferences(false);
    
    if (onConsentChange) {
      onConsentChange(updatedConsent);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleAcceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      lastUpdated: new Date().toISOString()
    });
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  const updatePreference = (type: keyof ConsentPreferences, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!showBanner && !showPreferences) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 We use cookies to improve your experience
                </h3>
                <p className="text-sm text-gray-600 max-w-2xl">
                  We use cookies to analyze site usage, personalize content, and provide affiliate tracking for our ticket partnerships. 
                  This helps us keep Concert Recap free while supporting artists and venues.
                </p>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="text-sm text-teal-600 hover:text-teal-700 underline mt-2"
                >
                  Customize cookie preferences
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Essential Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Required for basic site functionality, security, and user authentication. Cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-teal-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Help us understand how you use Concert Recap to improve the user experience and identify issues.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => updatePreference('analytics', !consent.analytics)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        consent.analytics ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        consent.analytics ? 'right-1' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Enable affiliate tracking for ticket purchases and concert planning. 
                      This helps us earn commission to keep the service free while you support artists.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => updatePreference('marketing', !consent.marketing)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        consent.marketing ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        consent.marketing ? 'right-1' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Legal Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Your Privacy Rights</h4>
                <p className="text-xs text-gray-600">
                  You can change these preferences at any time. Marketing cookies enable our affiliate partnerships 
                  that help keep Concert Recap free. We never sell your personal data to third parties.
                </p>
                <div className="flex gap-4 mt-2 text-xs">
                  <a href="/privacy" className="text-teal-600 hover:text-teal-700 underline">
                    Privacy Policy
                  </a>
                  <a href="/cookies" className="text-teal-600 hover:text-teal-700 underline">
                    Cookie Policy
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => {
                    setConsent(prev => ({ ...prev, analytics: false, marketing: false }));
                    handleSavePreferences();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => {
                    setConsent(prev => ({ ...prev, analytics: true, marketing: true }));
                    handleSavePreferences();
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;