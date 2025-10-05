"use client";

import React from 'react';
import { 
  Wifi, 
  Car, 
  Coffee, 
  Waves, 
  Users, 
  Bed,
  Bath,
  AirVent,
  Tv,
  Snowflake,
  Utensils,
  Wind,
  Shield,
  Dumbbell,
  Baby,
  Dog,
  Cigarette,
  Volume2,
  Home,
  MapPin
} from 'lucide-react';

// Elegant amenity icon mapping inspired by Monte Real Estate
const amenityIconMap: { [key: string]: React.ComponentType<any> } = {
  // Basic Amenities
  'wifi': Wifi,
  'internet': Wifi,
  'parking': Car,
  'garage': Car,
  'kitchen': Coffee,
  'kitchenette': Coffee,
  'pool': Waves,
  'swimming_pool': Waves,
  'gym': Dumbbell,
  'fitness': Dumbbell,
  
  // Room Features
  'air_conditioning': AirVent,
  'ac': AirVent,
  'heating': Wind,
  'tv': Tv,
  'television': Tv,
  'refrigerator': Snowflake,
  'fridge': Snowflake,
  'microwave': Utensils,
  'dishwasher': Utensils,
  
  // Policies & Rules
  'pets_allowed': Dog,
  'pet_friendly': Dog,
  'no_smoking': Cigarette,
  'smoking_allowed': Cigarette,
  'family_friendly': Baby,
  'children_welcome': Baby,
  'quiet_hours': Volume2,
  
  // Security & Safety
  'security': Shield,
  'safe': Shield,
  'secured_building': Shield,
  
  // Location Features
  'balcony': MapPin,
  'terrace': MapPin,
  'garden': MapPin,
  'sea_view': Waves,
  'ocean_view': Waves,
  'city_view': Home,
};

interface PremiumAmenityDisplayProps {
  amenities: string[];
  maxDisplay?: number;
  showLabels?: boolean;
  variant?: 'dots' | 'icons' | 'minimal';
  className?: string;
}

export const PremiumAmenityDisplay: React.FC<PremiumAmenityDisplayProps> = ({
  amenities,
  maxDisplay = 6,
  showLabels = true,
  variant = 'dots',
  className = ''
}) => {
  const displayAmenities = amenities.slice(0, maxDisplay);
  const remainingCount = Math.max(0, amenities.length - maxDisplay);

  const formatAmenityName = (amenity: string) => {
    return amenity
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Monte-inspired dots variant (minimalist)
  if (variant === 'dots') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showLabels && (
          <div className="uppercase text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            AMENITIES
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {displayAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize line-clamp-1">
                {formatAmenityName(amenity)}
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                +{remainingCount} more
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Monte-inspired minimal variant with colored dots
  if (variant === 'minimal') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showLabels && (
          <div className="uppercase text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            FEATURES
          </div>
        )}
        <div className="grid grid-cols-1 gap-3">
          {displayAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                index === 0 ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {formatAmenityName(amenity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Icon variant with elegant icons
  if (variant === 'icons') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showLabels && (
          <div className="uppercase text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            AMENITIES
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayAmenities.map((amenity, index) => {
            const IconComponent = amenityIconMap[amenity.toLowerCase()] || Shield;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                  <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {formatAmenityName(amenity)}
                </span>
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">+{remainingCount}</span>
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                More amenities
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PremiumAmenityDisplay;