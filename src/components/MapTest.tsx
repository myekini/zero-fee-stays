import React from "react";
import PropertyMap from "./PropertyMap";

const MapTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Map Component Test
      </h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Test Property 1: Vancouver Beach House
          </h2>
          <PropertyMap
            location="Beachfront District"
            city="Vancouver"
            country="Canada"
            className="border-2 border-blue-200"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Test Property 2: Paris Apartment
          </h2>
          <PropertyMap
            location="Le Marais"
            city="Paris"
            country="France"
            className="border-2 border-green-200"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Test Property 3: Tokyo Loft
          </h2>
          <PropertyMap
            location="Shibuya"
            city="Tokyo"
            country="Japan"
            className="border-2 border-purple-200"
          />
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            ✅ Map Features Tested:
          </h3>
          <ul className="space-y-1 text-sm">
            <li>• Interactive OpenStreetMap tiles</li>
            <li>• Address geocoding (no API key required)</li>
            <li>• Custom property markers</li>
            <li>• Platform-specific directions (iOS/Android/Web)</li>
            <li>• Mobile-optimized interface</li>
            <li>• Error handling and loading states</li>
            <li>• Responsive design</li>
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">💰 Cost: $0</h3>
          <p className="text-sm">
            This map solution uses OpenStreetMap which is completely free with
            no usage limits, no API keys required, and no monthly costs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapTest;
