import { Injectable, Logger } from '@nestjs/common';
const Web3 = require('web3');
import Web3Type from 'web3';
import { Subscription } from 'web3-core-subscriptions';
import { Log } from 'web3-core';
import { ConfigService } from '@nestjs/config';
import { DiscordProvider } from '../discord/discord.provider';
import { ERC20 } from '../../web3/abi';
import { TokenInfo } from '../../interfaces/token.interface';
import { WalletsDataAccess } from '../../wallets/wallets.data-access';
import { WalletsEntity } from '../../wallets/entities/wallet.entity';

@Injectable()
export class TransactionSniffer {
    address: Array<TargetWallet> = [];
    socketNode: Web3Type;
    webNode: Web3Type;
    subscription: Subscription<Log>;
    logOptions: any;
    tokenMap: TokenInfo = {};
    targetWallets: WalletsEntity[];
    abiMap: Map<string, any> = new Map();

    constructor(private readonly configService: ConfigService, private readonly discordProvider: DiscordProvider, private readonly walletDataAccess: WalletsDataAccess) {
        this.socketNode = new Web3(configService.get<string>('SOCKET_NODE_URL'));
        this.webNode = new Web3(configService.get<string>('WEB_NODE_URL'));
        this.logOptions = {
            address: [],
            topics: [this.webNode.utils.keccak256('Transfer(address,address,uint256)')]
        };
    }

    async initConfig() {
        Logger.log('Transaction config initialize...');
        this.generateAbiMap();
    }

    async refreshUser(){
        Logger.log('Refresh user started');
        this.targetWallets = await this.walletDataAccess.findAll();
        Logger.log(`Transaction config completed. Wallet count: ${this.targetWallets.length}`);
    }

    async startSniffing() {
        try {
            await this.refreshUser();
            await this.initConfig();
            Logger.log('Transaction Sniffer started');
            this.subscription = this.socketNode.eth.subscribe('logs', this.logOptions, (err, res) => {
                if (err) console.error(err);
            });

            Logger.log('Subscription initialized');
            this.subscription.on('data', async (log) => {
                this.checkLog(log);
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

    private generateAbiMap() {
        for (const abi of ERC20) {
            if (abi.type == 'event') {
                let input_type = abi.inputs.map(input => input.type).join(',');
                let event_prototype_str = `${abi.name}(${input_type})`;
                let event_prototype_hash = this.webNode.utils.keccak256(event_prototype_str)
                this.abiMap.set(event_prototype_hash, abi.inputs)
            }
        }
    };

    private async checkLog(log: Log) {
        try {
            const decodedLog = this.decodeLog(log);
            const flag = await this.isAddressInWatchlist(decodedLog);
            if (flag) {
                await this.addTokenPropertiesIfNotExistsInMap(log.address);
                const message = this.generateMessage(log, decodedLog, this.tokenMap[log.address]);
                this.discordProvider.sendMessage(this.discordProvider.getTargetChannelId(), message)
            }
        } catch (err) {
            return;
        }
    }

    private async isAddressInWatchlist(log: { [key: string]: string }) {
        if (!(this.includeDeadList(log.from) || this.includeDeadList(log.to)) && this.checkOnList(log.to))
            return true;
        return false;
    }

    private checkOnList(address: string) {
        return this.targetWallets.find(x => x.wallet_address === address);
    }

    private async addTokenPropertiesIfNotExistsInMap(tokenAddress: string) {
        if (!this.tokenMap[tokenAddress]) {
            const token_contract = new this.webNode.eth.Contract(ERC20 as any, tokenAddress);
            this.tokenMap[tokenAddress] = {
                decimals: await token_contract.methods.decimals().call(),
                symbol: await token_contract.methods.symbol().call(),
            };
        }
    }

    private decodeLog(log: Log) {
        return this.webNode.eth.abi.decodeLog(this.abiMap.get(log.topics[0]), log.data, log.topics.slice(1));
    }

    private includeDeadList(address: string) {
        return ['0x0000000000000000000000000000000000000000', '0x000000000000000000000000000000000000dEaD'].includes(address);
    }

    private generateMessage(log: Log, decodedLog: { [key: string]: string; }, tokenInfo: any) {
        let timeStamp = new Date().toISOString();
        const processed_value = this.round((Number(decodedLog.value)) * 10 ** (-tokenInfo.decimals), 2)
        return `
        \n:green_square: **${'DAO'}**
        \nDiscovered a New Transaction! 
        \nToken Address: **${log.address}** \nTime: ${timeStamp} \nSender: ${decodedLog.from} \nReceiver: ${decodedLog.to} \nValue: ${processed_value} \nTICKER: ${tokenInfo.symbol}
        \nTransaction Details
        \n\`https://snowtrace.io/tx/${log.transactionHash}\`\n\`https://snowscan.xyz/tx/${log.transactionHash}\``;
    }

    round(num, decimal) {
        return Math.round((num + Number.EPSILON) * 10 ** decimal) / (10 ** decimal);
    }
}