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

import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { RowContext } from '../../../database/row_context';
import { KalipoAccount } from '../../../database/table/kalipo_account_table';

export class CreateAccountAsset extends BaseAsset {
	public name = 'createAccount';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'kalipo/kalipoAccount/createAccount-asset',
		title: 'CreateAccountAsset transaction asset for KalipoAccount module',
		type: 'object',
		required: ["username", "name"],
		properties: {
			username: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 16
			},
			name: {
				dataType: 'string',
				fieldNumber: 2,
				minLength: 2,
				maxLength: 64,
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		if (asset.username.indexOf(" ") !== -1) {
			throw new Error(
				'A username cannot contain spaces'
			);
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const usernameIndex = await db.indices.username.getRecord(stateStore, asset.username);
		if (usernameIndex !== null && usernameIndex.id !== "") {
			throw new Error(
				'Username is already taken!'
			);
		}

		const senderAddress = transaction.senderAddress;
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		let accountId = accountIdWrapper?.id

		if (accountId == undefined) {
			const newKalipoAccount: KalipoAccount = {
				username: asset.username,
				name: asset.name,
				socials: [],
				liskAccountId: senderAddress,
				memberships: [],
				transaction: transaction.id.toString('hex')
			}
			const accountRowContext = new RowContext();
			accountId = await db.tables.kalipoAccount.createRecord(stateStore, transaction, newKalipoAccount, accountRowContext)
			let allKalipoAccountIds = await db.indices.fullTable.getRecord(stateStore, "kalipoAccounts");

			if (allKalipoAccountIds !== null) {
				allKalipoAccountIds.ids.push(accountId);
			} else {
				allKalipoAccountIds = {
					ids: [accountId]
				}
			}

			await db.indices.fullTable.setRecord(stateStore, "kalipoAccounts", allKalipoAccountIds)

			await db.indices.liskId.setRecord(stateStore, senderAddress.toString('hex'), {
				id: accountId
			})


		} else {
			const existingKalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId.toString('hex'))
			if (existingKalipoAccount?.username === asset.username) {
				throw new Error(
					'New username is the same as old username'
				);
			}

			// Release previous claimed username by setting index to null
			if (existingKalipoAccount?.username !== undefined) {
				db.indices.username.deleteRecord(stateStore, existingKalipoAccount.username);
			}

			if (existingKalipoAccount !== null) {
				existingKalipoAccount.username = asset.username;
				existingKalipoAccount.name = asset.name;
				if (accountId) {
					await db.tables.kalipoAccount.updateRecord(stateStore, accountId, existingKalipoAccount)
				}
			}
		}

		await db.indices.username.setRecord(stateStore, asset.username, { id: accountId })
		console.log("E")

	}
}
