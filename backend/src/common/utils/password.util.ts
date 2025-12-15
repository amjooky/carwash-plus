import * as crypto from 'crypto';

/**
 * Generate a cryptographically secure random password
 * @param length Password length (default: 12)
 * @returns Generated password meeting security requirements
 */
export function generateSecurePassword(length: number = 12): string {
  // Ensure minimum length
  if (length < 8) {
    length = 8;
  }

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password to avoid predictable pattern
  password = password
    .split('')
    .sort(() => crypto.randomInt(0, 2) - 0.5)
    .join('');
  
  return password;
}

/**
 * Generate username from email
 * @param email Email address
 * @returns Username (part before @)
 */
export function generateUsernameFromEmail(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}
