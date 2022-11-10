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
import { CreateHelloAsset } from "./assets/create_hello_asset";

const {
    helloCounterSchema,
    helloAssetSchema,
    CHAIN_STATE_HELLO_COUNTER
} = require('./schemas');

// const { CreateHelloAsset } = require('./assets/create_hello_asset');

export class HelloModule extends BaseModule {
    public accountSchema = {
        type: 'object',
        properties: {
            helloMessage: {
                fieldNumber: 1,
                dataType: 'string',
                maxLength: 64,
            },
        },
        default: {
            helloMessage: '',
        },
    };

    // public transactionAssets = [
    //     new CreateHelloAsset()
    // ];

    public actions = {
        amountOfHellos: async () => {
            const res = await this._dataAccess.getChainState(CHAIN_STATE_HELLO_COUNTER);
            const count = codec.decode(
                helloCounterSchema,
                res
            );
            return count;
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
    public name = 'hello';
    public transactionAssets = [new CreateHelloAsset()];
    public events = [
        "newHello"
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
        // Publish a `newHello` event for every received hello transaction
        // 1. Check for correct module and asset IDs
        if (_input.transaction.moduleID === this.id && _input.transaction.assetID === 0) {

            // 2. Decode the transaction asset
            const helloAsset = codec.decode(
                helloAssetSchema,
                _input.transaction.asset
            );

            // 3. Publish the event 'hello:newHello' and
            // attach information about the sender address and the posted hello message.
            this._channel.publish('hello:newHello', {
                sender: _input.transaction._senderAddress.toString('hex'),
                hello: helloAsset.helloString
            });
        }
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Set the hello counter to zero after the genesis block is applied
        await _input.stateStore.chain.set(
            CHAIN_STATE_HELLO_COUNTER,
            codec.encode(helloCounterSchema, { helloCounter: 0 })
        );
    }


}
