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
import { KalipoAccountNotBoundToMembershipError } from '../../../exceptions/kalipoAccount/KalipoAccountNotBoundToMembershipError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { MembershipNotBoundToKalipoAccountError } from '../../../exceptions/kalipoAccount/MembershipNotBoundToKalipoAccountError';
import { MembershipAlreadyStartedError } from '../../../exceptions/membership/MembershipAlreadyStartedError';
import { MembershipInvitationNotFoundError } from '../../../exceptions/membership/MembershipInvitationNotFoundError';
import { InvitationAlreadyAcceptedError } from '../../../exceptions/membershipInvitation/InvitationAlreadyAcceptedError';
import { InvitationAlreadyRefusedError } from '../../../exceptions/membershipInvitation/InvitationAlreadyRefusedError';

export class AcceptAsset extends BaseAsset {
	public name = 'accept';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'membership/accept-asset',
		title: 'AcceptAsset transaction asset for membership module',
		type: 'object',
		required: ["membershipId"],
		properties: {
			membershipId: {
				dataType: 'string',
				fieldNumber: 1,
			}
		},
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
			throw new KalipoAccountNotFoundError();
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		if (kalipoAccount !== null) {
			if (!kalipoAccount.memberships.includes(asset.membershipId)) {
				throw new KalipoAccountNotBoundToMembershipError();
			}
		}

		const membership = await db.tables.membership.getRecord(stateStore, asset.membershipId)
		if (membership == null) {
			throw new MembershipInvitationNotFoundError();

		}
		if (membership.accountId !== accountId) {
			throw new MembershipNotBoundToKalipoAccountError();
		}

		if (membership.invitation.accepted !== BigInt(0)) {
			throw new InvitationAlreadyAcceptedError();
		}

		if (membership.invitation.refused !== BigInt(0)) {
			throw new InvitationAlreadyRefusedError();
		}

		if (membership.started !== BigInt(0)) {
			throw new MembershipAlreadyStartedError();
		}

		if (BigInt(stateStore.chain.lastBlockHeaders[0].timestamp) < membership.invitation.validStart) {
			throw new Error("Invitation can only be accepted after <" + membership.invitation.validStart + ">")
		}

		if (BigInt(stateStore.chain.lastBlockHeaders[0].timestamp) >= membership.invitation.validEnd) {
			throw new Error("Invitation was expired since <" + membership.invitation.validEnd + ">")
		}
		membership.started = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp);
		membership.invitation.accepted = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp);
		await db.tables.membership.updateRecord(stateStore, asset.membershipId, membership)

	}
}
