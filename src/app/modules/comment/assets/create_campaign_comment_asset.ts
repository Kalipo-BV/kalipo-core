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
import { ProposalStatus, MembershipValidationError } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { Membership } from '../../../database/table/membership_table';
import { ProposalCampaignComment } from '../../../database/table/proposal_campaign_comment_table';

export class CreateCampaignCommentAsset extends BaseAsset {
	public name = 'createCampaignComment';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'comment/createCampaignComment-asset',
		title: 'CreateCampaignCommentAsset transaction asset for comment module',
		type: 'object',
		required: ["proposalId", "comment"],
		properties: {
			proposalId: {
				dataType: 'string',
				fieldNumber: 1,
			},
			comment: {
				dataType: 'string',
				fieldNumber: 2,
				minLength: 2,
				maxLength: 1024,
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		if (accountId == asset.accountIdToInvite) {
			throw new Error("You cannot invite yourself")
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// Proposal
		const proposal = await db.tables.proposal.getRecord(stateStore, asset.proposalId)
		if (proposal == null) {
			throw new Error("The proposal cannot be found")
		}

		// Membership
		const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, proposal.autonId, stateStore);
		const membershipId: string | null = membershipCheck.membershipId
		const membership: Membership | null = membershipCheck.membership

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new Error("No Kalipo account found")
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new Error("You need a membership to submit new proposals")
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new Error("You aren't member yet, you still need to accept the invitation")
		}

		// Proposal status
		if (proposal.status != ProposalStatus.CAMPAIGNING) {
			throw new Error("New comments are only allowed when the proposal is in the campaining phase")
		}
		const created = stateStore.chain.lastBlockHeaders[0].timestamp

		const comment: ProposalCampaignComment = {
			proposalId: asset.proposalId,
			membershipId: membershipId,
			comment: asset.comment,
			likes: [],
			dislikes: [],
			created: BigInt(created)
		}

		const commentId = await db.tables.campaignComment.createRecord(stateStore, transaction, comment, new RowContext())
		membership?.comments.push(commentId)
		await db.tables.membership.updateRecord(stateStore, membershipId, membership)
	}
}
