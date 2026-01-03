export const APP_CONFIG = {
  NAME: 'Room Reservation System',
  VERSION: '1.0.0',
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  DEFAULT_PAGE_SIZE: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'MMM DD, YYYY HH:mm',
} as const;

export const ROOM_IMAGES = {
  DEFAULT: 'https://imgur.com/Zemqvh3.png',
  MAX_IMAGES_PER_ROOM: 5,
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;