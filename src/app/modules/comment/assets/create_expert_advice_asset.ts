import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { Schema } from "lisk-sdk";
import { BaseTable } from "../base_table";
import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { ProposalStatus, MembershipValidationError } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { Membership } from '../../../database/table/membership_table';
import { ProposalCampaignComment } from '../../../database/table/proposal_campaign_comment_table';

export interface Stakeholders{
    stakeholderId: string,
    expertise: string,
    advice: string,
    opinion: string
}

export class CreateExpertAdviceAsset extends BaseAsset {
	public name = 'createExpertAdvice';
  public id = 1;

  // Define schema for asset
	public schema = {
    $id: 'comment/createExpertAdvice-asset',
		title: 'CreateExpertAdviceAsset transaction asset for comment module',
		type: 'object',
		required: ["proposalId", "stakeholderId", "advice", "opinion"],
		properties: {
			//uitleg over advies
			proposalId:{
				dataType: 'string',
				fieldNumber: 1

			},
			stakeholderId:{
				dataType:"string",
				fieldNumber: 2
			},

			advice:{
				dataType: 'string',
				fieldNumber: 3,
				maxLength: 1024
			},
			//agree, disagree, neutral expert advice
			opinion: {
				dataType: 'string',
				fieldNumber: 4,
				
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

	
	const comment: Stakeholders = {
		stakeholderId: asset.stakeholderId,
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
