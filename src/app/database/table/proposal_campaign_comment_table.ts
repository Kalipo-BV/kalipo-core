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

export interface ProposalCampaignComment {
    proposalId: string,
    membershipId: string,
    comment: string,
    likes: Array<string>,
    dislikes: Array<string>,
    created: BigInt
}

export class ProposalCampaignCommentTable extends BaseTable<ProposalCampaignComment> {
    public prefix: string = "table:proposal_campaign_comment";
    protected schema: Schema = {
        $id: "kalipo/tables/proposal_campaign_comment_table",
        type: "object",
        required: ["proposalId", "membershipId", "comment", "likes", "dislikes", "created"],
        properties: {
            proposalId: {
                dataType: 'string',
                fieldNumber: 1
            },
            membershipId: {
                dataType: 'string',
                fieldNumber: 2
            },
            comment: {
                dataType: "string",
                fieldNumber: 3
            },
            likes: {
                type: "array",
                fieldNumber: 4,
                items: {
                    dataType: "string",
                }
            },
            dislikes: {
                type: "array",
                fieldNumber: 5,
                items: {
                    dataType: "string",
                }
            },
            created: {
                dataType: 'uint64',
                fieldNumber: 6
            },
        }
    }

}