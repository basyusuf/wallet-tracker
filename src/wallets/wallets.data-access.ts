import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { WalletsEntity } from "./entities/wallet.entity";
import { Repository } from 'typeorm';
import { CreateWalletDto } from "./dto/create-wallet.dto";

@Injectable()
export class WalletsDataAccess {
    constructor(
        @InjectRepository(WalletsEntity)
        private walletsRepository: Repository<WalletsEntity>
    ) { }

    async create(data: CreateWalletDto) {
        const wallet = this.walletsRepository.create({ wallet_address: data.address, name: data.name });
        return this.walletsRepository.save(wallet);
    }

    async findyByAddress(address: string) {
        return this.walletsRepository.findOne({ where: { wallet_address: address } });
    }

    async findAll() {
        return this.walletsRepository.find();
    }

    async removeByAddress(address: string) {
        return this.walletsRepository.delete({ wallet_address: address });
    }
}