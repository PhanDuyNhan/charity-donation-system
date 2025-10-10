import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency VND
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

// Format short date
export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date))
}

// Calculate percentage
export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Get initials from name
export function getInitials(ho: string, ten: string): string {
  return `${ho.charAt(0)}${ten.charAt(0)}`.toUpperCase()
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Vietnam)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}
