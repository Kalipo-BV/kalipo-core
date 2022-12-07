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

import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { RowContext } from '../../../database/row_context';
import { PoaIssue } from '../../../database/table/poa_issue_table';

export class CreatePoaIssueAsset extends BaseAsset {

    public name = 'createPoaIssue';
    public id = 0;

    public schema = {
        $id: 'poa/createPoaIssue-asset',
        title: 'CreatePoaIssueAsset transaction asset for poa module',
        type: 'object',
        required: ["poaIds", "receiverAddress"],
        properties: {
            receiverAddress: {
                dataType: 'string',
                fieldNumber: 1,
            },
            poaIds: {
                type: "array",
                fieldNumber: 2,
                items: {
                    dataType: 'string',
                }
            }
        },
    }

    public validate({ asset }: ValidateAssetContext<{}>): void {
        // Validate your asset
    }

    private async _getPoas(stateStore, asset) {
        let poas: any[] = [];
        for (let i = 0; i < asset.poaIds.length; i++) {
            const poa = await db.tables.poa.getRecord(stateStore, asset.poaIds[i]);
            poas.push({ poaId: asset.poaIds[i], poa: poa })
        }
        return poas;
    }

    private async _getKalipoAccount(stateStore, asset) {
        const kalipoAccountId = asset.receiverAddress;

        if (kalipoAccountId == null) {
            throw new Error(`Lisk account can not be found`);
        }

        const receiverAccount = await db.tables.kalipoAccount.getRecord(stateStore, kalipoAccountId);

        if (receiverAccount == null) {
            throw new Error("Receiver account not found")
        }

        return receiverAccount;
    }

    private async _poaIssues(poas, transaction) {
        const poaIssues: Array<string> = [db.tables.poaIssue.getDeterministicId(transaction, 0)]
        for (let index = 0; index < poas.length; index++) {
            poaIssues.push(db.tables.poaIssue.getDeterministicId(transaction, index + 1));
        }
        return poaIssues;
    }

    private async _issuePoas(poas, kalipoAccountId, stateStore, transaction, receiverAccount) {
        const poaIssueRowContext: RowContext = new RowContext;

        for (let i = 0; i < poas.length; i++) {
            poaIssueRowContext.increment();

            const now: BigInt = (BigInt)(new Date().getTime());

            const poaIssue: PoaIssue = {
                accountId: kalipoAccountId,
                poaId: poas[i].poaId,
                membershipId: "",
                issueDate: now,
            }

            const poaIssueId: string = await db.tables.poaIssue.createRecord(stateStore, transaction, poaIssue, poaIssueRowContext)

            // add poa issue to poa (update record)
            poas[i].poa.issuedPoas.push(poaIssueId)
            await db.tables.poa.updateRecord(stateStore, poas[i].poaId, poas[i].poa)

            receiverAccount?.issuedPoas.push(poaIssueId);
            await db.tables.kalipoAccount.updateRecord(stateStore, kalipoAccountId, receiverAccount)

            // poa issue in membership
            for (let x = 0; x < receiverAccount.memberships.length; x++) {
                const mship = await db.tables.membership.getRecord(stateStore, receiverAccount.memberships[x])

                if (mship != null) {
                    if (mship?.autonId == poas[i].poa.autonId) {

                        mship?.poasIssued.push(poaIssueId);
                        await db.tables.membership.updateRecord(stateStore, receiverAccount.memberships[x], mship)

                        // update membership id
                        const poaIssue = await db.tables.poaIssue.getRecord(stateStore, poaIssueId)
                        if (poaIssue != null) {
                            poaIssue.membershipId = receiverAccount.memberships[x];

                            await db.tables.poaIssue.updateRecord(stateStore, poaIssueId, poaIssue);
                        }
                    }
                }
            }
        }
    }

    public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {

        const poas = await this._getPoas(stateStore, asset);

        const receiverAccount = await this._getKalipoAccount(stateStore, asset)

        this._poaIssues(poas, transaction)

        const kalipoAccountId = asset.receiverAddress;
        this._issuePoas(poas, kalipoAccountId, stateStore, transaction, receiverAccount)
    }
}

