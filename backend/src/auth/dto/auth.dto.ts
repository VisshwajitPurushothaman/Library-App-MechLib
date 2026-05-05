import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';

export class RegisterIn {
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{3,15}$/i, { message: 'Roll number must be 3-15 alphanumeric characters' })
  roll_number: string;

  @IsNotEmpty()
  @Matches(/^[A-Za-z\s.\-']{2,100}$/, { message: 'Name must be 2-100 characters, letters/spaces/hyphens only' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user' = 'user';
}

export class LoginIn {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  password: string;

  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';
}

export class ChangePasswordIn {
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password: string;
}
