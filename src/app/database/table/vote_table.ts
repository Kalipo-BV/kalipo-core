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

export interface Vote {
    proposalId: string,
    membershipId: string,
    answer: Array<Array<string>>,
    casted: BigInt,
    transaction: string
}

export class VoteTable extends BaseTable<Vote> {
    public prefix: string = "table:vote";
    protected schema: Schema = {
        $id: "kalipo/tables/vote_table",
        type: "object",
        required: ["proposalId", "membershipId", "answer", "casted", "transaction"],
        properties: {
            proposalId: {
                dataType: "string",
                fieldNumber: 1,
            },
            membershipId: {
                dataType: "string",
                fieldNumber: 2,
            },
            answer: {
				type: 'array',
				fieldNumber: 3,
				answerPerQuestion: {
                    type: 'array',
                    fieldNumber: 2,
                    items: {
                        dataType: 'string'
                    }
                }
			},
            casted: {
                dataType: "uint64",
                fieldNumber: 4,
            },
            transaction: {
                dataType: "string",
                fieldNumber: 5,
            },
        }
    }
}