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

export interface Social {
    social: string,
    link: string
}


export interface KalipoAccount {
    id: string,
    username: string,
    name: string,
    socials: Array<Social>
    liskAccountId: Buffer
    memberships: Array<string>
    transaction: string,
    issuedPoas: Array<string>,
    stakeholderNotification: Array<string>,
}

export class KalipoAccountTable extends BaseTable<KalipoAccount> {
    public prefix: string = "table:kalipoAccount";
    protected schema: Schema = {
        $id: "kalipo/tables/kalipo_account_table",
        type: "object",
        required: ["username", "name"],
        properties: {
            username: {
                dataType: "string",
                fieldNumber: 1,
            },
            name: {
                dataType: "string",
                fieldNumber: 2,
            },
            socials: {
                type: "array",
                fieldNumber: 3,
                maxItems: 4,
                items: {
                    type: "object",
                    required: ["social", "link"],
                    properties: {
                        social: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        link: {
                            dataType: "string",
                            fieldNumber: 2,
                        }
                    }

                }
            },
            liskAccountId: {
                dataType: "bytes",
                fieldNumber: 4,
            },
            memberships: {
                type: "array",
                fieldNumber: 5,
                items: {
                    dataType: "string",
                }
            },
            transaction: {
                dataType: "string",
                fieldNumber: 6
            },
            issuedPoas: {
                type: "array",
                fieldNumber: 7,
                items: {
                    dataType: "string",
                }
            },
            stakeholderNotification: {
                type: "array",
                fieldNumber: 8,
                items: {
                    dataType: "string",
                },
            },
        }
    }
}