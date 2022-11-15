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


export interface Poa {
    // id: string, TODO moet dit een id zijn
    issuedPoas: Array<string>,
    autonId: string,
    name: string,
    staticImageId: string,
}

export interface PoaIssue {
    // id: string, TODO moet dit een id zijn
    accountId: string,
    poaId: string,
    membershipId: string,
    issueDate: BigInt,
}

export class PoaTable extends BaseTable<Poa> {
    public prefix: string = "table:poa";
    protected schema: Schema = {
        $id: "kalipo/tables/poa_table",
        type: "object",
        required: ["autonId", "name"],
        properties: {
            issuedPoas: {
                type: "array",
                items: {
                    dataType: "string",
                },
                fieldNumber: 1,
            },
            autonId: {
                dataType: "string",
                fieldNumber: 2,
            },
            name: {
                dataType: "string",
                fieldNumber: 3,
            },
            staticImageId: {
                dataType: "string",
                fieldNumber: 4,
            },
        }
    }
}
