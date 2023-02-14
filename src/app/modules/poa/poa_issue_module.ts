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

import {
    Actions,
    AfterBlockApplyContext,
    AfterGenesisBlockApplyContext, BaseAsset, BaseModule,


    BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { db } from '../../database/db';
import { CreatePoaIssueAsset } from './assets/create_poa_issue_asset';

export class PoaIssueModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getByID: async (params: Record<string, unknown>) => {
            return await db.tables.poaIssue.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
        getAll: async (params: Record<string, unknown>) => {
            return await db.indices.fullTable.getRecordInJSON(this._dataAccess.getChainState.bind(this), "poaIssues")
        },
    };

    public reducers = {
    
    }

    public name = 'poaIssue';
    public transactionAssets = [new CreatePoaIssueAsset()];
    public events = [

    ];

    public id = 1009;

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