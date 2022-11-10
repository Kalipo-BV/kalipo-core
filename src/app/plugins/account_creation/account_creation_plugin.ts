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

import { BasePlugin, cryptography, PluginInfo, transactions } from 'lisk-sdk';
import type { BaseChannel, EventsDefinition, ActionsDefinition, SchemaWithDefault } from 'lisk-sdk';
import { TransactionSignCommand } from 'lisk-commander';

const accounts = require('../../../../config/default/accounts.json');

/* eslint-disable class-methods-use-this */
/* eslint-disable  @typescript-eslint/no-empty-function */
export class AccountCreationPlugin extends BasePlugin {
	// private _channel!: BaseChannel;

	public static get alias(): string {
		return 'accountCreation';
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get info(): PluginInfo {
		return {
			author: 'Kalipo B.V.',
			version: '0.1.0',
			name: 'accountCreation',
		};
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	public get defaults(): SchemaWithDefault {
		return {
			$id: '/plugins/plugin-accountCreation/config',
			type: 'object',
			properties: {},
			required: [],
			default: {},
		}
	}

	public get events(): EventsDefinition {
		return [
			// 'block:created',
			// 'block:missed'
			"new"
		];
	}

	public get actions(): ActionsDefinition {
		return {
			// createAccount: async () => {
			// 	console.log("Create  account triggered")
			// 	transferToken(this.codec, this._channel, this._nodeInfo);
			// },
		};
	}

	public async load(_: BaseChannel): Promise<void> {
		const nodeInfo = await _.invoke('app:getNodeInfo');

		_.subscribe('kalipoAccount:createAccount', async (data) => {
			const transaction = await this.transferToken(this.codec, _, nodeInfo, data.recipientAddress);
			_.publish("accountCreation:new", {
				address: data.recipientAddress,
				transactionId: transaction?.transactionId
			})
		});
	}

	public async unload(): Promise<void> { }

	private tokenTransferSchema = {
		$id: 'lisk/transfer-ass',
		title: 'Transfer transaction asset',
		type: 'object',
		required: ['amount', 'recipientAddress', 'data'],
		properties: {
			amount: {
				dataType: 'uint64',
				fieldNumber: 1,
			},
			recipientAddress: {
				dataType: 'bytes',
				fieldNumber: 2,
				minLength: 20,
				maxLength: 20,
			},
			data: {
				dataType: 'string',
				fieldNumber: 3,
				minLength: 0,
				maxLength: 64,
			},
		},
	};

	private async transferToken(codec,
		channel,
		nodeInfo,
		recipientAddress): Promise<TransactionId | undefined> {
		try {
			const passphrase = accounts[0].passphrase
			const amount = BigInt(1);
			const data = ""
			const fee = ""

			const asset = {
				recipientAddress: Buffer.from(recipientAddress, 'hex'),
				amount: BigInt(amount),
				data,
			};

			const { publicKey } = cryptography.getPrivateAndPublicKeyFromPassphrase(
				passphrase
			);
			const address = cryptography.getAddressFromPassphrase(passphrase);
			const account = await channel.invoke('app:getAccount', {
				address,
			});
			const { sequence: { nonce } } = codec.decodeAccount(account);

			const { id, ...tx } = transactions.signTransaction(
				this.tokenTransferSchema,
				{
					moduleID: 2,
					assetID: 0,
					nonce: BigInt(nonce),
					fee: fee || BigInt('200000'),
					senderPublicKey: publicKey,
					asset,
				},
				Buffer.from(nodeInfo.networkIdentifier, 'hex'),
				passphrase,
			);
			const encodedTransaction = codec.encodeTransaction(tx);
			const result = await channel.invoke('app:postTransaction', {
				transaction: encodedTransaction,
			});

			return result;
		}
		catch (err) {
			console.log(err)
			// res.status(409).json({
			// 	errors: [{ message: err.message }],
			// });
			return undefined
		}
	};
}

interface TransactionId {
	transactionId: string;
}
