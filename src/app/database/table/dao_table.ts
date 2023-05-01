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

export interface DaoProfile {
    name: string,
    subtitle: string,
    icon: string,
    mission: string,
    vision: string,
    foundingDate: BigInt
}

export interface LegalEntityProfile {
    jurisdiction: string,
    cocId: string,
    businessAddress: string
}

export interface ContactChannel {
    channel: string,
    link: string
}

export interface Dao {
    autons: Array<string>,
    governingAutonId: string,
    daoProfile: DaoProfile,
    legalEntityProfile?: LegalEntityProfile,
    contactChannels: Array<ContactChannel>
}

export class DaoTable extends BaseTable<Dao> {
    public prefix: string = "table:dao";
    protected schema: Schema = {
        $id: "kalipo/tables/dao_table",
        type: "object",
        required: ["autons", "governingAutonId", "daoProfile"],
        properties: {
            autons: {
                type: "array",
                fieldNumber: 1,
                items: {
                    dataType: "string",
                }
            },
            governingAutonId: {
                dataType: "string",
                fieldNumber: 2,
            },
            daoProfile: {
                type: 'object',
                fieldNumber: 3,
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
            legalEntityProfile: {
                type: 'object',
                fieldNumber: 4,
                required: ["jurisdiction", "cocId", "businessAddress"],
                properties: {
                    jurisdiction: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    cocId: {
                        dataType: "string",
                        fieldNumber: 2,
                    },
                    businessAddress: {
                        dataType: "string",
                        fieldNumber: 3,
                    }
                }
            },
            contactChannels: {
                type: "array",
                fieldNumber: 5,
                items: {
                    type: "object",
                    required: ["channel", "link"],
                    properties: {
                        channel: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        link: {
                            dataType: "string",
                            fieldNumber: 2,
                        }
                    }
                }
            }
        }
    }
}
