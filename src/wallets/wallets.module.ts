import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletsEntity } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsDataAccess } from './wallets.data-access';
import { TransactionSniffer } from '../providers/transaction/transaction.provider';

@Module({
  imports: [TypeOrmModule.forFeature([WalletsEntity])],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsDataAccess],
})
export class WalletsModule { }
