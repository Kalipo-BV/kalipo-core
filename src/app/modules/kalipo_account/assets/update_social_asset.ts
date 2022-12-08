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
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';

export class UpdateSocialAsset extends BaseAsset {
	public name = 'updateSocial';
	public id = 4;

	// Define schema for asset
	public schema = {
		$id: 'kalipo/kalipoAccount/updateSocial-asset',
		title: 'UpdateSocialAsset transaction asset for KalipoAccount module',
		type: 'object',
		required: ["socials"],
		properties: {
			socials: {
				type: "array",
				fieldNumber: 1,
				maxItems: 4,
				items: {
					type: "object",
					required: ["social", "link"],
					properties: {
						social: {
							dataType: "string",
							fieldNumber: 1,
							minLength: 1,
							maxLength: 64
						},
						link: {
							dataType: "string",
							fieldNumber: 2,
							minLength: 1,
							maxLength: 512
						}
					}

				}
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validation if links are from providing domain
		// for (let index = 0; index < asset.socials.length; index++) {
		// 	const social = asset.socials[index];

		// 	if (social.social === "linkedIn") {

		// 	} else if (social.social === "twitter") {

		// 	} else if (social.social === "discord") {

		// 	} else if (social.social === "medium") {

		// 	} else if (social.social === "website") {

		// 	}

		// }
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const senderAddress = transaction.senderAddress;
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		if (kalipoAccount !== null) {
			kalipoAccount?.socials = asset.socials
			await db.tables.kalipoAccount.updateRecord(stateStore, accountId, kalipoAccount)
		}

	}
}
