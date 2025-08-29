import { useState } from "react";
import { Heart, Star, MapPin, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  rating,
  reviewCount,
  guests,
  bedrooms,
  bathrooms,
  image,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(id);
  };

  const handleCardClick = () => {
    navigate(`/property/${id}`);
  };

  return (
    <Card
      className="property-card bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-slate-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🏠</div>
            <div className="text-sm font-medium">{title}</div>
          </div>
        </div>

        {/* Image Overlay */}
        <div className="image-overlay"></div>

        {/* Price Badge */}
        <div className="price-badge">${price}/night</div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg heart-animation hover:bg-white transition-all duration-300"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-terracotta-500 text-terracotta-500" : "text-warm-gray-600"}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold text-warm-gray-800">
            {rating}
          </span>
          <span className="text-xs text-warm-gray-600">({reviewCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
              {title}
            </h3>
            <div className="flex items-center space-x-1 text-slate-600">
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" strokeWidth={1.5} />
              <span>{guests} guests</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{bedrooms} bedrooms</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{bathrooms} bathrooms</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                ${price}
              </span>
              <span className="text-slate-600"> / night</span>
            </div>
            <div className="text-sm text-slate-600">
              <Calendar className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
              Available now
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;
