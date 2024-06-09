import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform, Expose } from 'class-transformer';
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

export enum WalletNetworkType {
  ICP = 'ICP',
  STELLAR = 'STELLAR',
}

export class CreateBlockchainWalletDTO {
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
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'app name',
    example: 'my app',
  })
  name: string;

  @IsNotEmpty()
  @IsEnum(WalletNetworkType)
  @ApiProperty({
    description: 'type of network',
    example: WalletNetworkType.ICP,
  })
  walletNetwork: WalletNetworkType;
}

export class EditBlockchainWalletDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'wallet id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'wallet name',
    example: 'my app',
  })
  name: string;
}

export class GetBlockchainWalletDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'wallet id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsOptional()
  @IsString()
  @Expose()
  @Transform(({ value }) => {
    const defaultRPC = process.env.SOROBAN_RPC_MAINNET;
    return value ? value : defaultRPC;
  })
  @ApiProperty({
    description:
      'soroban rpc - mainnet or testnet? se nao passar nada considera a mainnet',
    example: 'https://horizon.stellar.org',
    default: 'https://horizon.stellar.org',
  })
  sorobanRPC: string;
}

export class DeployICPWalletDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'blockchain wallet id',
    example: '123213-213123-213123-213123',
  })
  blockchainWalletId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'app name',
    example: 'my app',
  })
  name: string;
}

export class EditICPWalletDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'wallet ICP id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'app name',
    example: 'my app',
  })
  name: string;
}

export class FundICPWalletDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'wallet ICP id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsNumberString()
  @ApiProperty({
    description: 'amouint in icp to transform in cycle',
    example: '0.08',
  })
  amount: string;
}

export class TransferICPDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'blockchain wallet id - the from address',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'Address to transfer',
    example: 'a726a33500ed166c6447462afde7180d7141f22ff4d032937e87c62cfd58a914',
  })
  addressTo: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsNumberString()
  @ApiProperty({
    description: 'amouint in icp to transfer',
    example: '0.08',
  })
  amount: string;
}
