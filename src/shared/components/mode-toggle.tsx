import { useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/shared/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu"
import { useTheme } from "@/shared/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const themeLabels = { light: "Light", dark: "Dark", system: "System" } as const;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Select theme. Current: ${themeLabels[theme]}`}
          aria-expanded={open}
          aria-controls="theme-menu"
          title={`Theme: ${themeLabels[theme]}`}
          className="border-0 bg-transparent shadow-none hover:bg-transparent"
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Monitor className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent id="theme-menu" align="end" aria-label="theme menu">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          role="menuitemradio"
          aria-checked={theme === "light"}
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Light</span>
          {theme === "light" && <span aria-hidden="true">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          role="menuitemradio"
          aria-checked={theme === "dark"}
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Dark</span>
          {theme === "dark" && <span aria-hidden="true">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          role="menuitemradio"
          aria-checked={theme === "system"}
        >
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>System</span>
          {theme === "system" && <span aria-hidden="true">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
