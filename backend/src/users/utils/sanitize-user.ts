import { User } from '../entities/user.entity';

/**
 * Explicitly maps a User entity to a safe, plain object.
 * This is the PRIMARY security control for the API response layer.
 */
export function sanitizeUser(user: User | null) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    roll_number: user.roll_number,
    department: user.department,
  };
}
