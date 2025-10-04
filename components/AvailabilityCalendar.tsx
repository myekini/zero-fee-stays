"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  format,
  addMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BlockedDate {
  date: string;
  reason?: string;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

import { DateRange } from "react-day-picker";

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (date: Date | undefined) => void;
  selectedDate?: Date;
  onRangeSelect?: (range: DateRange | undefined) => void;
  selectedRange?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showSelectedDateOnly?: boolean;
  disabledDates?: Date[];
}

export default function AvailabilityCalendar({
  propertyId,
  onDateSelect,
  selectedDate,
  onRangeSelect,
  selectedRange,
  minDate = new Date(),
  maxDate = addMonths(new Date(), 12),
  className,
  showSelectedDateOnly = false,
  disabledDates = [],
}: AvailabilityCalendarProps) {
  const { toast } = useToast();
  const [month, setMonth] = useState<Date>(selectedRange?.from || selectedDate || new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      fetchAvailability();
    }
  }, [propertyId, month]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(month).toISOString().split("T")[0];
      const endDate = endOfMonth(month).toISOString().split("T")[0];

      const response = await fetch(
        `/api/calendar?property_id=${propertyId}&start_date=${startDate}&end_date=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data.blockedDates || []);
        setBookings(data.bookings || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch availability");
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load availability calendar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDateBlocked = (date: Date) => {
    // Check if date is in blocked dates
    const isBlocked = blockedDates.some((blockedDate) =>
      isSameDay(new Date(blockedDate.date), date)
    );

    if (isBlocked) return true;

    // Check if date is in any confirmed booking
    return bookings.some((booking) => {
      if (booking.status !== "confirmed" && booking.status !== "pending")
        return false;

      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);

      return isWithinInterval(date, { start: checkInDate, end: checkOutDate });
    });
  };

  const isDateDisabled = (date: Date) => {
    // Check if date is before minDate or after maxDate
    if (isBefore(date, minDate) || isAfter(date, maxDate)) return true;

    // Check if date is in disabledDates
    if (disabledDates.some((disabledDate) => isSameDay(disabledDate, date)))
      return true;

    // Check if date is blocked
    return isDateBlocked(date);
  };

  const getDayClass = (date: Date) => {
    if (isDateBlocked(date)) {
      return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    }
    return "";
  };

  const getBookingInfo = (date: Date) => {
    const booking = bookings.find((booking) => {
      if (booking.status !== "confirmed" && booking.status !== "pending")
        return false;

      const checkInDate = new Date(booking.check_in_date);
      const checkOutDate = new Date(booking.check_out_date);

      return isWithinInterval(date, { start: checkInDate, end: checkOutDate });
    });

    return booking;
  };

  const getBookingStatusIcon = (date: Date) => {
    const booking = getBookingInfo(date);
    if (!booking) return null;

    switch (booking.status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3 text-primary" />;
      case "pending":
        return <Clock className="w-3 h-3 text-accentCustom-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Availability Calendar</h3>
        </div>

        {!showSelectedDateOnly && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMonth(new Date())}
              disabled={isSameMonth(month, new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAvailability()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {onRangeSelect ? (
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={onRangeSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={isDateDisabled}
          modifiers={{ booked: (date) => isDateBlocked(date) }}
          modifiersClassNames={{
            booked:
              "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
          }}
          className="rounded-md border shadow p-3"
          components={{
            Day: ({ date, displayMonth, ...props }) => {
              const bookingIcon = getBookingStatusIcon(date);
              return (
                <button
                  {...props}
                  className={cn(
                    "select-none",
                    getDayClass(date),
                    "relative flex flex-col items-center justify-center h-8 w-8"
                  )}
                >
                  <span className="text-xs">{format(date, "d")}</span>
                  {bookingIcon && (
                    <div className="absolute -top-1 -right-1">{bookingIcon}</div>
                  )}
                </button>
              );
            },
          }}
        />
      ) : (
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={isDateDisabled}
          modifiers={{ booked: (date) => isDateBlocked(date) }}
          modifiersClassNames={{
            booked:
              "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
          }}
          className="rounded-md border shadow p-3"
          components={{
            Day: ({ date, displayMonth, ...props }) => {
              const bookingIcon = getBookingStatusIcon(date);
              return (
                <button
                  {...props}
                  className={cn(
                    "select-none",
                    getDayClass(date),
                    selectedDate &&
                      isSameDay(date, selectedDate) &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    "relative flex flex-col items-center justify-center h-8 w-8"
                  )}
                >
                  <span className="text-xs">{format(date, "d")}</span>
                  {bookingIcon && (
                    <div className="absolute -top-1 -right-1">{bookingIcon}</div>
                  )}
                </button>
              );
            },
          }}
        />
      )}

      {!showSelectedDateOnly && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-4 text-sm text-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive/10 border border-destructive/20"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-background border border-border"></div>
              <span>Available</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>Confirmed Booking</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-accentCustom-400" />
              <span>Pending Booking</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
