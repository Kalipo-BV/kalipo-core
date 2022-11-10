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

import { Schema } from '@liskhq/lisk-codec';
import { codec, StateStore } from 'lisk-sdk';
import { Transaction } from "lisk-framework";
import { getDeterministicId, getDeterministicIdLifeCycleWay } from './database_utils';
import { RowContext } from './row_context';
import { Block } from '@liskhq/lisk-chain';
import { currentRowContexts } from '../modules/proposal/proposal_module';

export abstract class BaseTable<T = unknown> {
    public abstract prefix: string;
    protected abstract schema: Schema;
    async getRecord(chainGetter, id: string): Promise<T | null> {
        let res;
        if (chainGetter.chain) {
            res = await chainGetter.chain.get(id);
        } else {
            res = await chainGetter(id);
        }

        console.log("TESTTTT")
        console.log(res)

        if (res === undefined) {
            return null;
        }

        const data = codec.decode<T>(
            this.schema,
            res
        );

        return data;
    };

    async getRecordInJSON(chainGetter, id: string): Promise<string | null> {
        let res;
        if (chainGetter.chain) {
            res = await chainGetter.chain.get(id);
        } else {
            res = await chainGetter(id);
        }

        if (res === undefined) {
            return null;
        }

        const me = codec.decode<T>(
            this.schema,
            res
        );

        const data = codec.toJSON<string>(this.schema, me);

        return data;
    };

    async createRecord(stateStore: StateStore, transaction: Transaction, data: T, rowContext: RowContext): Promise<string> {
        const id = getDeterministicId(this.prefix, transaction, rowContext.getNonce()).toString('hex');
        await stateStore.chain.set(id, codec.encode(this.schema, data));
        return id;
    }

    async createRecordLifeCycleWay(stateStore: StateStore, block: Block, data: T): Promise<string> {
        const rowContext = currentRowContexts[this.prefix];
        if (rowContext == null) {
            throw new Error("Record could not be created because the rowContext is not found for table: " + this.prefix)
        }

        const id = getDeterministicIdLifeCycleWay(this.prefix, block, rowContext.getNonce()).toString('hex');
        await stateStore.chain.set(id, codec.encode(this.schema, data));
        rowContext.increment();
        return id;
    }

    async updateRecord(stateStore: StateStore, id: string, data: T): Promise<string> {
        await stateStore.chain.set(id, codec.encode(this.schema, data));
        return id;
    }

    getDeterministicId(transaction: Transaction, rowNumber: number): string {
        return getDeterministicId(this.prefix, transaction, rowNumber).toString('hex');
    }

    getDeterministicIdLifeCycleWay(block: Block, rowNumber: number): string {
        return getDeterministicIdLifeCycleWay(this.prefix, block, rowNumber).toString('hex');
    }

}