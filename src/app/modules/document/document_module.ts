/* eslint-disable class-methods-use-this */

import {
    BaseModule,
    AfterBlockApplyContext,
    TransactionApplyContext,
    BeforeBlockApplyContext,
    AfterGenesisBlockApplyContext,
    // GenesisConfig
} from 'lisk-sdk';
import { db } from '../../database/db';

export class DocumentModule extends BaseModule {
    public actions = {
        getGovernmentalDocumentByID: async (params: Record<string, unknown>) => {
            return await db.tables.governmentalDocument.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getGovernmentalVersionByID: async (params: Record<string, unknown>) => {
            return await db.tables.governmentalVersion.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getGovernmentalEntryByID: async (params: Record<string, unknown>) => {
            return await db.tables.governmentalEntry.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
    };
    public reducers = {
        // Example below
        // getBalance: async (
        // 	params: Record<string, unknown>,
        // 	stateStore: StateStore,
        // ): Promise<bigint> => {
        // 	const { address } = params;
        // 	if (!Buffer.isBuffer(address)) {
        // 		throw new Error('Address must be a buffer');
        // 	}
        // 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
        // 	return account.token.balance;
        // },
    };
    public name = 'document';
    public transactionAssets = [];
    public events = [
        // Example below
        // 'document:newBlock',
    ];
    public id = 1010;

    // public constructor(genesisConfig: GenesisConfig) {
    //     super(genesisConfig);
    // }

    // Lifecycle hooks
    public async beforeBlockApply(_input: BeforeBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
        // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async afterBlockApply(_input: AfterBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
        // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async beforeTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccounts = genesisBlock.header.asset.accounts;
    }
}
