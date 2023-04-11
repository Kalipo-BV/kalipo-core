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


    BeforeBlockApplyContext, TransactionApplyContext,
    codec
} from 'lisk-sdk';
import { db } from '../../database/db';
import { CreateDaoAsset } from "./assets/create_dao";



export class DaoModule extends BaseModule {
    public actions = {
        getByID: async (params: Record<string, unknown>) => {
            return await db.tables.dao.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getDaoIdByName: async (params: Record<string, unknown>) => {
            return await db.indices.autonName.getRecord(this._dataAccess.getChainState.bind(this), (params as { name: string }).name)
        },
        getAll: async (params: Record<string, unknown>) => {
            return await db.indices.fullTable.getRecordInJSON(this._dataAccess.getChainState.bind(this), "daos")
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
    public name = 'dao';
    public transactionAssets = [new CreateDaoAsset()];
    public events = [
    ];
    public id = 1000;

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
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
    }


}
