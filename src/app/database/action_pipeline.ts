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
import { AutonCreationActions } from "./action/auton_creation_actions";
import { MembershipInvitationAction } from "./action/membership_invitation_actions";
import { BaseAction } from "./base_action";
import { ProposalResult } from "./enums";
import { Auton } from "./table/auton_table";
import { ProposalProvisions } from "./table/proposal_provisions_table";
import { Proposal, } from "./table/proposal_table";

const actionRegister: Array<BaseAction<Promise<void>>> = [new MembershipInvitationAction(), new AutonCreationActions()]

export const process = async function (proposalResult: ProposalResult, proposalId: string, proposal: Proposal,
    provision: ProposalProvisions, auton: Auton,
    _input: AfterBlockApplyContext) {
    for (let index = 0; index < actionRegister.length; index++) {
        const actionClass = actionRegister[index];
        if (actionClass.proposalType == proposal.type) {
            try {
                await actionClass.process(proposalResult, proposalId, proposal,
                    provision, auton, _input)
            } catch (error) {
                console.log("ERROR: ACTION COULD NOT BE EXECUTED")
                console.log(error)
            }

        }
    }
}