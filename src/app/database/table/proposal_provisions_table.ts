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


export interface ProposalProvisionsI {
    type: ProposalType,
    attendance: number,
    acceptance: number,
    campaigning: BigInt,
    votingWindow: BigInt,
    execAfterEnd: boolean,
    transactionId: string
}

export class ProposalProvisions implements ProposalProvisionsI {
    public type: ProposalType;
    public attendance: number;
    public acceptance: number;
    public campaigning: BigInt;
    public votingWindow: BigInt;
    public execAfterEnd: boolean;
    public transactionId: string;

    constructor(type: ProposalType, attendance: number, acceptance: number, campaigning: BigInt, votingWindow: BigInt, execAfterEnd: boolean, transactionId: string) {
        this.type = type;
        this.attendance = attendance;
        this.acceptance = acceptance;
        this.campaigning = campaigning;
        this.votingWindow = votingWindow;
        this.execAfterEnd = execAfterEnd;
        this.transactionId = transactionId;
    }
}

export class ProposalProvisionsTable extends BaseTable<ProposalProvisionsI> {
    public prefix: string = "table:proposal_provision";
    protected schema: Schema = {
        $id: "kalipo/tables/proposal_provision_table",
        type: "object",
        required: ["type", "attendance", "acceptance", "campaigning", "votingWindow", "execAfterEnd", "transactionId"],
        properties: {
            type: {
                dataType: 'string',
                fieldNumber: 1,
            },
            attendance: {
                dataType: 'uint32',
                fieldNumber: 2,
            },
            acceptance: {
                dataType: 'uint32',
                fieldNumber: 3,
            },
            campaigning: {
                dataType: 'uint64',
                fieldNumber: 4,
            },
            votingWindow: {
                dataType: 'uint64',
                fieldNumber: 5,
            },
            execAfterEnd: {
                dataType: 'boolean',
                fieldNumber: 6,
            },
            transactionId: {
                dataType: 'string',
                fieldNumber: 7,
            },
        }
    }

}

