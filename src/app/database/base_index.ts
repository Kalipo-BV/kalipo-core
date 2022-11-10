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
import { getIndexId } from './database_utils';

export abstract class BaseIndex<T = unknown> {
    protected abstract prefix: string;
    protected abstract schema: Schema;
    async getRecord(chainGetter, id: string): Promise<T | null> {
        let res;

        if (chainGetter.chain) {
            res = await chainGetter.chain.get(getIndexId(this.prefix, id));
        } else {
            res = await chainGetter(getIndexId(this.prefix, id));
        }

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
            res = await chainGetter.chain.get(getIndexId(this.prefix, id));
        } else {
            res = await chainGetter(getIndexId(this.prefix, id));
        }

        if (res === undefined) {
            return null;
        }

        console.log(res)

        const me = codec.decode<T>(
            this.schema,
            res
        );

        const data = codec.toJSON<string>(this.schema, me);

        return data;
    };

    async setRecord(stateStore: StateStore, key: string, value: Record<string, unknown>): Promise<string> {
        //toString('hex');
        const id = getIndexId(this.prefix, key)
        await stateStore.chain.set(id, codec.encode(this.schema, value));
        return id;
    }

    async deleteRecord(stateStore: StateStore, key: string): Promise<void> {
        await stateStore.chain.set(
            getIndexId(this.prefix, key),
            Buffer.alloc(0)
        );
    }

}