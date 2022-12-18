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
        const accountId = accountIdWrapper?.id

        if (accountId == null) {
            throw new Error("No Kalipo account found for this Lisk account")
        }

        // find membership and set the checkin value to true
        const membership = await db.tables.memberships.getRecord(stateStore, asset.membershipId)

        if (membership == null) {
            throw new Error("Membership not found")
        }

        if (membership.accountId != accountId) {
            throw new Error("Membership does not belong to this account")
        }

        if (membership.checkedIn) {
            throw new Error("You are already checked in")
        }

        membership.checkedIn = true;

        await db.tables.membership.updateRecord(stateStore, asset.membershipId, membership)

        
    }
}