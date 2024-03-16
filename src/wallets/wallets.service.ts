import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletsDataAccess } from './wallets.data-access';

@Injectable()
export class WalletsService {
  constructor(private walletsDataAccess: WalletsDataAccess) { }
  async create(createWalletDto: CreateWalletDto) {
    const user = await this.walletsDataAccess.create(createWalletDto);
    return user;
  }

  async findAll() {
    return this.walletsDataAccess.findAll();
  }

  async findOneByAddress(address: string) {
    return this.walletsDataAccess.findyByAddress(address);
  }

  async remove(address: string) {
    return this.walletsDataAccess.removeByAddress(address);
  }
}
