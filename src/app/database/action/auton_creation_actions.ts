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
import { AutonTypeEnum, checkStatus, ProposalResult, ProposalType, RoleEnum } from "../enums";
import { RowContext } from "../row_context";
import { Auton, ProposalTypeConstitution } from "../table/auton_table";
import { KalipoAccount } from "../table/kalipo_account_table";
import { Membership, MembershipInvitation } from "../table/membership_table";
import { ProposalProvisions } from "../table/proposal_provisions_table";
import { Proposal } from "../table/proposal_table";
import { templates } from "../templates";

export class AutonCreationActions extends BaseAction<Promise<void>> {
    public proposalType = ProposalType.AUTON_CREATION;

    public async process(proposalResult: ProposalResult, proposalId: string, proposal: Proposal,
        provision: ProposalProvisions, auton: Auton,
        _input: AfterBlockApplyContext): Promise<void> {

        if (proposalResult == ProposalResult.ACCEPTED) {
            // Auton creation
            const alreadyRegisteredAuton = await db.indices.autonName.getRecord(_input.stateStore, proposal.autonCreationArguments.name);
            if (alreadyRegisteredAuton !== null) {
                throw new Error("Oops this auton name is already taken")
            }
            // Get bulk kalipoAccounts to check if they exists
            const bulkAccounts: Array<KalipoAccount> = [];
            const bulkAccountsCheckList: Array<string> = [];
            let multipleInvitesToSameAccount = false;
            if (proposal.autonCreationArguments.bulkInviteAccountIds !== undefined) {
                for (let index = 0; index < proposal.autonCreationArguments.bulkInviteAccountIds.length; index++) {
                    const id = proposal.autonCreationArguments.bulkInviteAccountIds[index];
                    if (bulkAccountsCheckList.indexOf(id) == -1) {
                        bulkAccountsCheckList.push(id)
                    } else {
                        multipleInvitesToSameAccount = true;
                        break;
                    }

                    const acc: KalipoAccount | null = await db.tables.kalipoAccount.getRecord(_input.stateStore, id)
                    if (acc !== null) {
                        acc.id = id;
                        bulkAccounts.push(acc)
                    }

                }
            }

            if (multipleInvitesToSameAccount) {
                throw new Error("Cannot send multiple invites to the same account")
            }

            // // Founder membership is automaticly set as accepted
            // const membershipInvitation: MembershipInvitation = {
            //     validStart: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp),
            //     validEnd: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
            //     accepted: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp),
            //     refused: BigInt(0),
            //     proposalId: "Founder invitation",
            //     message: "Founder"
            // }

            // const membership: Membership = {
            //     started: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp),
            //     accountId: accountId,
            //     autonId: db.tables.auton.getDeterministicId(transaction, 0),
            //     invitation: membershipInvitation,
            //     votes: [],
            //     comments: [],
            //     commentLikes: [],
            //     commentDislikes: [],
            //     proposals: [],
            //     role: RoleEnum.FULL_MEMBER,
            //     checkedStatus: checkStatus.CHECKEDIN,
            //     poasIssued: []
            // }

            // Setting row contexts for each id for the total amount of accounts 
            const memberships: Array<string> = [];
            for (let index = 0; index < bulkAccounts.length; index++) {
                memberships.push(db.tables.membership.getDeterministicIdLifeCycleWay(_input.block, index));
            }

            // Create current proposal types
            // Set template...	
            // const constitution: Array<ProposalTypeConstitution> = []
            // for (let index = 0; index < templates.starter.length; index++) {
            //     const provisions = templates.starter[index];
            //     const id = await db.tables.provisions.createRecordLifeCycleWay(_input.stateStore, _input.block, provisions)
            //     const porposalType: ProposalTypeConstitution = { type: provisions.type, provisions: [id] }
            //     constitution.push(porposalType)
            // }

            const autonToCreate: Auton = {
                memberships: memberships,
                autonProfile: {
                    name: proposal.autonCreationArguments.name,
                    subtitle: proposal.autonCreationArguments.subtitle,
                    icon: proposal.autonCreationArguments.icon,
                    mission: proposal.autonCreationArguments.mission,
                    vision: proposal.autonCreationArguments.vision,
                    foundingDate: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp),

                },
                tags: proposal.autonCreationArguments.tags,

                constitution: auton.constitution,
                proposals: [],
                transaction: proposal.transaction,
                type: AutonTypeEnum[proposal.autonCreationArguments.type],
                poas: [],
                event: {},
                lesson: {},
                daoId: auton.daoId,
                parentAutonId: proposal.autonId
            };

            const autonId: string = await db.tables.auton.createRecordLifeCycleWay(_input.stateStore, _input.block, autonToCreate)

            await db.indices.autonName.setRecord(_input.stateStore, proposal.autonCreationArguments.name, { id: autonId })

            let allAutonIds = await db.indices.fullTable.getRecord(_input.stateStore, "autons");

            if (allAutonIds == null) {
                const index = { ids: [autonId] }
                await db.indices.fullTable.setRecord(_input.stateStore, "autons", index)
            } else {
                allAutonIds.ids.push(autonId)
                await db.indices.fullTable.setRecord(_input.stateStore, "autons", allAutonIds)
            }

            for (let index = 0; index < proposal.autonCreationArguments.tags.length; index++) {
                const tag: string = proposal.autonCreationArguments.tags[index];
                const currentIndexState = await db.indices.autonTag.getRecord(_input.stateStore, tag)
                if (currentIndexState !== null) {
                    currentIndexState?.ids.push(autonId)
                    await db.indices.autonTag.setRecord(_input.stateStore, tag, currentIndexState)
                } else {
                    await db.indices.autonTag.setRecord(_input.stateStore, tag, { ids: [autonId] })
                }
            }

            // Bulk invite
            for (let index = 0; index < bulkAccounts.length; index++) {
                const bulkKalipoAccount = bulkAccounts[index];
                if (bulkKalipoAccount !== null) {

                    let bulkMembershipInvitation: MembershipInvitation = {
                        validStart: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp),
                        validEnd: BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
                        accepted: BigInt(0),
                        refused: BigInt(0),
                        proposalId: "Founder invitation",
                        message: "Founder"
                    };

                    if (proposal.autonCreationArguments.type == AutonTypeEnum.LESSON) {
                        bulkMembershipInvitation.accepted = BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp)
                    }

                    let bulkMembership: Membership = {
                        started: BigInt(0),
                        accountId: bulkKalipoAccount.id,
                        autonId: autonId,
                        invitation: bulkMembershipInvitation,
                        votes: [],
                        comments: [],
                        commentLikes: [],
                        commentDislikes: [],
                        proposals: [],
                        role: RoleEnum.FULL_MEMBER,
                        checkedStatus: checkStatus.CHECKEDIN,
                        poasIssued: []
                    };

                    if (proposal.autonCreationArguments.type == AutonTypeEnum.LESSON) {
                        bulkMembership.started = BigInt(_input.stateStore.chain.lastBlockHeaders[0].timestamp)
                    }

                    console.log("Big 5.1")

                    const membershipId: string = await db.tables.membership.createRecordLifeCycleWay(_input.stateStore, _input.block, bulkMembership)
                    console.log("Big 5.2")
                    bulkKalipoAccount.memberships.push(membershipId)

                    await db.tables.kalipoAccount.updateRecord(_input.stateStore, bulkKalipoAccount.id, bulkKalipoAccount)
                }
            }

            // Action message
            proposal.actions.push({
                executed: BigInt(_input.block.header.timestamp),
                resultMessage: "Users are invited"
            });
            await db.tables.proposal.updateRecord(_input.stateStore, proposalId, proposal);
        }
    }
}