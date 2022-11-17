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
import { ProposalType } from "../enums";
import { AutonTypeEnum } from "../enums";



export interface AutonProfile {
    name: string, 
    subtitle: string,
    icon: string,
    mission: string,
    vision: string
    foundingDate: BigInt
    // these are the event fields
    // the title of the event is the name of the auton
}

export interface ProposalTypeConstitution {
    type: ProposalType,
    provisions: Array<string>,
}

export interface Auton {
    memberships: Array<string>,
    tags: Array<string>,
    constitution: Array<ProposalTypeConstitution>,
    proposals: Array<string>,
    transaction: string,
    type: AutonTypeEnum,
    autonProfile: AutonProfile,
    poas: Array<string>,
    event: EventProfile
}

export interface EventProfile {
    description?: string,
    location?: string,
    capacity?: BigInt,
    price?: BigInt, 
    start?: BigInt,
    end?: BigInt,
}

export class AutonTable extends BaseTable<Auton> {
    public prefix: string = "table:auton";
    protected schema: Schema = {
        $id: "kalipo/tables/auton_table",
        type: "object",
        required: ["memberships", "autonProfile", "type"],
        properties: {
            memberships: {
                type: "array",
                fieldNumber: 1,
                maxItems: 1024,
                items: {
                    dataType: "string",
                }
            },
            autonProfile: {
                type: 'object',
                fieldNumber: 2,
                required: ["name"],
                properties: {
                    name: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    subtitle: {
                        dataType: "string",
                        fieldNumber: 2,
                    },
                    icon: {
                        dataType: "string",
                        fieldNumber: 3,
                    },
                    mission: {
                        dataType: "string",
                        fieldNumber: 4,
                    },
                    vision: {
                        dataType: "string",
                        fieldNumber: 5,
                    },
                    foundingDate: {
                        dataType: "uint64",
                        fieldNumber: 6,
                    }
                }
            },
            tags: {
                type: "array",
                fieldNumber: 3,
                items: {
                    dataType: "string",
                }
            },
            constitution: {
                type: "array",
                fieldNumber: 4,
                items: {
                    type: "object",
                    required: ["type", "provisions"],
                    properties: {
                        type: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        provisions: {
                            type: "array",
                            fieldNumber: 2,
                            items: {
                                dataType: "string",
                            }
                        },
                    }

                }
            },
            proposals: {
                type: "array",
                fieldNumber: 5,
                items: {
                    dataType: "string",
                }
            },
            transaction: {
                dataType: "string",
                fieldNumber: 6,
            },
            type: {
                dataType: "string",
                fieldNumber: 7
            },
            poas: {
                type: "array",
                fieldNumber: 8,
                items: {
                    dataType: "string",
                }
            },
            event: {
                type: "object",
                fieldNumber: 9,
                required: [],
                properties: {
                    description: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    location: {
                        dataType: "string",
                        fieldNumber: 2,
                    },
                    capacity: {
                        dataType: "uint64",
                        fieldNumber: 3,
                    },
                    price: {
                        dataType: "uint64",
                        fieldNumber: 4,
                    },
                    start: {
                        dataType: "uint64",
                        fieldNumber: 5,
                    },
                    end: {
                        dataType: "uint64",
                        fieldNumber: 6,
                    }
                }
            }
        }
    }

}

