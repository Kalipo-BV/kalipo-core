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


export class StakeholderVotingAsset extends BaseAsset{
    public name = "StakeholderVoting";
    public id = 2;

    //define schema for asset
    public schema = {
		$id: 'vote/stakeholderVoting-asset',
		title: 'StakeholderVoting transaction asset for vote module',
		type: 'object',
		required: ["proposalId", "answer"],
		properties: {
            proposalId:{
                dataType: 'string',
                fieldNumber: 1,
            },
            answer:{
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
		console.log(now)
		const senderAddress = transaction.senderAddress;

        //Kalipo account
        		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

        //Proposal
        const proposal = await db.tables.proposal.getRecord(stateStore, asset.proposalId)
		if (proposal == null) {
			throw new Error("The proposal cannot be found")
		}

		if (now < proposal.windowOpen) {
			throw new Error("The proposal has not been opened yet for voting")
		}

		if (now > proposal.windowClosed) {
			throw new Error("The proposal is closed and therefore does not accept new votes")
		}

		if (proposal.status != ProposalStatus.DECIDED && proposal.status != ProposalStatus.VOTING) {
			throw new Error("The current status does not allow new votes")
		}

        //Membership
        const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, proposal.autonId, stateStore);
		const membershipId: string | null = membershipCheck.membershipId
		const membership: Membership | null = membershipCheck.membership

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new Error("No Kalipo account found")
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new Error("You need a membership to vote on this proposal")
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new Error("You aren't member yet, you still need to accept the invitation")
		}

        //Votes
		for (let index = 0; index < proposal.votes.length; index++) {
			const voteId = proposal.votes[index];
			const otherVote = await db.tables.vote.getRecord(stateStore, voteId)
			if (otherVote?.membershipId == membershipId) {
				throw new Error("You already voted: " + otherVote?.answer)
			}
		}

        //Auton
        const auton = await db.tables.auton.getRecord(stateStore, proposal.autonId)
		if (auton == null) {
			throw new Error("The auton cannot be found")
		}

        //Place Vote
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