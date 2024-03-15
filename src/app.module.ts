import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionSniffer } from './transaction/transaction.provider';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, TransactionSniffer]
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly transactionSniffer: TransactionSniffer) {}

  onModuleInit() {
    this.transactionSniffer.startSniffing();
  }

  onModuleDestroy() {
    this.transactionSniffer.stopSniffing();
  }
}
