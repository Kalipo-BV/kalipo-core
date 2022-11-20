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

export class AddMemberAsset extends BaseAsset {
    public name = 'addMember';
    public id = 2;

    // Define schema for asset
    public schema = {
        $id: 'membership/addMember-asset',
        title: 'AddMemberAsset transaction asset for membership module',
        type: 'object',
        required: [],
        properties: {
            receiverAddress: {
                dataType: 'string',
                fieldNumber: 1,
            },
            autonId: {
                dataType: 'string',
                fieldNumber: 2
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

        // Founder membership is automaticly set as accepted
        const membershipInvitation: MembershipInvitation = {
            validStart: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
            validEnd: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
            accepted: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
            refused: BigInt(0),
            proposalId: "Founder invitation",
            message: "Founder"
        }
        console.log(BigInt(stateStore.chain.lastBlockHeaders[0].timestamp))
        console.log("Big 1")


        const membership: Membership = {
            started: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
            accountId: asset.receiverAddress,
            autonId: db.tables.auton.getDeterministicId(transaction, 0),
            invitation: membershipInvitation,
            votes: [],
            comments: [],
            commentLikes: [],
            commentDislikes: [],
            proposals: [],
            role: RoleEnum.AFFILIATE_MEMBER,
            poasIssued: []
        }


        const membershipRowContext: RowContext = new RowContext;
        const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, membership, membershipRowContext);

        const auton = await db.tables.auton.getRecord(stateStore, asset.autonId);

        if (auton == null) {
            throw new Error("Auton 404")
        }

        auton.memberships.push(membershipId);

        await db.tables.auton.updateRecord(stateStore, asset.autonId, auton)

        const receiverAccount = await db.tables.kalipoAccount.getRecord(stateStore, asset.receiverAddress)

        if (receiverAccount !== null) {
            receiverAccount?.memberships.push(membershipId)
            await db.tables.kalipoAccount.updateRecord(stateStore, asset.receiverAddress, receiverAccount)
        }

        console.log(auton)

    }
}