import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create(createWalletDto);
  }

  @Get()
  async findAll() {
    return this.walletsService.findAll();
  }

  @Get(':address')
  async findOne(@Param('address') address: string) {
    const wallet = await this.walletsService.findOneByAddress(address);
    if(!wallet){
      throw new NotFoundException();
    }
    return wallet;
  }

  @Delete(':address')
  async remove(@Param('address') address: string) {
    return this.walletsService.remove(address);
  }
}
