import winston = require('winston');

winston.remove(winston.transports.Console);
   winston.add(winston.transports.Console, {
     level: 'debug',
     prettyPrint: true,
     colorize: true,
     silent: false,
     timestamp: false
   });


import {
    // LoggingConfiguration,
    AzureBlobStorage,
    FileSystemStorage,
    ServiceBusConfig,
    EventBusGroup,
    ConsoleEventBus,
    AzureServiceBusEventBus,
    Ethereum,
    IEventBus,
    IStorage,
    IIdentifier,
    ContractFactory,
    Sha256Notary
} from './index';

import util = require('util');
import config = require('config');
import { EthereumBlockTracker } from './Ethereum/Ethereum';

class Program {
    public static async Run() {
        await Program.WatchChain(config.get('rpcUrl'), config.get('startingBlock'));
    }

    public static async WatchChain(rpcUrl: string, startingBlock: string) {
        const storageConfig = config.get('storage');
        const web3Client = new Ethereum.Web3.EthereumWeb3Adapter(rpcUrl);
        const networkId = await Ethereum.EthereumReader.GetIdentity(web3Client);
        const eventBus = Program.GetEventBus(new ServiceBusConfig(config.get('serviceBus')));
        const chainStorage = Program.GetChainStorage(storageConfig, networkId);
        const contractStorage = Program.GetContractStorage(storageConfig);
        const fsCache = new Ethereum.Web3.EthereumWeb3AdapterStorageCache(web3Client, chainStorage);
        const ethClient = new Ethereum.EthereumReader(fsCache, chainStorage);

        const contractFactory = new ContractFactory(web3Client, chainStorage, new Sha256Notary());
        await contractFactory.UploadAndVerify(await contractStorage.ReadItem('Flag.sol'));

        if (startingBlock.length === 0) {
            startingBlock = 'latest';
        }
        const blockNumber = (await fsCache.GetBlock(startingBlock)).number;
        new Ethereum.EthereumWatcher(ethClient, eventBus, new EthereumBlockTracker(chainStorage, blockNumber))
            .Monitor()
            .catch(err => winston.error(err));
    }

    private static GetEventBus(serviceBusConfig: ServiceBusConfig): IEventBus {
        const eventBus = new EventBusGroup();
        eventBus.AddEventBus(new ConsoleEventBus());

        if (serviceBusConfig.IsValid()) {
            eventBus.AddEventBus(new AzureServiceBusEventBus(serviceBusConfig));
        }

        return eventBus;
    }

    private static GetChainStorage(storageConfig: any, networkId: IIdentifier): IStorage {
        const chainRoot = `${storageConfig.root}/${networkId.AsString()}`;
        return Program.GetStorage(chainRoot, storageConfig);
    }

    private static GetContractStorage(storageConfig: any): IStorage {
        const chainRoot = `${storageConfig.root}/Contracts`;
        return Program.GetStorage(chainRoot, storageConfig);
    }

    private static GetStorage(storageRoot: string, storageConfig: any): IStorage {
        let storage: IStorage;

        if (storageConfig.implementation === 'FileSystem') {
            storage = new FileSystemStorage(storageRoot);
        } else {
            storage = new AzureBlobStorage(storageConfig.azure.account, storageConfig.azure.key, storageRoot);
        }

        return storage;
    }
}

Program.Run()
    .catch(err => winston.error(err));