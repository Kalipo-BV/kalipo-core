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

export interface PoaIssue {
    // id: string,
    accountId: string,
    poaId: string,
    membershipId: string,
    issueDate: BigInt,
} 

export class PoaIssueTable extends BaseTable<PoaIssue> {
    public prefix: string = "table:poa_issue";
    protected schema: Schema = {
        $id: "kalipo/tables/poa_issue_table",
        type: "object",
        required: ["accountId", "poaId", "membershipId"],
        properties: {
            accountId: {
                dataType: "string",
                fieldNumber: 1,
            },
            poaId: {
                dataType: "string",
                fieldNumber: 2,
            },
            membershipId: {
                dataType: "string",
                fieldNumber: 3,
            },
            issueDate: {
                dataType: "uint64",
                fieldNumber: 4,
            },
        }
    }
}