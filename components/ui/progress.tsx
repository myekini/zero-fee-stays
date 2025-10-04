"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current: boolean;
}

interface BookingProgressProps {
  steps: ProgressStep[];
  className?: string;
}

export function BookingProgress({ steps, className }: BookingProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  step.completed
                    ? "border-green-500 bg-green-500 text-white"
                    : step.current
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                )}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    step.completed || step.current
                      ? "text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-16 transition-colors",
                  steps[index + 1]?.completed || steps[index + 1]?.current
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showPercentage = false,
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
