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

import { codec } from "lisk-sdk";
import { BaseIndex } from "../base_index";
import { getIndexId } from "../database_utils";

export interface referenceI {
    id: string,
    scheduled: BigInt
}

export interface IndexI {
    data: Array<referenceI>;
}

export class ScheduledProposalIndex extends BaseIndex<IndexI> {
    protected prefix = "kalipo:proposal:scheduledProposalIndex:";

    // Database schema used for decoding/encoding, validation and interoperability
    public schema = {
        $id: "kalipo/proposal/scheduled_proposal_index",
        type: "object",
        required: ["data"],
        properties: {
            data: {
                type: 'array',
                fieldNumber: 1,
                items: {
                    type: "object",
                    required: ["id", "scheduled"],
                    properties: {
                        id: {
                            dataType: "string",
                            fieldNumber: 1,
                        },
                        scheduled: {
                            dataType: "uint64",
                            fieldNumber: 2,
                        },
                    }
                },
            },
        }
    };

}