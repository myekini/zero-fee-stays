import React, { useState, useEffect } from 'react';
import { addDays, addMonths, eachDayOfInterval, format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isAfter, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps {
  propertyId?: string;
  selectedRange: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  onRangeSelect: (range: { checkIn: Date | null; checkOut: Date | null }) => void;
  bookedDates?: Date[];
  blockedDates?: Date[];
  minStay?: number;
  className?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  propertyId,
  selectedRange,
  onRangeSelect,
  bookedDates = [],
  blockedDates = [],
  minStay = 1,
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate => isSameDay(date, blockedDate));
  };

  const isDateUnavailable = (date: Date) => {
    return isDateBooked(date) || isDateBlocked(date) || isBefore(date, new Date());
  };

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange.checkIn || !selectedRange.checkOut) return false;
    return (
      (isSameDay(date, selectedRange.checkIn) || isAfter(date, selectedRange.checkIn)) &&
      (isSameDay(date, selectedRange.checkOut) || isBefore(date, selectedRange.checkOut))
    );
  };

  const isValidCheckOutDate = (checkInDate: Date, checkOutDate: Date) => {
    if (!isAfter(checkOutDate, checkInDate)) return false;
    
    // Check minimum stay requirement
    const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < minStay) return false;
    
    // Check if any dates in between are unavailable
    const datesInBetween = eachDayOfInterval({ start: addDays(checkInDate, 1), end: checkOutDate });
    return !datesInBetween.some(date => isDateUnavailable(date));
  };

  const handleDateClick = (date: Date) => {
    if (isDateUnavailable(date)) return;

    if (!selectedRange.checkIn || selectingCheckOut) {
      // Selecting check-in date or already have check-in and selecting check-out
      if (!selectedRange.checkIn) {
        onRangeSelect({ checkIn: date, checkOut: null });
        setSelectingCheckOut(true);
      } else {
        // Selecting check-out date
        if (isValidCheckOutDate(selectedRange.checkIn, date)) {
          onRangeSelect({ checkIn: selectedRange.checkIn, checkOut: date });
          setSelectingCheckOut(false);
        } else {
          // Invalid check-out, start over with this date as check-in
          onRangeSelect({ checkIn: date, checkOut: null });
          setSelectingCheckOut(true);
        }
      }
    } else {
      // Have check-in, clicking another date
      if (isBefore(date, selectedRange.checkIn)) {
        // Clicked date is before check-in, make it the new check-in
        onRangeSelect({ checkIn: date, checkOut: null });
        setSelectingCheckOut(true);
      } else if (isValidCheckOutDate(selectedRange.checkIn, date)) {
        // Valid check-out date
        onRangeSelect({ checkIn: selectedRange.checkIn, checkOut: date });
        setSelectingCheckOut(false);
      } else {
        // Invalid check-out, start over
        onRangeSelect({ checkIn: date, checkOut: null });
        setSelectingCheckOut(true);
      }
    }
  };

  const getDateStatus = (date: Date) => {
    if (isDateUnavailable(date)) {
      return isDateBooked(date) ? 'booked' : 'blocked';
    }
    if (selectedRange.checkIn && isSameDay(date, selectedRange.checkIn)) {
      return 'check-in';
    }
    if (selectedRange.checkOut && isSameDay(date, selectedRange.checkOut)) {
      return 'check-out';
    }
    if (isDateInSelectedRange(date)) {
      return 'in-range';
    }
    return 'available';
  };

  const renderCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="select-none">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(monthDate, -1))}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(monthDate, 1))}
              className="p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const status = getDateStatus(day);
            const isCurrentMonth = isSameMonth(day, monthDate);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth || isDateUnavailable(day)}
                className={cn(
                  'w-10 h-10 text-sm rounded-lg transition-all duration-200 relative',
                  'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  {
                    // Base styles
                    'text-slate-900': isCurrentMonth,
                    'text-slate-300': !isCurrentMonth,
                    
                    // Available dates
                    'bg-white hover:bg-blue-50': status === 'available' && isCurrentMonth,
                    
                    // Selected dates
                    'bg-blue-600 text-white hover:bg-blue-700': status === 'check-in' || status === 'check-out',
                    'bg-blue-100 text-blue-700': status === 'in-range',
                    
                    // Unavailable dates
                    'bg-slate-100 text-slate-400 cursor-not-allowed': status === 'booked',
                    'bg-red-100 text-red-400 cursor-not-allowed': status === 'blocked',
                    
                    // Disabled
                    'opacity-50 cursor-not-allowed': !isCurrentMonth
                  }
                )}
              >
                {format(day, 'd')}
                
                {/* Small indicator dots */}
                {status === 'check-in' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
                {status === 'check-out' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-white', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Month */}
        {renderCalendar(currentMonth)}
        
        {/* Next Month */}
        <div className="hidden lg:block">
          {renderCalendar(addMonths(currentMonth, 1))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-slate-200 rounded" />
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <span className="text-slate-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded" />
            <span className="text-slate-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded" />
            <span className="text-slate-600">Blocked</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      {selectedRange.checkIn && !selectedRange.checkOut && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Select your check-out date (minimum {minStay} night{minStay > 1 ? 's' : ''})
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;