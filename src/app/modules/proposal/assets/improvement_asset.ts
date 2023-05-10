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
import { BinaryVoteResult, ImprovementArguments, Proposal } from '../../../database/table/proposal_table';

export class ImprovementAsset extends BaseAsset {
	public name = 'Improvement';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'proposal/Improvement-asset',
		title: 'ImprovementAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId"],
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
			proposers: {
				type: "array",
				fieldNumber: 5,
				maxItems: 5,
				items: {
					dataType: "string"
				}
			},
			abstract: {
				dataType: 'string',
				fieldNumber: 6,
				maxLength: 512,
			},
			motivation: {
				dataType: 'string',
				fieldNumber: 7,
				maxLength: 2048,
			},
			specification: {
				dataType: 'string',
				fieldNumber: 8,
				maxLength: 2048,
			},
			references: {
				dataType: 'string',
				fieldNumber: 9,
				maxLength: 512,
			},
			budget: {
				dataType: 'string',
				fieldNumber: 10,
				maxLength: 512,
			},
			executionRoles: {
				dataType: 'string',
				fieldNumber: 11,
				maxLength: 512,
			},
			timeBasedConstraint: {
				dataType: 'string',
				fieldNumber: 12,
				maxLength: 512,
			},
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		console.log("Ik ben in de backend.")
		console.log(asset.timeBasedConstraint);
		const TYPE = ProposalType.IMPROVEMENT
		//  Get latest provision for auton by proposal type membership-invtitation
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// Auton
		const auton = await db.tables.auton.getRecord(stateStore, asset.autonId)
		if (auton == null) {
			throw new Error("The auton cannot be found")
		}

		// Membership
		const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, asset.autonId, stateStore);
		const submitterMembershipId: string | null = membershipCheck.membershipId

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new Error("No Kalipo account found")
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new Error("You need a membership to submit new proposals")
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new Error("You aren't member yet, you still need to accept the invitation")
		}

		// Provisions
		let provisionId: string | null = null;
		let provision: ProposalProvisions | null = null;
		for (let index = 0; index < auton.constitution.length; index++) {
			const proposalType = auton.constitution[index];
			if (proposalType.type == TYPE) {
				console.log("TYPE FOUND")
				if (proposalType.provisions.length > 0) {
					console.log("LENGTH: " + proposalType.provisions.length)
					const lastProvisionId = proposalType.provisions[proposalType.provisions.length - 1]
					const provisionResult = await db.tables.provisions.getRecord(stateStore, lastProvisionId)
					console.log(provisionResult)
					if (provisionResult !== null) {
						provision = provisionResult
						provisionId = lastProvisionId
						break;
					} else {
						throw new Error("Provision not found")
					}

				} else {
					throw new Error("This type has been constitutionalised but is not yet provisioned. Submit a bill to create the first provisions.")
				}
			}
		}

		if (provision == null) {
			throw new Error("This type has not been constitutionalised")
		}

		// Haal de tijd op wanneer die gecreerd is.
		const created = stateStore.chain.lastBlockHeaders[0].timestamp

		// Comments
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

		// Set time for beginning voting and ending voting.
		const windowOpen = created + Number(provision.campaigning) * 60
		const windowClosed = windowOpen + Number(provision.votingWindow) * 60

		console.log("Voor het definiëren van de ImproveArguments.")

		const improvementArguments: ImprovementArguments = {
			proposers: asset.proposers,
			abstract: asset.abstract,
			motivation: asset.motivation,             
			specification: asset.specification,
			references: asset.references,
			budget: asset.budget,
			executionRoles: asset.executionRoles,
			timeBasedConstraint: asset.timeBasedConstraint,       
		}

		console.log("Na het definiëren van de ImproveArguments.")

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
			type: TYPE,
			membershipId: submitterMembershipId,
			provisionId: provisionId,
			autonId: asset.autonId,
			comments: proposalComments,
			votes: [],
			transaction: transaction.id.toString('hex'),
			created: BigInt(created),
			windowOpen: BigInt(windowOpen),
			windowClosed: BigInt(windowClosed),
			membershipInvitationArguments: {
				accountId: "",
				message: ""
			},
			improvementArguments: improvementArguments,
			binaryVoteResult: binaryVoteResult
		}

		console.log("proposal")
		console.log(proposal)
		console.log("In Improvement asset.ts "+ proposal.improvementArguments?.abstract)

		


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
