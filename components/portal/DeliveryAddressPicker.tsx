'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, Navigation, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface DeliveryAddressPickerProps {
  onAddressSelect: (address: string, location?: Location) => void;
  initialAddress?: string;
}

export function DeliveryAddressPicker({
  onAddressSelect,
  initialAddress = '',
}: DeliveryAddressPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // Mock address suggestions
  const mockSuggestions = [
    '123 Main Street, Downtown',
    '456 Oak Avenue, Midtown',
    '789 Elm Street, Suburbs',
    '321 Park Lane, Riverside',
    '654 Hill Drive, Hillside',
  ];

  const handleAddressChange = (value: string) => {
    setAddress(value);

    // Show suggestions
    if (value.length > 2) {
      const filtered = mockSuggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.length > 0 ? filtered : mockSuggestions.slice(0, 3));
      setShowMap(true);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setAddress(suggestion);
    setSuggestions([]);
    
    // Calculate mock estimated time (15-35 minutes)
    const time = Math.floor(Math.random() * 20) + 15;
    setEstimatedTime(time);

    onAddressSelect(suggestion, {
      lat: 40.7128 + Math.random() * 0.1,
      lng: -74.006 + Math.random() * 0.1,
      address: suggestion,
    });
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    const mockAddress = '789 Elm Street, Suburbs';
    setAddress(mockAddress);
    setShowMap(true);
    
    const time = Math.floor(Math.random() * 20) + 15;
    setEstimatedTime(time);

    onAddressSelect(mockAddress, {
      lat: 40.7128,
      lng: -74.006,
      address: mockAddress,
    });

    toast.success('Current location detected');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Address Input */}
      <div className="space-y-2">
        <Label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
          Delivery Address
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <Input
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter your delivery address"
            className="h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-primary focus:ring-0 font-medium"
          />
          
          {address && (
            <button
              type="button"
              onClick={() => {
                setAddress('');
                setSuggestions([]);
                setEstimatedTime(null);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50"
          >
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b last:border-b-0 dark:border-gray-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {suggestion}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated: 20-30 mins away
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUseCurrentLocation}
        className="w-full h-12 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary hover:bg-primary/5 transition-colors"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Use Current Location
      </Button>

      {/* Map Preview */}
      {showMap && address && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <Card className="p-0 overflow-hidden border-2 border-gray-100 dark:border-gray-800">
            {/* Mock Map */}
            <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              {/* Map Grid */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6B7280" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapGrid)" />
                </svg>
              </div>

              {/* Delivery Location Marker */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-2xl shadow-lg flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ETA Info */}
              {estimatedTime && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-xl rounded-[16px] border border-white/30 dark:border-gray-800 shadow-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        Est. Delivery Time
                      </p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {estimatedTime} minutes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Address Info Card */}
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-[24px] p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                  Delivery will be to this address
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {address}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Text */}
      {!address && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Enter your delivery address or use your current location. We'll show you the estimated delivery time.
        </p>
      )}
    </div>
  );
}
