import { useState } from "react"
import { Moon, Sun, Cog } from "lucide-react"

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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="change theme"
          aria-expanded={open}
          aria-controls="theme-menu"
        >
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent id="theme-menu" align="end" aria-label="theme menu">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          aria-selected={theme === "light"}
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Light</span>
          {theme === "light" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          aria-selected={theme === "dark"}
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Dark</span>
          {theme === "dark" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          aria-selected={theme === "system"}
        >
          <Cog className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>System</span>
          {theme === "system" && <span className="sr-only">(current)</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}