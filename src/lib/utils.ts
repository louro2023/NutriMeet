import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const WHATSAPP_INITIAL_MESSAGE =
  "Olá, vim da plataforma NutriMeet e gostaria de mais informações sobre o atendimento."

export function buildWhatsappLink(phone: string) {
  const whatsapp = String(phone || "").replace(/\D/g, "")
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(WHATSAPP_INITIAL_MESSAGE)}`
}
