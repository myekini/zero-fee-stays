"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <div className="h-[1.15rem] w-8 bg-muted rounded-full animate-pulse" />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Clean Switch Toggle */}
      <div className="flex items-center space-x-2">
        <Sun
          className={`h-4 w-4 transition-colors ${!isDark ? "text-primary" : "text-muted-foreground"}`}
        />
        <Switch
          checked={isDark}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
        />
        <Moon
          className={`h-4 w-4 transition-colors ${isDark ? "text-primary" : "text-muted-foreground"}`}
        />
      </div>

      {/* System Theme Option */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">System theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Theme
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {theme === "light" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Monitor className="h-4 w-4" />
            <span>System</span>
            {theme === "system" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
