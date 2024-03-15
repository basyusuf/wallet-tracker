import { Injectable, Logger } from '@nestjs/common';
const Web3 = require('web3');
import Web3Type from 'web3';
import { Subscription } from 'web3-core-subscriptions';
import { Log } from 'web3-core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionSniffer {
    address: Array<TargetWallet> = [];
    socketNode: Web3Type;
    webNode: Web3Type;
    subscription: Subscription<Log>;
    logOptions: any;

    constructor(private readonly configService: ConfigService) {
        this.socketNode = new Web3(configService.get<string>('SOCKET_NODE_URL'));
        this.webNode = new Web3(configService.get<string>('WEB_NODE_URL'));
        this.logOptions = {
            address: [],
            topics: [this.webNode.utils.keccak256('Transfer(address,address,uint256)')]
        };
    }

    startSniffing() {
        try {
            Logger.log('Transaction Sniffer started.');
            this.subscription = this.socketNode.eth.subscribe('logs', this.logOptions, (err, res) => {
                if (err) console.error(err);
            });
            
            Logger.log('Subscription initialized');
            this.subscription.on('data', async (log) => {
                console.log(log);
            });
        } catch (error) {
            Logger.error('Transaction Sniffer Error:', error);
        }
    }

    stopSniffing() {
        if (this.subscription) {
            this.subscription.unsubscribe((error, success) => {
                if (success) {
                    Logger.log('Transaction Sniffer stopped.');
                } else if (error) {
                    Logger.error('Transaction Sniffer Error:', error);
                }
            });
        }
    }
}