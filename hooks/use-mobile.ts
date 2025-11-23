import * as React from "react"

const DEFAULT_BREAKPOINT = 768

export function useIsMobile(breakpoint: number = DEFAULT_BREAKPOINT) {
  const getValue = React.useCallback(() => {
    if (typeof window === "undefined") {
      return undefined
    }
    return window.innerWidth < breakpoint
  }, [breakpoint])

  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    getValue
  )

  React.useEffect(() => {
    const query = `(max-width: ${breakpoint - 1}px)`
    const mql = window.matchMedia(query)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(getValue())
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint, getValue])

  return !!isMobile
}
