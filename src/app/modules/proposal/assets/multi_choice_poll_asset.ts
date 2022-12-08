import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { MembershipValidationError, ProposalResult, ProposalStatus, ProposalType } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { ProposalCampaignComment } from '../../../database/table/proposal_campaign_comment_table';
import { ProposalProvisions } from '../../../database/table/proposal_provisions_table';
import { BinaryVoteResult, MembershipInvitationArguments, MultiChoiceCount, MultiChoicePollArguments, MultiChoiceVoteResult, Proposal } from '../../../database/table/proposal_table';
import { AutonNotFoundError } from '../../../exceptions/auton/AutonNotFoundError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { MembershipInvitationStillOpenError } from '../../../exceptions/membership/MembershipInvitationStillOpenError';
import { MembershipNotActiveError } from '../../../exceptions/membership/MembershipNotActiveError';
import { ProposalTypeNoProvisionError } from '../../../exceptions/provision/ProposalTypeNoProvisionError';
import { ProvisionNotConstitutionalisedError } from '../../../exceptions/provision/ProvisionNotConstitutionalisedError';
import { ProvisionNotFoundError } from '../../../exceptions/provision/ProvisionNotFoundError';

export class MultiChoicePollAsset extends BaseAsset {
	public name = 'MultiChoicePoll';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'proposal/MultiChoicePoll-asset',
		title: 'MultiChoicePollAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId", "question", "answers"],
		properties: {
			title: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 1,
				maxLength: 100,
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
			question: {
				dataType: 'string',
				fieldNumber: 5,
			},
			answers: {
				type: 'array',
				fieldNumber: 6,
				maxItems: 4,
				items: {
					dataType: 'string'
				}
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const TYPE = ProposalType.MULTI_CHOICE_POLL
		//  Get latest provision for auton by proposal type membership-invtitation
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id
		if (accountId == null) {
			throw new KalipoAccountNotFoundError();
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
			throw new ProvisionNotConstitutionalisedError();
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

		const answersObjects: Array<MultiChoiceCount> = [];
		for (let index = 0; index < asset.answers.length; index++) {
			const multiChoiceCount: MultiChoiceCount = {
				answer: asset.answers[index],
				count: 0
			}
			answersObjects.push(multiChoiceCount);
		}

		const multiChoicePollArguments: MultiChoicePollArguments = {
			question: asset.question,
			answers: answersObjects
		}

		const multiChoiceVoteResult: MultiChoiceVoteResult = {
			memberCount: 0,
		}

		const membershipInvitationArguments: MembershipInvitationArguments = {
			accountId: "",
			message: ""
		}

		const binaryVoteResult: BinaryVoteResult = {
			result: ProposalResult.UNDECIDED,
			memberCount: 0,
			acceptedCount: 0,
			refusedCount: 0,
			decided: BigInt(0)
		}

		// Creating proposal
		const proposal: Proposal = {
			title: asset.title,
			status: ProposalStatus.CAMPAIGNING,
			actions: [],
			type: ProposalType.MULTI_CHOICE_POLL,
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
