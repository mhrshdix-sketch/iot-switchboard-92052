import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Get theme based on time (06:00-18:00 light, 18:01-05:59 dark)
const getTimeBasedTheme = (): "light" | "dark" => {
  const hour = new Date().getHours()
  // 06:00 to 18:00 is light, otherwise dark
  if (hour >= 6 && hour < 18) {
    return "light"
  }
  return "dark"
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      // Use time-based theme instead of system preference
      const timeTheme = getTimeBasedTheme()
      root.classList.add(timeTheme)
      
      // Check every minute to update theme if time changes
      const interval = setInterval(() => {
        const newTheme = getTimeBasedTheme()
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
      }, 60000) // Check every minute
      
      return () => clearInterval(interval)
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
