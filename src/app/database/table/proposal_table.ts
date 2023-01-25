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

export interface MultiChoicePollArguments {
    question: string,
    answers: Array<MultiChoiceCount>
}

export interface QuestionnaireArguments {
    content: Array<QuestionTypeArguments>
}

export interface QuestionTypeArguments {
    question: string,
    options: Array<OptionProperties>
}

export interface MultiChoiceCount {
    answer: string,
    count: number
}

export interface OptionProperties {
    option: string,
    count: number
}

export interface BinaryVoteResult {
    result: ProposalResult,
    decided: BigInt,
    memberCount: number,
    acceptedCount: number,
    refusedCount: number
}

export interface MultiChoiceVoteResult {
    memberCount: number,
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
    binaryVoteResult: BinaryVoteResult | null
    multiChoiceVoteResult: MultiChoiceVoteResult | null
    membershipInvitationArguments: MembershipInvitationArguments | null
    multiChoicePollArguments: MultiChoicePollArguments | null
    questionnaireArguments: QuestionnaireArguments | null
}

export class ProposalTable extends BaseTable<Proposal> {
    public prefix: string = "table:proposal";
    protected schema: Schema = {
        $id: "kalipo/tables/proposal_table",
        type: "object",
        required: ["title", "status", "actions", "type", "membershipId", "provisionId", "autonId", "comments", "votes", "transaction", "created", "windowOpen", "windowClosed"],
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
            multiChoiceVoteResult: {
                type: "object",
                fieldNumber: 16,
                required: ["memberCount"],
                properties: {
                    memberCount: {
                        dataType: "uint32",
                        fieldNumber: 1
                    }
                }
            },
            multiChoicePollArguments: {
                type: "object",
                fieldNumber: 17,
                required: ["question", "answers"],
                properties: {
                    question: {
                        dataType: 'string',
                        fieldNumber: 1,
                    },
                    answers: {
                        type: 'array',
                        fieldNumber: 2,
                        items: {
                            type: "object",
                            properties: {
                                answer: {
                                    dataType: 'string',
                                    fieldNumber: 1,
                                },
                                count: {
                                    dataType: 'uint64',
                                    fieldNumber: 2,
                                }
                            }
                        }
                    }
                }
            },
            questionnaireArguments: {
                type: "object",
                fieldNumber: 18,
                required: ["content"],
                properties: {
                    content: {
                        type: "array",
                        fieldNumber: 1,
                        items: {
                            type: "object",
                            required: ["question", "options"],
                            properties: {
                                question: {
                                    dataType: "string",
                                    fieldNumber: 1,
                                },
                                options: {
                                    type: "array",
                                    fieldNumber: 2,
                                    items: {
                                        type: "object",
                                        properties: {
                                            option: {
                                                dataType: 'string',
                                                fieldNumber: 1,
                                            },
                                            count: {
                                                dataType: 'uint64',
                                                fieldNumber: 2,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    public getSchema() {
        return this.schema;
    }

}

