import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { emptyBinaryVoteResult, emptyMembershipInvitationArguments, emptyMultiChoicePollArguments, emptyMultiChoiceVoteResult } from '../../../database/empty_proposal_variables';
import { MembershipValidationError, ProposalStatus, ProposalType } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { ProposalCampaignComment } from '../../../database/table/proposal_campaign_comment_table';
import { ProposalProvisions } from '../../../database/table/proposal_provisions_table';
import { OptionProperties, Proposal, QuestionnaireArguments, QuestionTypeArguments } from '../../../database/table/proposal_table';
import { AutonNotFoundError } from '../../../exceptions/auton/AutonNotFoundError';
import { KalipoAccountNotFoundError } from '../../../exceptions/kalipoAccount/KalipoAccountNotFoundError';
import { MembershipInvitationStillOpenError } from '../../../exceptions/membership/MembershipInvitationStillOpenError';
import { MembershipNotActiveError } from '../../../exceptions/membership/MembershipNotActiveError';
import { ProposalTypeNoProvisionError } from '../../../exceptions/provision/ProposalTypeNoProvisionError';
import { ProvisionNotConstitutionalisedError } from '../../../exceptions/provision/ProvisionNotConstitutionalisedError';
import { ProvisionNotFoundError } from '../../../exceptions/provision/ProvisionNotFoundError';

export class QuestionnaireAsset extends BaseAsset {
	public name = 'questionnaire';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'proposal/questionnaire-asset',
		title: 'QuestionnaireAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId", "content"],
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
			content: {
				type: 'array',
				fieldNumber: 5,
				items: {
					type: "object",
					required: ["question", "options"],
					properties: {
						question: {
							dataType: 'string',
							fieldNumber: 1,
						},
						options: {
							type: 'array',
							fieldNumber: 2,
							maxItems: 4,
							items: {
								dataType: 'string'
							}
						}
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
		const TYPE = ProposalType.QUESTIONNAIRE
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

		const questionTypeArguments: Array<QuestionTypeArguments> = [];
		console.log("0")

		for (let index = 0; index < asset.content.length; index++) {
			const options: Array<OptionProperties> = [];
			console.log("1")
			for (let index2 = 0; index2 < asset.content[index].options.length; index2++) {
				console.log("2")
				const optionProperties: OptionProperties = {
					option: asset.content[index].options[index2],
					count: 0
				}

				options.push(optionProperties);
			}

			const questionTypeArgument: QuestionTypeArguments = {
				question: asset.content[index].question,
				options: options
			}

			questionTypeArguments.push(questionTypeArgument);
		}

		const questionnaireArguments: QuestionnaireArguments = {
			content: questionTypeArguments
		}
		console.log("3")
		// Creating proposal
		const proposal: Proposal = {
			title: asset.title,
			status: ProposalStatus.CAMPAIGNING,
			actions: [],
			type: ProposalType.QUESTIONNAIRE,
			membershipId: submitterMembershipId,
			provisionId: provisionId,
			autonId: asset.autonId,
			comments: proposalComments,
			votes: [],
			transaction: transaction.id.toString('hex'),
			created: BigInt(created),
			windowOpen: BigInt(windowOpen),
			windowClosed: BigInt(windowClosed),
			binaryVoteResult: emptyBinaryVoteResult,
			membershipInvitationArguments: emptyMembershipInvitationArguments,
			multiChoiceVoteResult: emptyMultiChoiceVoteResult,
			multiChoicePollArguments: emptyMultiChoicePollArguments,
			questionnaireArguments: questionnaireArguments
		}
		console.log(proposal)

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
