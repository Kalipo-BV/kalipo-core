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

import { ChainStateStore } from '@liskhq/lisk-chain/dist-node/state_store/chain_state_store';
import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';

const {
	helloCounterSchema,
	CHAIN_STATE_HELLO_COUNTER
} = require('../schemas');

export class CreateHelloAsset extends BaseAsset {
	public name = 'createHello';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'lisk/hello/asset',
		type: 'object',
		required: ["helloString"],
		properties: {
			helloString: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 3,
				maxLength: 64,
			},
		}
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		if (asset.helloString == "Some illegal statement") {
			throw new Error(
				'Illegal hello message: ${asset.helloString}'
			);
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		// 1. Get account data of the sender of the hello transaction
		const senderAddress = transaction.senderAddress;
		const senderAccount = await stateStore.account.get(senderAddress);

		// 2. Update hello message in the senders account with thehelloString of the transaction asset
		senderAccount.hello.helloMessage = asset.helloString;
		stateStore.account.set(senderAccount.address, senderAccount);
		// 3. Get the hello counter from the database
		let counterBuffer = await stateStore.chain.get(
			CHAIN_STATE_HELLO_COUNTER
		);

		// 4. Decode the hello counter
		let counter = codec.decode(
			helloCounterSchema,
			counterBuffer
		);

		// 5. Increment the hello counter +1
		counter.helloCounter++;

		// 6. Encode the hello counter and save it back to the database
		await stateStore.chain.set(
			CHAIN_STATE_HELLO_COUNTER,
			codec.encode(helloCounterSchema, counter)
		);
	}
}
