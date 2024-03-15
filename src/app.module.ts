import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionSniffer } from './transaction/transaction.provider';
import { DiscordProvider } from './discord/discord.provider';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, TransactionSniffer, DiscordProvider]
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly transactionSniffer: TransactionSniffer, private readonly discordProvider: DiscordProvider) {}

  onModuleInit() {
    this.transactionSniffer.startSniffing();
    this.discordProvider.initialize();
  }

  onModuleDestroy() {
    this.transactionSniffer.stopSniffing();
  }
}
