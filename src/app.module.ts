import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionSniffer } from './providers/transaction/transaction.provider';
import { DiscordProvider } from './providers/discord/discord.provider';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsEntity } from './wallets/entities/wallet.entity';
import { WalletsModule } from './wallets/wallets.module';
import { WalletsDataAccess } from './wallets/wallets.data-access';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WalletsModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      synchronize: true,
      entities: [WalletsEntity],
    }),
    TypeOrmModule.forFeature([WalletsEntity]),
  ],
  controllers: [AppController],
  providers: [AppService, TransactionSniffer, DiscordProvider, WalletsDataAccess]
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly transactionSniffer: TransactionSniffer, private readonly discordProvider: DiscordProvider) { }

  async onModuleInit() {
    this.transactionSniffer.startSniffing();
    this.discordProvider.initialize();
  }

  onModuleDestroy() {
    this.transactionSniffer.stopSniffing();
  }
}
