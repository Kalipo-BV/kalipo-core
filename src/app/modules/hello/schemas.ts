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

// This key is used to save the data for the hello counter in the database
const CHAIN_STATE_HELLO_COUNTER = "hello:helloCounter";

// This schema is used to decode/encode the data of the hello counter from/for the database
const helloCounterSchema = {
    $id: "lisk/hello/counter",
    type: "object",
    required: ["helloCounter"],
    properties: {
        helloCounter: {
            dataType: "uint32",
            fieldNumber: 1,
        },
    },
};

// This schema is used to decode/encode the data of the asset of the hello transaction from/for the database
const helloAssetSchema = {
    $id: "lisk/hello/asset",
    type: "object",
    required: ["helloString"],
    properties: {
        helloString: {
            dataType: "string",
            fieldNumber: 1,
        },
    },
};

module.exports = {
    CHAIN_STATE_HELLO_COUNTER,
    helloCounterSchema,
    helloAssetSchema
};