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

export interface GovernmentalDocument {
    id: string,
    versions: Array<string>,
    type: string
}

export class GovernmentalDocumentTable extends BaseTable<GovernmentalDocument> {
    public prefix: string = "table:governmental_document";
    protected schema: Schema = {
        $id: "kalipo/tables/governmental_document_table",
        type: "object",
        required: ["id", "versions", "type"],
        properties: {
            id: {
                dataType: "string",
                fieldNumber: 1,
            },
            versions: {
                type: "array",
                fieldNumber: 2,
                items: {
                    dataType: "string",
                }
            },
            type: {
                dataType: "string",
                fieldNumber: 3,
            }
        }
    }
}