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
import { Vote } from '../../../database/table/vote_table';
import { AutonNotFoundError } from '../../../exceptions/auton/AutonNotFoundError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { MembershipInvitationStillOpenError } from '../../../exceptions/membership/MembershipInvitationStillOpenError';
import { MembershipNotActiveError } from '../../../exceptions/membership/MembershipNotActiveError';
import { ProposalClosedError } from '../../../exceptions/proposal/ProposalClosedError';
import { ProposalNewVotesBlockedError } from '../../../exceptions/proposal/ProposalNewVotesBlockedError';
import { ProposalNotFoundError } from '../../../exceptions/proposal/ProposalNotFoundError';
import { ProposalNotOpenedError } from '../../../exceptions/proposal/ProposalNotOpenedError';
import { AlreadyVotedError } from '../../../exceptions/vote/AlreadyVotedError';

export class BinaryVotingAsset extends BaseAsset {
	public name = 'binaryVoting';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'vote/binaryVoting-asset',
		title: 'BinaryVotingAsset transaction asset for vote module',
		type: 'object',
		required: ["proposalId", "answer"],
		properties: {
			proposalId: {
				dataType: 'string',
				fieldNumber: 1,
			},
			answer: {
				dataType: 'string',
				fieldNumber: 2,
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
		if (asset.answer !== "ACCEPT" && asset.answer !== "REFUSE") {
			throw new Error('Answer can only be ACCEPT or REFUSE');
		} 
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const now = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// Proposal
		const proposal = await db.tables.proposal.getRecord(stateStore, asset.proposalId)
		if (proposal == null) {
			throw new ProposalNotFoundError();
		}

		if (now < proposal.windowOpen) {
			throw new ProposalNotOpenedError();
		}

		if (now > proposal.windowClosed) {
			throw new ProposalClosedError();
		}

		if (proposal.status != ProposalStatus.DECIDED && proposal.status != ProposalStatus.VOTING) {
			throw new ProposalNewVotesBlockedError();
		}

		// Membership
		const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, proposal.autonId, stateStore);
		const membershipId: string | null = membershipCheck.membershipId
		const membership: Membership | null = membershipCheck.membership

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new KalipoAccountNotFoundError();
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new MembershipNotActiveError();
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new MembershipInvitationStillOpenError();
		}

		// Votes
		for (let index = 0; index < proposal.votes.length; index++) {
			const voteId = proposal.votes[index];
			const otherVote = await db.tables.vote.getRecord(stateStore, voteId)
			if (otherVote?.membershipId == membershipId) {
				throw new AlreadyVotedError(otherVote?.answer);
			}
		}

		// Auton
		const auton = await db.tables.auton.getRecord(stateStore, proposal.autonId)
		if (auton == null) {
			throw new AutonNotFoundError();
		}

		// Place vote
		const vote: Vote = {
			proposalId: asset.proposalId,
			membershipId: membershipId,
			answer: asset.answer,
			transaction: transaction.id.toString('hex'),
			casted: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)
		}
		const voteId = await db.tables.vote.createRecord(stateStore, transaction, vote, new RowContext());

		membership?.votes.push(voteId)
		await db.tables.membership.updateRecord(stateStore, membershipId, membership);

		proposal.votes.push(voteId);
		await db.tables.proposal.updateRecord(stateStore, asset.proposalId, proposal);

		// Schedule a determination of the voting result
		if (proposal.status == ProposalStatus.VOTING) {
			const index = await db.indices.scheduledProposal.getRecord(stateStore, "current");
			if (index !== null) {
				for (let i = 0; i < index.data.length; i++) {
					const reference = index.data[i];
					// Set to be scheduled for now
					if (reference.id == asset.proposalId) {
						reference.scheduled = now;
						index.data[i] = reference
					}

				}

				await db.indices.scheduledProposal.setRecord(stateStore, "current", index);
			}

		}

	}
}
