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

import { BaseAsset, ApplyAssetContext, ValidateAssetContext, HTTPAPIPlugin } from 'lisk-sdk';
import { Membership, MembershipInvitation } from '../../../database/table/membership_table';
import { Auton, ProposalTypeConstitution } from '../../../database/table/auton_table';
import { db } from '../../../database/db';
import { KalipoAccount } from '../../../database/table/kalipo_account_table';
import { RowContext } from '../../../database/row_context';
import { templates } from '../../../database/templates';
import { VALID_INVITATION_WINDOW } from '../../membership/membership_module';
import { AutonTypeEnum, RoleEnum } from '../../../database/enums';
import { CreatePoaAsset } from '../../poa/assets/create_poa_asset';
import { PoaIssue } from '../../../database/table/poa_issue_table';

export class CheckInAsset extends BaseAsset {
    public name = 'checkIn';
    public id = 3;

    // Define schema for asset
    public schema = {
        $id: 'membership/checkIn-asset',
        title: 'Checkin transaction asset for membership module',
        type: 'object',
        required: [],
        properties: {
            membershipId: {
                dataType: 'string',
                fieldNumber: 1
            }
        },
    };

    public validate({ asset }: ValidateAssetContext<{}>): void {
        // Validate your asset
    }

   
    public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {

        const senderAddress = transaction.senderAddress;

        const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
        const kalipoAccountId = accountIdWrapper?.id

        if (kalipoAccountId == null) {
            throw new Error("No Kalipo account found for this Lisk account")
        }

        // find membership and set the checkin value to true
        const membership = await db.tables.memberships.getRecord(stateStore, asset.membershipId)

        if (membership == null) {
            throw new Error("Membership not found")
        }

        if (membership.accountId != kalipoAccountId) {
            throw new Error("Membership does not belong to this account")
        }

        if (membership.checkedIn) {
            throw new Error("You are already checked in")
        }

        membership.checkedIn = true;

        await db.tables.membership.updateRecord(stateStore, asset.membershipId, membership)

        // create an poa issue for the first poa in the auton
        const auton = await db.tables.auton.getRecord(stateStore, membership.autonId)

        if (auton == null) {
            throw new Error("Auton not found")
        }

        const poaId = auton.poas[0]

        if (poaId == null) {
            throw new Error("Auton does not have a poa")
        }

        const now: BigInt = (BigInt)(new Date().getTime());

        const poaIssue: PoaIssue = {
            accountId: kalipoAccountId,
            poaId: poaId,
            membershipId: asset.membershipId,
            issueDate: now,
        }

        const poaIssueRowContext: RowContext = new RowContext;
        const poaIssueId: string = await db.tables.poaIssue.createRecord(stateStore, transaction, poaIssue, poaIssueRowContext)

        const poa = await db.tables.poa.getRecord(stateStore, poaId)

        if (poa == null) {
            throw new Error("Poa not found")
        }

        poa.issuedPoas.push(poaIssueId)
        await db.tables.poa.updateRecord(stateStore, poaId , poa)


        const receiverAccount = await db.tables.kalipoAccount.getRecord(stateStore, kalipoAccountId)

        if (receiverAccount == null) {
            throw new Error("Kalipo account not found")
        }

        receiverAccount?.issuedPoas.push(poaIssueId);
        await db.tables.kalipoAccount.updateRecord(stateStore, kalipoAccountId, receiverAccount)

        const mship = await db.tables.membership.getRecord(stateStore, asset.membershipId)

        if (mship != null) {
            if (mship?.autonId == poa.autonId) {

                mship?.poasIssued.push(poaIssueId);
                await db.tables.membership.updateRecord(stateStore, asset.membershipId, mship)

                // update membership id
                const poaIssue = await db.tables.poaIssue.getRecord(stateStore, poaIssueId)
                if (poaIssue != null) {
                    poaIssue.membershipId = asset.membershipId;

                    await db.tables.poaIssue.updateRecord(stateStore, poaIssueId, poaIssue);
                }
            }
        }
    }
}