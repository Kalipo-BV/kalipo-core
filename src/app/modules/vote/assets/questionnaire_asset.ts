import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { MembershipInvitationAction } from '../../../database/action/membership_invitation_actions';
import { db } from '../../../database/db';
import { ProposalStatus, MembershipValidationError } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { Membership } from '../../../database/table/membership_table';
import { Vote } from '../../../database/table/vote_table';
import { AutonNotFoundError } from '../../../exceptions/auton/AutonNotFoundError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { MembershipNotActiveError } from '../../../exceptions/membership/MembershipNotActiveError';
import { ProposalClosedError } from '../../../exceptions/proposal/ProposalClosedError';
import { ProposalNewVotesBlockedError } from '../../../exceptions/proposal/ProposalNewVotesBlockedError';
import { ProposalNotFoundError } from '../../../exceptions/proposal/ProposalNotFoundError';
import { ProposalNotOpenedError } from '../../../exceptions/proposal/ProposalNotOpenedError';
import { ProposalQuestionnaireArgumentsUndefinedError } from '../../../exceptions/proposal/ProposalQuestionnaireArgumentsUndefinedError';
import { AlreadyVotedError } from '../../../exceptions/vote/AlreadyVotedError';

export class QuestionnaireAsset extends BaseAsset {
	public name = 'questionnaire';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'vote/questionnaire-asset',
		title: 'QuestionnaireAsset transaction asset for vote module',
		type: 'object',
		equired: ["proposalId", "answer"],
		properties: {
			proposalId: {
				dataType: 'string',
				fieldNumber: 1,
			},
			answer: {
				type: 'array',
				fieldNumber: 2,
				items: {
					type: 'array',
					fieldNumber: 1,
					items: {
						dataType: 'string'
					}
				}
			},
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const now = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)
		const senderAddress = transaction.senderAddress;

		// Controleer of answer voorkomt in de argumenten van Proposal
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

		if (proposal.questionnaireArguments?.content == undefined) {
			throw new ProposalQuestionnaireArgumentsUndefinedError();
		}

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

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
			throw new MembershipInvitationAction();
		}

		// Votes
		// loop to check if member has voted
		for (let index = 0; index < proposal.votes.length; index++) {
			const voteId = proposal.votes[index];
			const otherVote = await db.tables.vote.getRecord(stateStore, voteId)
			if (otherVote?.membershipId == membershipId) {
				throw new AlreadyVotedError(otherVote?.answer[0][0])
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

		for (let index = 0; index < proposal.questionnaireArguments.content.length; index++) {
			for (let index2 = 0; index < proposal.questionnaireArguments.content[index].options.length; index++) {
				if (asset.answer[index][index2] == proposal.questionnaireArguments.content[index].options[index2].option) {
					proposal.questionnaireArguments.content[index].options[index2].count++
				}
			}
		}

		await db.tables.proposal.updateRecord(stateStore, asset.proposalId, proposal);
		proposal.votes.push(voteId);

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
