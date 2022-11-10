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

export class UpdateNameAsset extends BaseAsset {
	public name = 'updateName';
	public id = 3;

	// Define schema for asset
	public schema = {
		$id: 'kalipo/kalipoAccount/updateName-asset',
		title: 'UpdateNameAsset transaction asset for KalipoAccount module',
		type: 'object',
		required: ["name"],
		properties: {
			name: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 64,
			},
		}
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const senderAddress = transaction.senderAddress;
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		if (kalipoAccount !== null) {
			kalipoAccount?.name = asset.name
			await db.tables.kalipoAccount.updateRecord(stateStore, accountId, kalipoAccount)
		}
	}
}
