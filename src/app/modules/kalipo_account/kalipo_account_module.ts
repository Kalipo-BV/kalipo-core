/* Kalipo B.V. - the DAO platform for business & societal impact 
 * Copyright (C) 2022 Peter Nobels and Matthias van Dijk
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable class-methods-use-this */

import {
    AfterBlockApplyContext,


    AfterGenesisBlockApplyContext, BaseModule,


    BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { UpdateNameAsset } from "./assets/update_name_asset";
import { UpdateSocialAsset } from "./assets/update_social_asset";
import { db } from '../../database/db';
import { CreateAccountAsset } from './assets/create_account_asset';

export class KalipoAccountModule extends BaseModule {

    public actions = {
        getAccountIdByUsername: async (params: Record<string, unknown>) => {
            return await db.indices.username.getRecord(this._dataAccess.getChainState.bind(this), (params as { username: string }).username)
        },
        getAccountIdByLiskId: async (params: Record<string, unknown>) => {
            return await db.indices.liskId.getRecord(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getByID: async (params: Record<string, unknown>) => {
            this._dataAccess.getAccountByAddress.bind(this);
            const id = (params as { id: string }).id;
            const result = await db.tables.kalipoAccount.getRecordInJSON(this._dataAccess.getChainState.bind(this), id)
            return result;
        },
        getAll: async (params: Record<string, unknown>) => {
            return await db.indices.fullTable.getRecordInJSON(this._dataAccess.getChainState.bind(this), "kalipoAccounts")
        },
        registerNewAccount: async (params: Record<string, unknown>) => {
            const recipientAddress = (params as { accountAddress: Buffer }).accountAddress;
            // const sender = await this._dataAccess.getAccountByAddress(senderAddress);
            // if (sender === undefined) {
            //     this.
            //     await this._dataAccess.set(transaction.senderAddress, sender);
            //     await reducerHandler.invoke("token:credit", {
            //         address: transaction.senderAddress,
            //         amount: BigInt(1),
            //     });
            // }
            this._channel.publish('kalipoAccount:createAccount', {
                recipientAddress: recipientAddress
            });

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
    public name = 'kalipoAccount';
    public transactionAssets = [new CreateAccountAsset(), new UpdateNameAsset(), new UpdateNameAsset(), new UpdateSocialAsset()];
    public events = [
        // Example below
        // 'username:newBlock',
        "createAccount"
    ];
    public id = 1001;

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
        // const { transaction, stateStore, reducerHandler } = _input;
        // console.log("-------TESTTTTTT------")

        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
        // if (transaction.moduleID === 1001) {
        //     const sender = await stateStore.account.getOrDefault(transaction.senderAddress);
        //     await stateStore.account.set(transaction.senderAddress, sender);
        //     await reducerHandler.invoke("token:credit", {
        //         address: transaction.senderAddress,
        //         amount: BigInt(1),
        //     });
        // }
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);

    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccounts = genesisBlock.header.asset.accounts;
    }

    // private async _transferFunds(address: string): Promise<void> {
    //     const transferTransactionParams = {
    //         amount: BigInt(transactions.convertLSKToBeddows(this._config.amount)),
    //         recipientAddress: Buffer.from(address, 'hex'),
    //         data: '',
    //     };

    //     const transaction = await this._client.transaction.create(
    //         {
    //             moduleID: 2,
    //             commandID: 0,
    //             senderPublicKey: this._state.publicKey as Buffer,
    //             fee: BigInt(transactions.convertLSKToBeddows(this._config.fee)), // TODO: The static fee should be replaced by fee estimation calculation
    //             params: transferTransactionParams,
    //         },
    //         this._state.passphrase as string,
    //     );

    //     await this._client.transaction.send(transaction);
    // }
}
