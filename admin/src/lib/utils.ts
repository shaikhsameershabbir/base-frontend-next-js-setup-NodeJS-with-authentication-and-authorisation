import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getParentId = (role: string) => {
  if (role === 'admin') {
    return 'superadmin'
  } else if (role === 'distributor') {
    return 'admin'
  } else if (role === 'agent') {
    return 'distributor'
  } else if (role === 'player') {
    return 'agent'
  }

}