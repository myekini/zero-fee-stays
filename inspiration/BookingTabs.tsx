import { Plane, Hotel, Car } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const BookingTabs = () => {
  const [activeTab, setActiveTab] = useState("flight");

  const tabs = [
    { id: "flight", label: "Flight", icon: Plane },
    { id: "hotel", label: "Hotel", icon: Hotel },
    { id: "car", label: "Rent a Car", icon: Car },
  ];

  return (
    <div className="flex gap-0">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isFirst = index === 0;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-8 py-4 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-card text-card-foreground"
                : "bg-primary/80 text-primary-foreground hover:bg-primary/90",
              isFirst && "rounded-tl-lg"
            )}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default BookingTabs;
