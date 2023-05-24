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

// export interface PartyMembers {
//     memberCode: string,
// }

export interface Parties {
    client: Array<string> | null,
    contractor: Array<string> | null
}

export interface Payment {
    amount: number,
    note: string | null,
}

export interface Dates {
    startDate: string,
    endDate: string,
}

// export interface Milestones {
//     info: string | null,
//     amount: number,
// }

// export interface Custom {
//     type: string,
//     info: string,
//     data: Buffer,
// }

export interface FormData {
    title: string,
    parties: Parties,
    preample: string,
    purpose: string,
    payment: Payment,
    dates: Dates,
    propertyRights: string,
    terminationOfAgreement: string,
    governingLawAndJurisdiction: string,
    finalProvisions: string,
    // milestones: Array<Milestones> | null,
    // custom: Array<Custom> | null,
    requiredToSign: boolean,
    signed: boolean,
    signingWindow: string,
}

export interface Contract {
    id: string,
    editFase: BigInt,
    status: string,
    type: string,
    fullySigned: boolean,
    // signingWindow: string,
    date: string,
    formData: FormData,
    createdBy: string,
    version: BigInt
    // transaction: string,
}

export class GrantContractTable extends BaseTable<Contract> {
    public prefix: string = "table:grant_contract";
    protected schema: Schema = {
        $id: "kalipo/tables/contract_table",
        type: "object",
        required: ["editFase", "status", "type", "fullySigned", "date", "formData"],
        properties: {
            editFase: {
                dataType: "uint32",
                fieldNumber: 1,
            },
            status: {
                dataType: "string",
                fieldNumber: 2,
            },
            type: {
                dataType: "string",
                fieldNumber: 3,
            },
            fullySigned: {
                dataType: "boolean",
                fieldNumber: 4,
            },
            date: {
                dataType: "string",
                fieldNumber: 5,
            },
            formData: {
                type: "object",
                fieldNumber: 6,
                // required: ["parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "milestones", "custom", "requiredToSign", "signed", "signingWindow"],
                required: ["title", "parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "requiredToSign", "signed", "signingWindow"],
                properties: {
                    title: {
                        dataType: "string",
                        fieldNumber: 1,
                    },
                    parties: {
                        type: "object",
                        fieldNumber: 2,
						required: ["client", "contractor"],
                		properties: {
							client: {
								type: "array",
								fieldNumber: 1,
                                items: {
                                    dataType: "string",
                                }
							},
							contractor: {
								type: "array",
								fieldNumber: 2,
                                items: {
                                    dataType: "string",
                                }
							},
						},
                    },
                    preample: {
                        dataType: "string",
                        fieldNumber: 3,
                    },
                    purpose: {
                        dataType: "string",
                        fieldNumber: 4,
                    },
                    payment: {
                        type: "object",
                        fieldNumber: 5,
                        required: ["amount"],
                        properties: {
                            amount: {
                                dataType: "uint32",
                                fieldNumber: 1,
                            },
                            note: {
                                dataType: "string",
                                fieldNumber: 2,
                            },
                        }
                    },
                    dates: {
                        type: "object",
                        fieldNumber: 6,
                        required: ["startDate", "endDate"],
                        properties: {
                            startDate: {
                                //[FINDME_BAS] not sure if string is the correct type for dates
                                dataType: "string",
                                fieldNumber: 1,
                            },
                            endDate: {
                                dataType: "string",
                                fieldNumber: 2,
                            },
                        }
                    },
                    propertyRights: {
                        dataType: "string",
                        fieldNumber: 7,
                    },
                    terminationOfAgreement: {
                        dataType: "string",
                        fieldNumber: 8,
                    },
                    governingLawAndJurisdiction: {
                        dataType: "string",
                        fieldNumber: 9,
                    },
                    finalProvisions: {
                        dataType: "string",
                        fieldNumber: 10,
                    },
                    // milestones: {
                    //     type: "array",
                    //     fieldNumber: 10,
                    //     items: {
                    //         type: "object",
                    //         // required: ["amount"],
                    //         required: [],
                    //         properties: {
                    //             info: {
                    //                 dataType: "string",
                    //                 fieldNumber: 1,
                    //             },
                    //             amount: {
                    //                 dataType: "uint32",
                    //                 fieldNumber: 2,
                    //             },
                    //         }
                    //     }
                    // },
                    // custom: {
                    //     type: "array",
                    //     fieldNumber: 11,
                    //     items: {
                    //         type: "object",
                    //         // required: ["type", "info", "data"],
                    //         required: [],
                    //         properties: {
                    //             type: {
                    //                 //[FINDME_BAS] not sure if string is right for type (unsure)
                    //                 dataType: "string",
                    //                 fieldNumber: 1,
                    //             },
                    //             info: {
                    //                 dataType: "string",
                    //                 fieldNumber: 2,
                    //             },
                    //             data: {
                    //                 //[FINDME_BAS] type based on ^type, not sure how to do this (?cast)
                    //                 dataType: "bytes",
                    //                 fieldNumber: 3,
                    //             },
                    //         }
                    //     }
                    // },
                    requiredToSign: {
                        dataType: "boolean",
                        fieldNumber: 11,
                    },
                    signed: {
                        dataType: "boolean",
                        fieldNumber: 12,
                    },
                    signingWindow: {
                        dataType: "string",
                        fieldNumber: 13,
                    },
                }
            },
            // transaction: {
            //     dataType: "string",
            //     fieldNumber: 8,
            // },
        }
    };

    public getSchema() {
        return this.schema;
    }
}