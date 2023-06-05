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
import { Contract } from "./contract_table";
import { Auton } from "./auton_table";


export interface Agreement {
    id: string, 
    creator: string | null, //User
    contractor: Array<string>, //Users
    client: Array<string>, //Users
    clientAuton: string | null, //Auton
    contractorAuton: string | null, //
    agreementVersion: Array<AgreementVersion> | null,
}

export interface AgreementVersion {
    version: number,
    status: string,
    contract: string, //Contract
}

export class AgreementTable extends BaseTable<Agreement> {
    public prefix: string = "table:agreement";
    protected schema: Schema = {
        $id: "kalipo/tables/agreement",
        type: "object",
        required: ["contractor", "client", "contractorAuton"],
		properties: {
			creator: {
				dataType: "string",
				fieldNumber: 1,
			},
			contractor: {
				type: "array",
				fieldNumber: 2,
				items: {
					dataType: "string",
				}
			},
			client: {
				type: "array",
				fieldNumber: 3,
				items: {
					dataType: "string",
				}
			},
			clientAuton: {
				dataType: "string",
				fieldNumber: 4,
			},
			contractorAuton: {
				dataType: "string",
				fieldNumber: 5,
			},
			agreementVersion: {
				type: "array",
				fieldNumber: 6,
				items: {
					type: "object",
					required: [], //["version", "status", "contract"],
					properties: {
						version: {
							dataType: "uint32",
							fieldNumber: 1,
						},
						status: {
							dataType: "string",
							fieldNumber: 2,
						},
						contract: {
							dataType: "string",
							fieldNumber: 3,
						},
					}
				}
			},
		},
    };

    public getSchema() {
        return this.schema;
    }
}