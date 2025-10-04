import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-12 px-4 py-3 border border-neutral-200 rounded-xl bg-white hover:bg-white focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all duration-200",
            !date && "text-neutral-400",
            className
          )}
          disabled={disabled}
        >
          {date ? (
            <span className="text-neutral-900">{format(date, "MMM dd")}</span>
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border border-neutral-200 rounded-xl shadow-premium z-[99999]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className="bg-transparent"
        />
      </PopoverContent>
    </Popover>
  );
}
