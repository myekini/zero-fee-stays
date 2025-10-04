// Property Types and Amenities Management
export const PROPERTY_TYPES = [
  {
    id: "apartment",
    label: "Apartment",
    icon: "🏢",
    description: "Modern apartment units",
  },
  {
    id: "house",
    label: "House",
    icon: "🏠",
    description: "Single-family homes",
  },
  { id: "condo", label: "Condo", icon: "🏘️", description: "Condominium units" },
  { id: "villa", label: "Villa", icon: "🏡", description: "Luxury villas" },
  {
    id: "townhouse",
    label: "Townhouse",
    icon: "🏘️",
    description: "Multi-level townhouses",
  },
  {
    id: "studio",
    label: "Studio",
    icon: "🏠",
    description: "Open-plan studios",
  },
  {
    id: "loft",
    label: "Loft",
    icon: "🏭",
    description: "Converted loft spaces",
  },
  {
    id: "penthouse",
    label: "Penthouse",
    icon: "🏢",
    description: "Top-floor luxury units",
  },
  {
    id: "cabin",
    label: "Cabin",
    icon: "🏕️",
    description: "Rustic cabin rentals",
  },
  {
    id: "beachhouse",
    label: "Beach House",
    icon: "🏖️",
    description: "Oceanfront properties",
  },
] as const;

export const AMENITY_CATEGORIES = {
  essentials: {
    label: "Essentials",
    icon: "🔑",
    amenities: [
      { id: "wifi", label: "WiFi", icon: "📶", essential: true },
      { id: "kitchen", label: "Kitchen", icon: "🍳", essential: true },
      { id: "parking", label: "Parking", icon: "🅿️", essential: true },
      { id: "washer", label: "Washer", icon: "🧺", essential: true },
      { id: "dryer", label: "Dryer", icon: "🌪️", essential: true },
      { id: "heating", label: "Heating", icon: "🔥", essential: true },
      {
        id: "air_conditioning",
        label: "Air Conditioning",
        icon: "❄️",
        essential: true,
      },
    ],
  },
  features: {
    label: "Features",
    icon: "⭐",
    amenities: [
      { id: "pool", label: "Pool", icon: "🏊", essential: false },
      { id: "hot_tub", label: "Hot Tub", icon: "🛁", essential: false },
      { id: "gym", label: "Gym", icon: "💪", essential: false },
      { id: "balcony", label: "Balcony", icon: "🌅", essential: false },
      { id: "garden", label: "Garden", icon: "🌿", essential: false },
      { id: "fireplace", label: "Fireplace", icon: "🔥", essential: false },
      { id: "workspace", label: "Workspace", icon: "💻", essential: false },
    ],
  },
  safety: {
    label: "Safety",
    icon: "🛡️",
    amenities: [
      {
        id: "smoke_detector",
        label: "Smoke Detector",
        icon: "🚨",
        essential: true,
      },
      {
        id: "carbon_monoxide_detector",
        label: "Carbon Monoxide Detector",
        icon: "⚠️",
        essential: true,
      },
      {
        id: "first_aid_kit",
        label: "First Aid Kit",
        icon: "🏥",
        essential: false,
      },
      {
        id: "fire_extinguisher",
        label: "Fire Extinguisher",
        icon: "🧯",
        essential: false,
      },
      {
        id: "security_cameras",
        label: "Security Cameras",
        icon: "📹",
        essential: false,
      },
    ],
  },
  accessibility: {
    label: "Accessibility",
    icon: "♿",
    amenities: [
      {
        id: "wheelchair_accessible",
        label: "Wheelchair Accessible",
        icon: "♿",
        essential: false,
      },
      { id: "elevator", label: "Elevator", icon: "🛗", essential: false },
      {
        id: "ground_floor",
        label: "Ground Floor",
        icon: "🏠",
        essential: false,
      },
    ],
  },
} as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["id"];
export type AmenityId = string;

export interface PropertyTypeInfo {
  id: PropertyType;
  label: string;
  icon: string;
  description: string;
}

export interface AmenityInfo {
  id: AmenityId;
  label: string;
  icon: string;
  essential: boolean;
}

export interface AmenityCategory {
  label: string;
  icon: string;
  amenities: AmenityInfo[];
}

export const getPropertyTypeInfo = (
  type: string
): PropertyTypeInfo | undefined => {
  return PROPERTY_TYPES.find((t) => t.id === type);
};

export const getAllAmenities = (): AmenityInfo[] => {
  return Object.values(AMENITY_CATEGORIES).flatMap((category) => [
    ...category.amenities,
  ]);
};

export const getEssentialAmenities = (): AmenityInfo[] => {
  return getAllAmenities().filter((amenity) => amenity.essential);
};

export const getAmenityInfo = (amenityId: string): AmenityInfo | undefined => {
  return getAllAmenities().find((amenity) => amenity.id === amenityId);
};
