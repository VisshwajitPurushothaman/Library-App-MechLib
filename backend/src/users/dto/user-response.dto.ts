import { Expose } from 'class-transformer';

/**
 * Defines the strict contract for User data returned to the client.
 * ONLY fields marked with @Expose() will be sent when using excludeExtraneousValues: true.
 */
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  name: string;

  @Expose()
  roll_number: string;

  @Expose()
  department: string;
}
