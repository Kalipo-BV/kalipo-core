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
import { BinaryVoteResult, MembershipInvitationArguments, Proposal } from '../../../database/table/proposal_table';

export class AutonCreationAsset extends BaseAsset {
	public name = 'autonCreation';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'proposal/autonCreation-asset',
		title: 'AutonCreationAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId", "autonCreationArguments"],
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
			autonCreationArguments: {
				fieldNumber: 5,
				type: 'object',
				required: ["name", "type"],
				properties: {
					name: {
						dataType: 'string',
						fieldNumber: 1,
						minLength: 2,
						maxLength: 20
					},
					subtitle: {
						dataType: 'string',
						fieldNumber: 2,
						maxLength: 50
					},
					icon: {
						dataType: 'string',
						fieldNumber: 3,
						maxLength: 50
					},
					mission: {
						dataType: 'string',
						fieldNumber: 4,
						maxLength: 1024
					},
					vision: {
						dataType: 'string',
						fieldNumber: 5,
						maxLength: 1024
					},
					tags: {
						type: "array",
						fieldNumber: 6,
						maxItems: 5,
						items: {
							dataType: "string",
							maxLength: 16
						}
					},
					bulkInviteAccountIds: {
						type: "array",
						fieldNumber: 7,
						maxItems: 25,
						items: {
							dataType: "string",
							maxLength: 128
						}
					},
					type: {
						dataType: 'string',
						fieldNumber: 8,
					}
				},
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const TYPE = ProposalType.AUTON_CREATION;
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

		// Auton name availability

		const alreadyRegisteredAuton = await db.indices.autonName.getRecord(stateStore, asset.autonCreationArguments.name);
		if (alreadyRegisteredAuton !== null) {
			throw new Error("Oops this auton name is already taken")
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
			type: ProposalType.AUTON_CREATION,
			membershipId: submitterMembershipId,
			provisionId: provisionId,
			autonId: asset.autonId,
			comments: proposalComments,
			votes: [],
			transaction: transaction.id.toString('hex'),
			created: BigInt(created),
			windowOpen: BigInt(windowOpen),
			windowClosed: BigInt(windowClosed),
			membershipInvitationArguments: { accountId: "", message: "" },
			autonCreationArguments: asset.autonCreationArguments,
			binaryVoteResult: binaryVoteResult
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
