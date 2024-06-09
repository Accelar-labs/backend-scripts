import {
  ConflictException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as pty from 'node-pty';
import Decimal from 'decimal.js';
Decimal.set({ precision: 60 });
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { readFile, readdir } from 'fs/promises';

import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../database/prisma.service';
import { Request, response } from 'express';
import axios from 'axios';

import { UtilsService } from '../utils/utils.service';
import { EmailManagementService } from 'src/utils/email-management.service';
import { GoogleRecaptchaService } from 'src/utils/google-recaptcha.service';
import { AWSBucketService } from 'src/utils/aws-bucket.service';
import * as AWS from 'aws-sdk';
import { AWSKMSService } from 'src/utils/aws-kms.service';
import { GeneralValidationsService } from 'src/utils/general-validations.service';
import {
  CreateBlockchainAppDTO,
  CompileSorobanContractDTO,
  EditBlockchainAppDTO,
  GetBlockchainAppDTO,
  DeploySorobanContractDTO,
  CallSorobanContractDTO,
} from './dto/app.dto';
import { AuthService } from 'src/users/auth.service';
import { GetWorkspaceDTO } from 'src/workspace/dto/crud-workspace.dto';
import {
  CreateBlockchainWalletDTO,
  DeployICPWalletDTO,
  EditBlockchainWalletDTO,
  EditICPWalletDTO,
  FundICPWalletDTO,
  GetBlockchainWalletDTO,
  TransferICPDTO,
} from './dto/wallet.dto';
import { KeyManagementICPService } from 'src/key-management/key-management-icp.service';
import { ICPService } from './icp.service';
import * as StellarSdk from 'stellar-sdk';
import { KeyManagementStellarService } from 'src/key-management/key-management-stellar.service';
import { SorobanService } from './soroban.service';
import {
  AskBotDTO,
  CreateContractDTO,
  RenameContractDTO,
  SaveContractDTO,
} from './dto/contract.dto';
import { GetDTO } from 'src/automation/dto/workflow.dto';
import { BotHelperSorobanService } from 'src/utils/bot-helper-soroban';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly keyManagementICPService: KeyManagementICPService,
    private readonly keyManagementStellarService: KeyManagementStellarService,
    private readonly sorobanService: SorobanService,
    private readonly generalValidationsService: GeneralValidationsService,
    private readonly botHelperSorobanService: BotHelperSorobanService,
    private readonly authService: AuthService,
    private readonly awsKMSService: AWSKMSService,
  ) {}

  async wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  //it compiles a soroban contract
  async listWasm(data: any, req: Request) {
    // const accessToken = String(req.headers['x-parse-session-token']);
    // const user = await this.authService.verifySessionToken(accessToken);
    // const otp = await this.sorobanService.compileSorobanContract(data);
    const contractPath = `/app/dist/blockchain/soroban/soroban-deployer/target/wasm32-unknown-unknown/release/hello_world.wasm`;
    console.log(
      `${process.cwd()}/dist/blockchain/soroban/soroban-deployer/target/wasm32-unknown-unknown/release/hello_world.wasm`,
    );
    try {
      const fileContents = await readFile(data.path);
      return fileContents; // This will return the contents of the file
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error; // Optionally, you can handle errors differently
    }
  }

  async listDir(data: any, req: Request) {
    // const accessToken = String(req.headers['x-parse-session-token']);
    // const user =  await this.authService.verifySessionToken(accessToken);
    // const otp = await this.sorobanService.compileSorobanContract(data);
    try {
      const fileContents = await readdir(data.path);
      return fileContents; // This will return the contents of the file
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error; // Optionally, you can handle errors differently
    }
  }

  async compileSorobanContract(data: CompileSorobanContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.authService.verifySessionToken(accessToken);

    await this.generalValidationsService.validateEditContract(
      user.id,
      data.contractId,
    );

    await this.sorobanService.compileSorobanContract(data);
    await this.wait(5000);
    console.log('entrando no path reading');
    const path = `${process.cwd()}/dist/blockchain/soroban-workspace/smart-contracts/${
      data.contractId
    }/target/wasm32-unknown-unknown/release/smart_contract.wasm`;
    try {
      const contractWasm = await readFile(path);
      console.log('entrando no path reading 234');
      const contractInspection = await this.sorobanService.inspectContract(
        data.contractId,
      );
      return { contractWasm, contractInspection };
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error; // Optionally, you can handle errors differently
    }
  }

  async deploySorobanContract(data: DeploySorobanContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.authService.verifySessionToken(accessToken);

    const contract =
      await this.generalValidationsService.validateInteractContractWithWallet(
        user.id,
        data.contractId,
        data.walletId,
      );

    const res: any = await this.sorobanService.deploySorobanContract(data);

    const history = await this.prisma.iDEContractDeploymentHistory.create({
      data: {
        chain: data.environment,
        contractAddress: res.contractAddress,
        ideContractId: contract.id,
        userWorkspaceId: contract.workspace.UserWorkspace[0].id,
      },
      include: {
        userWorkspace: {
          include: {
            user: true,
          },
        },
      },
    });
    //create the  history right after the soroban deployment is done in parallel.
    // setImmediate(async () => {
    //   try {
    //     await this.prisma.iDEContractDeploymentHistory.create({
    //       data: {
    //         chain: data.environment,
    //         contractAddress: res.contractAddress,
    //         ideContractId: contract.id,
    //         userWorkspaceId: contract.workspace.UserWorkspace[0].id,
    //       },
    //     });
    //   } catch (error) {
    //     console.error('Error creating iDEContractDeploymentHistory:', error);
    //   }
    // });
    res.history = history;
    return res;
  }

  async deploySoorbanTest(req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.authService.verifySessionToken(accessToken);

    const path = `${process.cwd()}/dist/blockchain/soroban/soroban-deployer/hello_world.wasm`;

    console.log('decrypting data for wallet balance icp');
    // const decWalletPrivKey = await this.awsKMSService.decryptData(
    //   'AQICAHj63GMaWoi3dGh9hLaOfQg1Yofgbo9Hrf9j9Z0eI8R2DQHHpemH3nCQ8qkjHG1yHTAJAAAAmjCBlwYJKoZIhvcNAQcGoIGJMIGGAgEAMIGABgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDOuoxhVdpygifkPoxgIBEIBTbJBgHmyA8bN+0ZGgLDFI5jEJRTk9uMUPULw5Xyot/U4B8agYhL3BOYAvWsAnuBDuNh59aIZbn0tEPXv0l3Mq4VyhmIkqBpG4j1ptpHT2s3MtGGA=',
    // );

    await this.keyManagementStellarService.deploySmartContract(
      path,
      'SBLGCS3O2A5A5T4P775L4I2T67UUIVCATNV5RIJ5LYROCWIXN3XV2WGC',
    );
  }

  async callSorobanContract(data: CallSorobanContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);
    const user = await this.authService.verifySessionToken(accessToken);

    await this.generalValidationsService.validateEditUpdateWallet(
      user.id,
      data.walletId,
    );

    return await this.sorobanService.callSorobanContract(data);
  }

  async createContract(data: CreateContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    const workspace =
      await this.generalValidationsService.validateWorkspaceUpdate(
        user.id,
        data.workspaceId,
      );

    if (workspace.ideContracts.length >= 50) {
      throw new BadRequestException(
        'Workspace reached the limit of 50 contracts',
      );
    }

    const contract = await this.prisma.iDEContract.create({
      data: {
        ...data,
      },
    });

    setImmediate(async () => {
      try {
        await this.sorobanService.compileSorobanContract({
          walletId: '0x',
          contractId: contract.id,
          code: data.code,
        });
      } catch (error) {
        console.error('Error trying compile contract:', error);
      }
    });
    return contract;
  }

  async askBot(data: AskBotDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    const contract = await this.generalValidationsService.validateEditContract(
      user.id,
      data.id,
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const askBotHistoriesCount = await this.prisma.askBotHistory.count({
      where: {
        workspaceId: contract?.workspaceId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Verify if the ask bot history was executed.
    if (askBotHistoriesCount >= 50) {
      throw new BadRequestException(
        'You have exceeded the API request limit of 50 AI bot calls in one hour. Please wait to continue using this feature.',
      );
    }

    const res = await this.botHelperSorobanService.inputQuestion(
      [],
      data.question,
    );
    console.log('res here');
    console.log(res);

    setImmediate(async () => {
      try {
        await this.prisma.askBotHistory.create({
          data: {
            workspaceId: contract?.workspaceId,
            input: data.question,
          },
        });
      } catch (error) {
        console.error('Error creating ask bot history:', error);
      }
    });

    return res;
  }

  async renameContract(data: RenameContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    await this.generalValidationsService.validateEditContract(user.id, data.id);

    return await this.prisma.iDEContract.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
    });
  }

  async saveContractCode(data: SaveContractDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    await this.generalValidationsService.validateEditContract(user.id, data.id);

    return await this.prisma.iDEContract.update({
      where: {
        id: data.id,
      },
      data: {
        code: data.code,
      },
    });
  }

  async deleteContract(data: GetDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    await this.generalValidationsService.validateEditContract(user.id, data.id);

    return await this.prisma.iDEContract.delete({
      where: {
        id: data.id,
      },
    });
  }

  async getContracts(data: GetDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    return await this.prisma.iDEContract.findMany({
      where: {
        workspace: {
          id: data.id,
          UserWorkspace: {
            some: {
              userId: user.id,
              enabled: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ideContractDeploymentHistories: {
          include: {
            userWorkspace: {
              select: {
                user: {
                  select: {
                    name: true,
                    profilePicture: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getContractsDeploymentHistories(data: GetDTO, req: Request) {
    const accessToken = String(req.headers['x-parse-session-token']);

    const user = await this.authService.verifySessionToken(accessToken);

    return await this.prisma.iDEContract.findMany({
      where: {
        workspace: {
          id: data.id,
          UserWorkspace: {
            some: {
              userId: user.id,
              enabled: true,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        ideContractDeploymentHistories: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            userWorkspace: {
              select: {
                user: {
                  select: {
                    name: true,
                    profilePicture: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
