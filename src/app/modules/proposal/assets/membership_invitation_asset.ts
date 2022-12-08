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
import { MembershipValidationError, ProposalResult, ProposalStatus, ProposalType } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { ProposalCampaignComment } from '../../../database/table/proposal_campaign_comment_table';
import { ProposalProvisions } from '../../../database/table/proposal_provisions_table';
import { BinaryVoteResult, MembershipInvitationArguments, MultiChoiceCount, MultiChoicePollArguments, MultiChoiceVoteResult, Proposal } from '../../../database/table/proposal_table';
import { AutonNotFoundError } from '../../../exceptions/auton/AutonNotFoundError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { CantInviteYourselfError } from '../../../exceptions/membership/CantInviteYourselfError';
import { InvitedAccountAlreadyHasInvitationError } from '../../../exceptions/membership/InvitedAccountAlreadyHasInvitationError';
import { InvitedAccountAlreadyMemberError } from '../../../exceptions/membership/InvitedAccountAlreadyMemberError';
import { InvitedAccountNotFoundError } from '../../../exceptions/membership/InvitedAccountNotFoundError';
import { MembershipInvitationStillOpenError } from '../../../exceptions/membership/MembershipInvitationStillOpenError';
import { MembershipNotActiveError } from '../../../exceptions/membership/MembershipNotActiveError';
import { ProposalTypeNoProvisionError } from '../../../exceptions/provision/ProposalTypeNoProvisionError';
import { ProvisionNotFoundError } from '../../../exceptions/provision/ProvisionNotFoundError';

export class MembershipInvitationAsset extends BaseAsset {
	public name = 'membershipInvitation';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'proposal/membershipInvitation-asset',
		title: 'MembershipInvitationAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId", "accountIdToInvite"],
		properties: {
			title: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 32,
			},
			campaignComment: {
				dataType: 'string',
				fieldNumber: 2,
				maxLength: 1024,
			},
			proposalType: {
				dataType: 'string',
				fieldNumber: 3,
				maxLength: 256,
			},
			autonId: {
				dataType: 'string',
				fieldNumber: 4,
				maxLength: 256,
			},
			accountIdToInvite: {
				dataType: 'string',
				fieldNumber: 5,
				maxLength: 256
			},
			invitationMessage: {
				dataType: 'string',
				fieldNumber: 6,
				maxLength: 128
			},

		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const TYPE = ProposalType.MEMBERSHIP_INVITATION
		//  Get latest provision for auton by proposal type membership-invtitation
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
		}

		if (accountId == asset.accountIdToInvite) {
			throw new CantInviteYourselfError();
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// Auton
		const auton = await db.tables.auton.getRecord(stateStore, asset.autonId)
		if (auton == null) {
			throw new AutonNotFoundError();
		}

		// Membership
		const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, asset.autonId, stateStore);
		const submitterMembershipId: string | null = membershipCheck.membershipId

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new KalipoAccountNotFoundError();
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new MembershipNotActiveError();
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new MembershipInvitationStillOpenError();
		}

		// Membership check invited account
		const kalipoAccountToBeInvited = await db.tables.kalipoAccount.getRecord(stateStore, asset.accountIdToInvite)

		// Membership check invited account
		const invitedMembershipCheck = await db.tables.membership.validateMembership(kalipoAccountToBeInvited, asset.autonId, stateStore);
		if (invitedMembershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new InvitedAccountNotFoundError();
		}

		if (invitedMembershipCheck.error == MembershipValidationError.NO_ERROR) {
			throw new InvitedAccountAlreadyMemberError();
		}

		if (invitedMembershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new InvitedAccountAlreadyHasInvitationError();
		}

		// Provisions
		let provisionId: string | null = null;
		let provision: ProposalProvisions | null = null;
		for (let index = 0; index < auton.constitution.length; index++) {
			const proposalType = auton.constitution[index];
			if (proposalType.type == TYPE) {
				if (proposalType.provisions.length > 0) {
					const lastProvisionId = proposalType.provisions[proposalType.provisions.length - 1]
					const provisionResult = await db.tables.provisions.getRecord(stateStore, lastProvisionId)
					if (provisionResult !== null) {
						provision = provisionResult
						provisionId = lastProvisionId
						break;
					} else {
						throw new ProvisionNotFoundError();
					}

				} else {
					throw new ProposalTypeNoProvisionError();
				}
			}
		}

		if (provision == null) {
			throw new ProvisionNotFoundError();
		}

		const created = stateStore.chain.lastBlockHeaders[0].timestamp

		const proposalComments: Array<string> = []
		if (asset.campaignComment != null && asset.campaignComment != "") {
			const proposalCampaignComment: ProposalCampaignComment = {
				proposalId: db.tables.proposal.getDeterministicId(transaction, 0),
				membershipId: submitterMembershipId,
				comment: asset.campaignComment,
				likes: [],
				dislikes: [],
				created: BigInt(created)
			}
			const commentId = await db.tables.campaignComment.createRecord(stateStore,
				transaction, proposalCampaignComment, new RowContext());
			proposalComments.push(commentId)
		}

		const windowOpen = created + Number(provision.campaigning) * 60
		const windowClosed = windowOpen + Number(provision.votingWindow) * 60

		const invitationMessage = asset.invitationMessage ? asset.invitationMessage : "Join us"

		const membershipInvitationArguments: MembershipInvitationArguments = {
			accountId: asset.accountIdToInvite,
			message: invitationMessage
		}

		const binaryVoteResult: BinaryVoteResult = {
			result: ProposalResult.UNDECIDED,
			memberCount: 0,
			acceptedCount: 0,
			refusedCount: 0,
			decided: BigInt(0)
		}
		
		const multiChoiceCount: MultiChoiceCount = {
			answer: "",
			count: 0
		}

		const multiChoicePollArguments: MultiChoicePollArguments = {
			question: "",
			answers: [
				multiChoiceCount
			]
		}

		const multiChoiceVoteResult: MultiChoiceVoteResult = {
			memberCount: 0,
		}

		// Creating proposal
		const proposal: Proposal = {
			title: asset.title,
			status: ProposalStatus.CAMPAIGNING,
			actions: [],
			type: ProposalType.MEMBERSHIP_INVITATION,
			membershipId: submitterMembershipId,
			provisionId: provisionId,
			autonId: asset.autonId,
			comments: proposalComments,
			votes: [],
			transaction: transaction.id.toString('hex'),
			created: BigInt(created),
			windowOpen: BigInt(windowOpen),
			windowClosed: BigInt(windowClosed),
			binaryVoteResult: binaryVoteResult,
			membershipInvitationArguments: membershipInvitationArguments,
			multiChoiceVoteResult: multiChoiceVoteResult,
			multiChoicePollArguments: multiChoicePollArguments
		}

		const proposalId = await db.tables.proposal.createRecord(stateStore, transaction, proposal, new RowContext());

		// Setting scheduling
		const index = await db.indices.scheduledProposal.getRecord(stateStore, "current");
		if (index !== null) {
			if (index.data === undefined) {
			} else {
			}
			index.data.push({ id: proposalId, scheduled: BigInt(windowOpen) })
			await db.indices.scheduledProposal.setRecord(stateStore, "current", index);


		} else {
			const newIndex = { data: [{ id: proposalId, scheduled: BigInt(windowOpen) }] }
			await db.indices.scheduledProposal.setRecord(stateStore, "current", newIndex);
		}


		// Setting reference in auton
		auton.proposals.push(proposalId);
		await db.tables.auton.updateRecord(stateStore, asset.autonId, auton)

		// Setting reference in membership
		if (membershipCheck.membership != null && membershipCheck.membershipId != null) {
			membershipCheck.membership.proposals.push(proposalId);
			await db.tables.membership.updateRecord(stateStore, membershipCheck.membershipId, membershipCheck.membership)
		}

	}
}
