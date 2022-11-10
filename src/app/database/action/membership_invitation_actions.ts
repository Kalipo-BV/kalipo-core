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

import { AfterBlockApplyContext } from "lisk-sdk";
import { VALID_INVITATION_WINDOW } from "../../modules/membership/membership_module";
import { BaseAction } from "../base_action";
import { db } from "../db";
import { ProposalResult, ProposalType } from "../enums";
import { Auton } from "../table/auton_table";
import { Membership, MembershipInvitation } from "../table/membership_table";
import { ProposalProvisions } from "../table/proposal_provisions_table";
import { Proposal } from "../table/proposal_table";

export class MembershipInvitationAction extends BaseAction<Promise<void>> {
    public proposalType = ProposalType.MEMBERSHIP_INVITATION;

    public async process(proposalResult: ProposalResult, proposalId: string, proposal: Proposal,
        provision: ProposalProvisions, auton: Auton,
        _input: AfterBlockApplyContext): Promise<void> {

        if (proposalResult == ProposalResult.ACCEPTED) {
            const newMembershipInvitation: MembershipInvitation = {
                validStart: BigInt(_input.block.header.timestamp),
                validEnd: BigInt(_input.block.header.timestamp + VALID_INVITATION_WINDOW),
                accepted: BigInt(0),
                refused: BigInt(0),
                proposalId: proposalId,
                message: proposal.membershipInvitationArguments.message
            }
            const newMembership: Membership = {
                started: BigInt(0),
                accountId: proposal.membershipInvitationArguments.accountId,
                autonId: proposal.autonId,
                invitation: newMembershipInvitation,
                votes: [],
                comments: [],
                commentLikes: [],
                commentDislikes: [],
                proposals: []
            }

            const membershipId = await db.tables.membership.createRecordLifeCycleWay(_input.stateStore, _input.block, newMembership)

            const invitedUser = await db.tables.kalipoAccount.getRecord(_input.stateStore, proposal.membershipInvitationArguments.accountId)
            invitedUser?.memberships.push(membershipId)
            await db.tables.kalipoAccount.updateRecord(_input.stateStore, proposal.membershipInvitationArguments.accountId, invitedUser)

            auton.memberships.push(membershipId);
            await db.tables.auton.updateRecord(_input.stateStore, proposal.autonId, auton)

            proposal.actions.push({
                executed: BigInt(_input.block.header.timestamp),
                resultMessage: invitedUser?.name + " is invited"
            });
            await db.tables.proposal.updateRecord(_input.stateStore, proposalId, proposal);
        }
    }
}