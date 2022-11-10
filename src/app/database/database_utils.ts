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

import { Transaction } from "lisk-framework";
import { cryptography } from "lisk-sdk";
import { Block } from '@liskhq/lisk-chain';


// prefix + senderPubKey + nonce + row is unqiue for all nodes, 
// the row number is the amount of inserts within one transaction for the same table
// so two insert in one transaction needs to set row to 1 and for the seccond insert to 2.
export const getDeterministicId = (prefix: string, transaction: Transaction, row: number): Buffer => {
    return cryptography.hash(Buffer.from(`${prefix}:${transaction.senderPublicKey.toString('hex')}:${transaction.nonce}:${row}`));
}

export const getDeterministicIdLifeCycleWay = (prefix: string, block: Block, row: number): Buffer => {
    return cryptography.hash(Buffer.from(`${prefix}:${block.header.height}:${row}`));
}

export const getIndexId = (prefix: string, property: string): string => {
    return `${prefix}:${cryptography.hash(Buffer.from(property.toUpperCase()))}`;
}