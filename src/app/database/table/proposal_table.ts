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

import { Schema } from "lisk-sdk";
import { BaseTable } from "../base_table";
import { ProposalResult, ProposalStatus, ProposalType } from "../enums";

export interface MembershipInvitationArguments {
    accountId: string,
    message: string
}


export interface ImprovementArguments {
    proposers: Array<string>,           //List of persons who are directly involved in the proposal.
    abstract: string,                   //Summary of the idea of the proposal.
    motivation: string,             
    specification: string,
    references?: string,                //Extra information like links, citations ...
    budget?: string,                    //Explanation of the budget.
    executionRoles?: Array<String>,    //Persons who excecute the proposal, example: 'id; role' -> '1; developer'.
    timeBasedConstraint?: string,       //Information about for example deadline...
    
    /* should have ↓ */ 
    // additionalHeaders?: Array<String>,  //The submitter can add extra headers if needed.
}

export interface BinaryVoteResult {
    result: ProposalResult,
    decided: BigInt,
    memberCount: number,
    acceptedCount: number,
    refusedCount: number
}

export interface ProposalAction {
    executed: BigInt,
    resultMessage: string,
}

export interface Proposal {
    title: string,
    status: ProposalStatus,
    actions: Array<ProposalAction>,
    type: ProposalType,
    membershipId: string,
    provisionId: string,
    autonId: string,
    comments: Array<string>,
    votes: Array<string>,
    transaction: string,
    created: BigInt,
    windowOpen: BigInt,
    windowClosed: BigInt,
    binaryVoteResult: BinaryVoteResult,
    membershipInvitationArguments: MembershipInvitationArguments | null,
    improvementArguments: ImprovementArguments | null
}

export class ProposalTable extends BaseTable<Proposal> {
    public prefix: string = "table:proposal";
    protected schema: Schema = {
        $id: "kalipo/tables/proposal_table",
        type: "object",
        required: ["title", "status", "actions", "type", "membershipId", "provisionId", "autonId", "comments", "votes", "transaction", "created", "windowOpen", "windowClosed", "binaryVoteResult"],
        properties: {
            title: {
                dataType: 'string',
                fieldNumber: 1,
            },
            status: {
                dataType: 'string',
                fieldNumber: 2,
            },
            actions: {
                type: "array",
                fieldNumber: 3,
                items: {
                    type: "object",
                    required: ["executed", "resultMessage"],
                    properties: {
                        executed: {
                            dataType: "uint64",
                            fieldNumber: 1,
                        },
                        resultMessage: {
                            dataType: "string",
                            fieldNumber: 2,
                        },
                    }
                }
            },
            type: {
                dataType: 'string',
                fieldNumber: 4,
            },
            membershipId: {
                dataType: 'string',
                fieldNumber: 5,
            },
            provisionId: {
                dataType: 'string',
                fieldNumber: 6,
            },
            autonId: {
                dataType: 'string',
                fieldNumber: 7,
            },
            comments: {
                type: "array",
                fieldNumber: 8,
                items: {
                    dataType: "string",
                }
            },
            votes: {
                type: "array",
                fieldNumber: 9,
                items: {
                    dataType: "string",
                }
            },
            transaction: {
                dataType: 'string',
                fieldNumber: 10,
            },
            created: {
                dataType: 'uint64',
                fieldNumber: 11,
            },
            windowOpen: {
                dataType: 'uint64',
                fieldNumber: 12,
            },
            windowClosed: {
                dataType: 'uint64',
                fieldNumber: 13,
            },
            binaryVoteResult: {
                type: "object",
                fieldNumber: 14,
                required: ["result", "decided", "memberCount", "acceptedCount", "refusedCount"],
                properties: {
                    result: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    decided: {
                        dataType: "uint64",
                        fieldNumber: 2,
                    },
                    memberCount: {
                        dataType: "uint32",
                        fieldNumber: 3,
                    },
                    acceptedCount: {
                        dataType: "uint32",
                        fieldNumber: 4,
                    },
                    refusedCount: {
                        dataType: "uint32",
                        fieldNumber: 5,
                    },
                }
            },
            membershipInvitationArguments: {
                type: "object",
                fieldNumber: 15,
                required: ["accountId", "message"],
                properties: {
                    accountId: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    message: {
                        dataType: "string",
                        fieldNumber: 2,
                    },
                }
            },
            improvementArguments: {
                type: "object",
                fieldNumber: 16,
                                                                    //proposers horen ook nog bij required.
                required: ["abstract", "motivation", "specification"],
                properties: {
                    proposers: {
                        type: "array",
                        fieldNumber: 1,
                        items: {
                            dataType: "string"
                        }
                    },
                    abstract: {
                        dataType: 'string',
                        fieldNumber: 2
                    },
                    motivation: {
                        dataType: 'string',
                        fieldNumber: 3
                    },
                    specification: {
                        dataType: 'string',
                        fieldNumber: 4
                    },
                    references: {
                        dataType: 'string',
                        fieldNumber: 5
                    },
                    budget: {
                        dataType: 'string',
                        fieldNumber: 6
                    },
                    executionRoles: {
                        type: "array",
                        fieldNumber: 7,
                        items: {
                            dataType: "string"
                        }
                    },
                    timeBasedConstraint: {
                        dataType: 'string',
                        fieldNumber: 8
                    },
                }
            },
        }
    }

    public getSchema() {
        return this.schema;
    }

}

