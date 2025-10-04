import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  items: { value: string; label: string }[];
}

const SelectFilter: React.FC<SelectFilterProps> = ({ value, onValueChange, placeholder, items }) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectFilter;
