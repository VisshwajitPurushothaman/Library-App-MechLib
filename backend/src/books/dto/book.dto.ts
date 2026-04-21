import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @Matches(/^[A-Z]{2,4}[0-9]{2,6}$/, { message: 'Book code must match format like ME101, CS2001' })
  code: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  author: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  total_copies: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string = '';

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cover color must be a valid hex color like #0F172A' })
  cover_color?: string = '#0F172A';
}

export class UpdateBookDto {
  @IsOptional()
  @Matches(/^[A-Z]{2,4}[0-9]{2,6}$/)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  total_copies?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  cover_color?: string;
}

export class SearchBooksQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
