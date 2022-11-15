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

import { Schema, StateStore } from "lisk-sdk";
import { BaseTable } from "../base_table";
import { db } from "../db";
import { MembershipValidationError } from "../enums";
import { RoleEnum } from "../enums";
import { KalipoAccount } from "./kalipo_account_table";

export interface MembershipInvitation {
    validStart: BigInt,
    validEnd: BigInt,
    accepted: BigInt,
    refused: BigInt,
    proposalId: string,
    message: string
}

export interface Membership {
    started: BigInt,
    accountId: string,
    autonId: string,
    invitation: MembershipInvitation,
    votes: Array<string>,
    comments: Array<string>,
    commentLikes: Array<string>,
    commentDislikes: Array<string>,
    proposals: Array<string>,
    roles: Array<RoleEnum>,
    poasIssued: Array<string>,
}

export interface MembershipValidation {
    error: MembershipValidationError,
    membershipId: string | null,
    membership: Membership | null,
}

export class MembershipTable extends BaseTable<Membership> {
    public prefix: string = "table:membership";
    protected schema: Schema = {
        $id: "kalipo/tables/membership_table",
        type: "object",
        required: ["started", "accountId", "autonId"],
        properties: {
            started: {
                dataType: 'uint64',
                fieldNumber: 1
            },
            accountId: {
                dataType: 'string',
                fieldNumber: 2
            },
            autonId: {
                dataType: "string",
                fieldNumber: 3
            },
            invitation: {
                type: "object",
                required: ["validStart", "validEnd", "proposalId"],
                fieldNumber: 4,
                properties: {
                    validStart: {
                        dataType: 'uint64',
                        fieldNumber: 1
                    },
                    validEnd: {
                        dataType: 'uint64',
                        fieldNumber: 2
                    },
                    accepted: {
                        dataType: 'uint64',
                        fieldNumber: 3
                    },
                    refused: {
                        dataType: 'uint64',
                        fieldNumber: 4
                    },
                    proposalId: {
                        dataType: 'string',
                        fieldNumber: 5
                    },
                    message: {
                        dataType: 'string',
                        fieldNumber: 6
                    }
                }
            },
            votes: {
                type: "array",
                fieldNumber: 5,
                items: {
                    dataType: "string",
                }
            },
            comments: {
                type: "array",
                fieldNumber: 6,
                items: {
                    dataType: "string",
                }
            },
            commentLikes: {
                type: "array",
                fieldNumber: 7,
                items: {
                    dataType: "string",
                }
            },
            commentDislikes: {
                type: "array",
                fieldNumber: 8,
                items: {
                    dataType: "string",
                }
            },
            proposals: {
                type: "array",
                fieldNumber: 9,
                items: {
                    dataType: "string",
                }
            },
            roles: {
                type: "array",
                fieldNumber: 10,
                items: {
                    dataType: "string",
                }
            },
            poasIssued: {
                type: "array",
                fieldNumber: 11,
                items: {
                    dataType: "string",
                }
            },
        }
    }

    public async validateMembership(kalipoAccount: KalipoAccount | null, autonId: string, stateStore: StateStore): Promise<MembershipValidation> {
        let submitterMembershipId: string | null = null
        let submitterMembership: Membership | null = null
        if (kalipoAccount !== null) {
            let isFullMember: boolean = false;
            for (let index = 0; index < kalipoAccount.memberships.length; index++) {
                const membershipId = kalipoAccount.memberships[index];
                const membership = await db.tables.membership.getRecord(stateStore, membershipId)

                const now = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)

                // TODO: Need to add 'ended check' when users can exit an auton 
                if (membership !== null && membership.autonId == autonId && membership.started != BigInt(0) && membership.started <= now) {
                    isFullMember = true;
                    submitterMembershipId = membershipId
                    submitterMembership = membership
                    break;
                } else if (membership !== null && membership.autonId == autonId
                    && membership.invitation.accepted == BigInt(0)
                    && membership.invitation.refused == BigInt(0)
                    && now >= membership.invitation.validStart && now < membership.invitation.validEnd) {
                    return { error: MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED, membershipId: null, membership: null }
                }
            }

            if (!isFullMember) {
                return { error: MembershipValidationError.NO_ACTIVE_MEMBERSHIP, membershipId: null, membership: null }
            } else {
                // Success
                return { error: MembershipValidationError.NO_ERROR, membershipId: submitterMembershipId, membership: submitterMembership }
            }
        } else {
            return { error: MembershipValidationError.ACCOUNT_NOT_FOUND, membershipId: null, membership: null }
        }
    }

}