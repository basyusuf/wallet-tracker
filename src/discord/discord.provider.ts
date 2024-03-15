import { Injectable, Logger } from '@nestjs/common';
import { Client, TextChannel, GatewayIntentBits } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordProvider {
    private readonly client: Client;

    constructor(private readonly configService: ConfigService) {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    }

    async initialize() {
        try {
            await this.client.login(this.configService.get<string>('DISCORD_TOKEN'));
            Logger.log('Discord bot connected.');
            this.consume();
        } catch (error) {
            Logger.error('Error while connecting to Discord:', error);
        }
    }

    async consume() {
        this.client.on('ready', async () => {
            Logger.log(`Logged in as ${this.client.user.tag}!`);
            await this.sendMessage(this.getTargetChannelId(), `:green_circle: Wallet tracker started \nTimestamp: [${new Date().toISOString()}]`);
        });
    }

    async sendMessage(channelId: string, message: string) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                Logger.error(`Channel with ID ${channelId} not found.`);
                return;
            }
            if (channel.isTextBased()) {
                await (channel as TextChannel).send(message);
                Logger.log('Message sent to Discord successfully. Message:', message);
            } else {
                Logger.error(`Channel with ID ${channelId} is not a text channel.`);
            }
        } catch (error) {
            Logger.error('Error while sending message to Discord:', error);
        }
    }

    getTargetChannelId() {
        return this.configService.get<string>('TARGET_CHANNEL_ID');
    }
}