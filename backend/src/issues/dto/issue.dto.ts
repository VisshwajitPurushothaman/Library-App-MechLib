import { IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize, Matches, IsOptional } from 'class-validator';

export class IssueInDto {
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{3,15}$/i)
  roll_number: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  book_codes: string[];

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  issue_date: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  due_date: string;
}

export class ExtensionRequestDto {
  @IsNotEmpty()
  days: number;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class ExtensionDecisionDto {
  @IsNotEmpty()
  decision: 'approve' | 'decline';

  @IsOptional()
  @IsString()
  admin_note: string = '';
}
