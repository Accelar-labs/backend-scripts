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
} from 'class-validator';
import { IsNotBlank } from 'src/utils/custom-validators';

export enum NetworkType {
  ICP = 'ICP',
}

export enum CanisterTemplateType {
  HELLO_WORLD = 'HELLO_WORLD',
  VECTOR_DATABASE = 'VECTOR_DATABASE',
}

export enum SorobanNetworkType {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export class CreateBlockchainAppDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'workspace id',
    example: '123213-213123-213123-213123',
  })
  workspaceId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'app name',
    example: 'my app',
  })
  name: string;

  @IsNotEmpty()
  @IsEnum(NetworkType)
  @ApiProperty({
    description: 'type of network',
    example: NetworkType.ICP,
  })
  network: NetworkType;
}

export class EditBlockchainAppDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'app id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'app name',
    example: 'my app',
  })
  name: string;
}

export class EditCanisterDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'canister id',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    maxLength: 50,
    description: 'canister name',
    example: 'my app',
  })
  name: string;
}

export class GetBlockchainAppDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'id',
    example: '123213-213123-213123-213123',
  })
  id: string;
}

export class DeployCanisterDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'app id that you want to deploy this canister',
    example: '123213-213123-213123-213123',
  })
  id: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    description: 'The canister name',
    example: 'My new canister',
  })
  name: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'the ICP wallet that you want to use to deploy this canister',
    example: '123213-213123-213123-213123',
  })
  icpWalletId: string;

  @IsNotEmpty()
  @IsEnum(CanisterTemplateType)
  @ApiProperty({
    description: 'The canister template that you want to deploy',
    example: CanisterTemplateType.HELLO_WORLD,
  })
  canisterTemplate: CanisterTemplateType;
}

export class CompileSorobanContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'the wallet that you want to use to deploy this contract',
    example: '123213-213123-213123-213123',
  })
  walletId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The contract Id',
    example: '123213-213123-213123-213123',
  })
  contractId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The contract code',
    example:
      '#![no_std]use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};#[contract]pub struct HelloContract;#[contractimpl]impl HelloContract {    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {        vec![&env, symbol_short!("Hello"), to]    }}mod test;',
  })
  code: string;
}

export class DeploySorobanContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'the wallet that you want to use to deploy this contract',
    example: '123213-213123-213123-213123',
  })
  walletId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The contract Id',
    example: '123213-213123-213123-213123',
  })
  contractId: string;

  @IsNotEmpty()
  @IsEnum(SorobanNetworkType)
  @ApiProperty({
    description: 'The network',
    example: SorobanNetworkType.TESTNET,
  })
  environment: SorobanNetworkType;
}

export class SorobanContractFunctionParamDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The function param name you are referring to',
    example: 'to',
  })
  paramName: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The function param value',
    example: 'Bruno',
  })
  value: any;
}

export class CallSorobanContractDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'the wallet that you want to use to call this contract',
    example: '123213-213123-213123-213123',
  })
  walletId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The contract address',
    example: '0xadde12qwdwdaa3424ad8a901',
  })
  contractAddress: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The contract function name you want to call',
    example: 'hello',
  })
  functionName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SorobanContractFunctionParamDTO)
  @ApiProperty({
    description: 'The function params',
    type: [SorobanContractFunctionParamDTO],
  })
  functionParams: SorobanContractFunctionParamDTO[];

  @IsNotEmpty()
  @IsEnum(SorobanNetworkType)
  @ApiProperty({
    description: 'The network',
    example: SorobanNetworkType.TESTNET,
  })
  environment: SorobanNetworkType;
}

export class CallCanisterDTO {
  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'canister Id on ICP',
    example: '123213-213123-213123-213123',
  })
  canisterId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'the ICP wallet id that you want to use to call this canister',
    example: '123213-213123-213123-213123',
  })
  icpWalletId: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: 'The method name that will be called',
    example: 'greet',
  })
  methodName: string;

  @IsNotEmpty()
  @IsNotBlank()
  @IsString()
  @ApiProperty({
    description: `arguments shoudl be something like: if the function accept a text and a number: "('bruno', 21)"`,
    example: `"('bruno', 21)"`,
  })
  callArguments: string;
}
