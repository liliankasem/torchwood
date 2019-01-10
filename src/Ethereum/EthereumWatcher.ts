import winston = require('winston');

import { IStorage, IEventBus, IBlockTracker } from './../interfaces';
import { IEthereumReader } from './IEthereumReader';
import { BlockDetailIterator } from './readers/BlockDetailIterator';

export class EthereumWatcher {
    private readonly eth: IEthereumReader;
    private readonly eventBus: IEventBus;
    private readonly blockTracker: IBlockTracker;
    private readonly blockReader: BlockDetailIterator;

    constructor(client: IEthereumReader, eventBus: IEventBus, blockTracker: IBlockTracker) {
        this.eth = client;
        this.eventBus = eventBus;
        this.blockTracker = blockTracker;
        this.blockReader = new BlockDetailIterator(client, this.blockTracker);

        winston.info(blockTracker.Identifier());
        winston.info(eventBus.Identifier());
    }

    public async ReadExistingBlocks() {
        while (await this.blockReader.MoveNext()) {
            const data = await this.blockReader.Read();
            const block = data.Block();
            let index = -1;

            while ((index += 1) < data.addresses.length) {
                const address = data.addresses[index];
                const output = await this.eth.GetData(address, block);

                if (output._block) {
                    await this.eventBus.SendEvent(output);
                }
            }

            await this.blockTracker.MarkComplete(block.BlockNumber());
        }
    }

    public async Monitor() {
        await this.ReadExistingBlocks();
        setTimeout(async () => {
            await this.Monitor()
                .catch(err => winston.error(err));
        }, 8500);
    }
}

export class EthereumBlockTracker implements IBlockTracker {
    private readonly configName: string;
    private readonly storage: IStorage;
    private readonly originalBlock: number;
    private nextBlock: number;

    constructor(storage: IStorage, startingBlock: number) {
        this.configName = "watcherConfig.json";
        this.storage = storage;
        this.originalBlock = startingBlock;
        this.nextBlock =  -1;
    }

    public async NextBlock(): Promise<number> {
        if (this.nextBlock === -1) {
            if (await this.storage.Exists(this.configName)) {
                const content = await this.storage.ReadItem(this.configName);
                this.nextBlock = JSON.parse(content).nextBlock;
            }
        }

        if (this.nextBlock === -1) {
            this.nextBlock = this.originalBlock;
        }

        return this.nextBlock;
    }

    public async MarkComplete(blockNumber: number): Promise<void> {
        this.nextBlock = blockNumber + 1;
        const content = JSON.stringify({
            nextBlock: this.nextBlock
        });
        await this.storage.SaveItem(this.configName, content);
    }

    public Identifier() : string {
        return this.storage.Identifier();
    }
}

