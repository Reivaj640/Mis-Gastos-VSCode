import * as React from "react"

const MOBILE_BREAKPOINT = 768

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  // Suscripción al sistema externo (matchMedia) sin setState dentro de un
  // efecto: patrón canónico de React (pendiente #10).
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
