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
import { Membership, MembershipInvitation } from '../../../database/table/membership_table';
import { Auton, ProposalTypeConstitution } from '../../../database/table/auton_table';
import { db } from '../../../database/db';
import { KalipoAccount } from '../../../database/table/kalipo_account_table';
import { RowContext } from '../../../database/row_context';
import { templates } from '../../../database/templates';
import { VALID_INVITATION_WINDOW } from '../../membership/membership_module';
import { AutonTypeEnum } from '../../../database/enums';
import { Poa } from '../../../database/table/poa_table';
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



    public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {

        console.log()
        console.log("-----------------------------------CREATE POA ISSUE APPLY FUNC------------------------------------")
        console.log()

        const poas: any[] = [];

        for (let i = 0; i < asset.poaIds.length; i++) {
            const poa = await db.tables.poa.getRecord(stateStore, asset.poaIds[i]);
            poas.push({ poaId: asset.poaIds[i], poa: poa })
        }

        console.log("POAS: ")
        console.log(poas)
        console.log()

        const kalipoAccountId = asset.receiverAddress;

        if (kalipoAccountId == null) {
            throw new Error(`Lisk account can not be found`);
        }

        const receiverAccount = await db.tables.kalipoAccount.getRecord(stateStore, kalipoAccountId);

        if (receiverAccount == null) {
            throw new Error("Receiver account not found")
        }

        console.log("RECEIVER KALIPO ACCOUNT: ")
        console.log(receiverAccount)
        console.log()

        const poaIssues: Array<string> = [db.tables.poaIssue.getDeterministicId(transaction, 0)]
        for (let index = 0; index < poas.length; index++) {
            poaIssues.push(db.tables.poaIssue.getDeterministicId(transaction, index + 1));
        }

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

            console.log("POA ISSUE ID:")
            console.log(poaIssueId)
            console.log()

            console.log("POA:")
            console.log(poas[i].poa);
            console.log()

            // add poa issue to poa (update record)
            poas[i].poa.issuedPoas.push(poaIssueId)
            await db.tables.poa.updateRecord(stateStore, poas[i].poaId, poas[i].poa)

            console.log("UPDATED POA WITH POA ISSUE:")
            console.log(poas[i].poa);
            console.log()

            receiverAccount?.issuedPoas.push(poaIssueId);
            await db.tables.kalipoAccount.updateRecord(stateStore, kalipoAccountId, receiverAccount)

            console.log("RECEIVER ACCOUNT WITH ISSUED POA:")
            console.log(receiverAccount);
            console.log()

            // poa issue in membership
            for (let x = 0; x < receiverAccount.memberships.length; x++) {
                const mship = await db.tables.membership.getRecord(stateStore, receiverAccount.memberships[x])

                if (mship != null) {
                    if (mship?.autonId == poas[i].poa.autonId) {

                        console.log("FOUND AUTON IN MEMBERSHIP")

                        mship?.poasIssued.push(poaIssueId);
                        await db.tables.membership.updateRecord(stateStore, receiverAccount.memberships[x], mship)

                        console.log()
                        console.log(mship)
                    }
                }
            }
        }





        // for (let i = 0; i < arr.length; i++) {

        //     const membershipsId = kalipoAccount.memberships;
        //     const auton = await db.tables.auton.getRecord(stateStore, arr[i].autonId);

        //     if (auton == null) {
        //         throw new Error(`Auton can not be found`);
        //     }

        //     let validMembership = membershipsId.find((id) => auton.memberships.includes(id));

        //     if (validMembership == null) {
        //         throw new Error(`Only members of the event can receive poas`);
        //     }

        //     const now: BigInt = (BigInt)(new Date().getTime());

        //     const poaIssue: PoaIssue = {
        //         accountId: kalipoAccountId,
        //         poaId: asset.poaIds[i],
        //         membershipId: "",
        //         issueDate: now,
        //     }

        //     poaIssueRowContext.increment();

        //     const poaIssueId: string = await db.tables.poaIssue.createRecord(stateStore, transaction, poaIssue, poaIssueRowContext);

        //     await db.indices.poaIssue.setRecord(stateStore, asset.poaIds[i], { id: poaIssueId })
        //     const allPoaIssueIds = await db.indices.fullTable.getRecord(stateStore, "poaIssues");

        //     if (allPoaIssueIds == null) {
        //         const index = { ids: [poaIssueId] }
        //         await db.indices.fullTable.setRecord(stateStore, "poaIssues", index)
        //     } else {
        //         allPoaIssueIds.ids.push(poaIssueId)
        //         await db.indices.fullTable.setRecord(stateStore, "poaIssues", allPoaIssueIds)
        //     }

        // console.log()
        // console.log("POA ISSUE ID");
        // console.log(poaIssueId)
        // console.log()

        // arr[i].issuedPoas.push(poaIssueId);
        // await db.tables.poa.updateRecord(stateStore, arr[i].poaId, arr[i])

        // kalipoAccount.issuedPoas.push(poaIssueId);
        // await db.tables.kalipoAccount.updateRecord(stateStore, kalipoAccountId, kalipoAccount)

        // }
    }
}
