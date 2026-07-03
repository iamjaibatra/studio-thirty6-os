/**
 * Joins class names, filtering out falsy values.
 * Usage: cn("base", isActive && "active", error && "error")
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
