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

export interface GovernmentalEntryMutation {
    oldEntryId: string,
    newEntryId: string,
    type: string,
    changes: Array<string>
}

export interface GovernmentalPositionTree {
    entryId: string,
    children: Array<GovernmentalPositionTree>
}

export interface GovernmentalPositionTreeWrapper {
    section: string,
    tree: Array<GovernmentalPositionTree>
}

export interface GovernmentalVersion {
    id: string,
    documentId: string,
    proposalId: string,
    version: Number,
    effectuationDate: BigInt,
    mutations: Array<GovernmentalEntryMutation>
    trees: Array<GovernmentalPositionTreeWrapper>
}

export class GovernmentalVersionTable extends BaseTable<GovernmentalVersion> {
    public prefix: string = "table:governmental_version";
    protected schema: Schema = {
        $id: "kalipo/tables/governmental_version_table",
        type: "object",
        required: ["id", "documentId", "proposalId", "version", "effectuationDate", "mutations", "trees"],
        properties: {
            id: {
                dataType: "string",
                fieldNumber: 1,
            },
            documentId: {
                dataType: "string",
                fieldNumber: 2,
            },
            proposalId: {
                dataType: "string",
                fieldNumber: 3,
            },
            version: {
                dataType: "uint32",
                fieldNumber: 4,
            },
            effectuationDate: {
                dataType: "uint64",
                fieldNumber: 5,
            },
            mutations: {
                type: "array",
                fieldNumber: 6,
                items: {
                    type: "object",
                    required: ["oldEntryId", "newEntryId", "type", "changes"],
                    properties: {
                        oldEntryId: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        newEntryId: {
                            dataType: "string",
                            fieldNumber: 2,
                        },
                        type: {
                            dataType: "string",
                            fieldNumber: 3,
                        },
                        changes: {
                            type: "array",
                            fieldNumber: 4,
                            items: {
                                dataType: "string",
                            }
                        }
                    }
                }
            },
            trees: {
                type: "array",
                fieldNumber: 7,
                items: {
                    type: "object",
                    required: ["section", "tree"],
                    properties: {
                        section: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        tree: {
                            type: "array",
                            fieldNumber: 2,
                            items: {
                                type: "object",
                                required: ["entryId", "children"],
                                properties: {
                                    entryId: {
                                        dataType: "string",
                                        fieldNumber: 1,
                                    },
                                    children: {
                                        type: "array",
                                        fieldNumber: 2,
                                        items: {
                                            type: "object",
                                            required: ["entryId", "children"],
                                            properties: {
                                                entryId: {
                                                    dataType: "string",
                                                    fieldNumber: 1,
                                                },
                                                children: {
                                                    type: "array",
                                                    fieldNumber: 2,
                                                    items: {
                                                        type: "object",
                                                        required: ["entryId", "children"],
                                                        properties: {
                                                            entryId: {
                                                                dataType: "string",
                                                                fieldNumber: 1,
                                                            },
                                                            children: {
                                                                type: "array",
                                                                fieldNumber: 2,
                                                                items: {
                                                                    type: "object",
                                                                    required: ["entryId", "children"],
                                                                    properties: {
                                                                        entryId: {
                                                                            dataType: "string",
                                                                            fieldNumber: 1,
                                                                        },
                                                                        children: {
                                                                            type: "array",
                                                                            fieldNumber: 2,
                                                                            items: {
                                                                                type: "object",
                                                                                required: ["entryId"],
                                                                                properties: {
                                                                                    entryId: {
                                                                                        dataType: "string",
                                                                                        fieldNumber: 1,
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