import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  ValidateNested,
  isEmail,
  MaxLength,
  MinLength,
  IsInt,
  Max,
  IsArray,
  IsEnum,
  ArrayMaxSize,
  IsNumberString,
} from 'class-validator';
import { IsNotBlank } from 'src/utils/custom-validators';

export enum IDENetworkType {
  STELLAR = 'STELLAR',
}

export class CreateContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'workspace id',
    example: '123213-213123-213123-213123',
  })
  workspaceId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    maxLength: 100,
    description: 'my contract',
    example: 'my contract',
  })
  name: string;

  @IsString()
  @MaxLength(100000)
  @ApiProperty({
    maxLength: 100000,
    description: '// my contract',
    example: '// my contract',
  })
  code: string;

  @IsNotEmpty()
  @IsEnum(IDENetworkType)
  @ApiProperty({
    description: 'type of network',
    example: IDENetworkType.STELLAR,
  })
  network: IDENetworkType;
}

export class SaveContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'contract id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsString()
  @MaxLength(100000)
  @ApiProperty({
    maxLength: 100000,
    description: 'contract code',
    example: '// my contract',
  })
  code: string;
}

export class AskBotDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'contract id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    maxLength: 1000,
    description: 'Code question',
    example: 'How do I code a contract with a sum function?',
  })
  question: string;
}

export class RenameContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'contract id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    maxLength: 100,
    description: 'my contract',
    example: 'my contract',
  })
  name: string;
}
