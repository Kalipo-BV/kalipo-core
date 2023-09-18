/* eslint-disable class-methods-use-this */
import {
    AfterBlockApplyContext,
    AfterGenesisBlockApplyContext, BaseModule,
    BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { db } from '../../database/db';
import { CreateAgreementAsset } from "./assets/create_agreement_asset";
import { SignAgreementVersionAsset } from "./assets/sign_agreement_version_asset";

export class AgreementModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getByID: async (params: Record<string, unknown>) => {
            return await db.tables.agreementTable.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getAll: async () => {
            return await db.indices.fullTable.getRecordInJSON(this._dataAccess.getChainState.bind(this), "agreements")
        },
        getByID2: async (params: Record<string, unknown>) => {
            return await db.indices.agreements.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as {id: string}).id)
        },
        getAllByAccount: async (params: Record<string, unknown>) => {
            // this._dataAccess.getAccountByAddress.bind(this);
            const id = (params as { id: string }).id;
            var indexes = await this.actions.getAll();
            var returnList = [];
            for(var element in indexes["ids"]) {
                try{
                    var agreement: any = await this.actions.getByID({ id: indexes["ids"][element] });
                    if(agreement?.client.includes(id) || agreement?.contractor.includes(id) || agreement?.creator == id) {
                        agreement.tid = indexes["ids"][element];
                        returnList.push(agreement);
                    }
                } catch {
                    //temporary fix for not removing/emptying existing index list
                };
            }
            return returnList;
        },
        getSignInfo: async (params: Record<string, unknown>) => {
            // return (((await this.actions.getByID(params)).agreementVersion)[(params as {version: number}).version].signedBy);
            const data = (await this.actions.getByID(params)); //.agreementVersion[(params as {version: number}).version].signedBy
            const singInfo = data?.agreementVersion[(params as {version: number}).version - 1].signedBy
            let test = {};

            test[data?.creator] = {name: (await db.tables.kalipoAccount.getRecordInJSON(this._dataAccess.getChainState.bind(this), data?.creator))?.name, signed: singInfo.includes(data?.creator)};
            await Promise.all((data?.contractor || []).map(async (element) => {
                test[element] = {name: (await db.tables.kalipoAccount.getRecordInJSON(this._dataAccess.getChainState.bind(this), element))?.name, signed: singInfo.includes(element)};
            }));
            await Promise.all((data?.client || []).map(async (element) => {
                test[element] = {name: (await db.tables.kalipoAccount.getRecordInJSON(this._dataAccess.getChainState.bind(this), element))?.name, signed: singInfo.includes(element)};
            }));

            return test;
        }
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
    public name = 'agreement';
    public transactionAssets = [new CreateAgreementAsset(), new SignAgreementVersionAsset()];
    public events = [
        // Example below
        // 'agreement:newBlock',
    ];
    public id = 1011;

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
