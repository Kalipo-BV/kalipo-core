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
import { DuplicateUsernameError } from '../../../exceptions/kalipoAccount/DuplicateUsernameError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { UsernameAlreadyTakenError } from '../../../exceptions/kalipoAccount/UsernameAlreadyTakenError';
import { UsernameContainsSpacesError } from '../../../exceptions/kalipoAccount/UsernameContainsSpacesError';

export class UpdateUsernameAsset extends BaseAsset {
	public name = 'updateUsername';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'kalipo/kalipoAccount/updateUsername-asset',
		title: 'UpdateUsernameAsset transaction asset for KalipoAccount module',
		type: 'object',
		required: ["username"],
		properties: {
			username: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 16
			},
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		if (asset.username.indexOf(" ") !== -1) {
			throw new UsernameContainsSpacesError();
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const usernameIndex = await db.indices.username.getRecord(stateStore, asset.username);

		if (usernameIndex !== null && usernameIndex.id !== "") {
			throw new UsernameAlreadyTakenError();
		}

		const senderAddress = transaction.senderAddress;
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		let accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
		}

		const existingKalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId.toString('hex'))
		if (existingKalipoAccount?.username === asset.username) {
			throw new DuplicateUsernameError();
		}

		// Release previous claimed username by setting index to null
		if (existingKalipoAccount?.username !== undefined) {
			db.indices.username.deleteRecord(stateStore, existingKalipoAccount.username);
		}

		if (existingKalipoAccount !== null) {
			existingKalipoAccount.username = asset.username;
			if (accountId) {
				await db.tables.kalipoAccount.updateRecord(stateStore, accountId, existingKalipoAccount)
			}
		}

		await db.indices.username.setRecord(stateStore, asset.username, { id: accountId })
	}
}
