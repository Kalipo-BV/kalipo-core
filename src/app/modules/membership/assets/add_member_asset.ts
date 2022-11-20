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
			receiverAddresses: {
				type: "array",
				fieldNumber: 1,
				maxItems: 10,
				items: {
					dataType: "string",
					maxLength: 128
				}
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
        
        const receiverAddressesToInvite: Array<KalipoAccount> = [];
        const receiverAddressesCheckList: Array<string> = [];
        let multipleInvitesToSameAccount = false;
        if (asset.receiverAddresses !== undefined) {
            for (let index = 0; index < asset.receiverAddresses.length; index++) {
                const id = asset.receiverAddresses[index];
                if (receiverAddressesCheckList.indexOf(id) == -1) {
					receiverAddressesCheckList.push(id)
				} else {
					multipleInvitesToSameAccount = true;
					break;
				}

				const acc: KalipoAccount | null = await db.tables.kalipoAccount.getRecord(stateStore, id)
				if (acc !== null) {
					acc.id = id;
					receiverAddressesToInvite.push(acc)
				}
            }
        }
        
        if (multipleInvitesToSameAccount) {
			throw new Error("Cannot send multiple invites to the same account")
		}

        const memberships: Array<string> = [];
        for (let index = 0; index < receiverAddressesToInvite.length; index++) {
			memberships.push(db.tables.membership.getDeterministicId(transaction, index + 1));
		}

        const membershipRowContext: RowContext = new RowContext;

        for (let index=0;index < receiverAddressesToInvite.length;index++) {
            const receiverAddress = receiverAddressesToInvite[index];
            if (receiverAddress !== null) {
                const membershipInvite: MembershipInvitation = {
                    validStart: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
                    validEnd: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
                    accepted: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
                    refused: BigInt(0),
                    proposalId: "Founder invitation",
                    message: "Founder"
                }

                const membership: Membership = {
					started: BigInt(0),
					accountId: receiverAddress.id,
					autonId: asset.autonId,
					invitation: membershipInvite,
					votes: [],
					comments: [],
					commentLikes: [],
					commentDislikes: [],
					proposals: [],
                    poasIssued: []
				}

                membershipRowContext.increment();
                const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, membership, membershipRowContext);

                receiverAddress.memberships.push(membershipId)
				await db.tables.kalipoAccount.updateRecord(stateStore, receiverAddress.id, receiverAddress)

            }
        }



        const auton = await db.tables.auton.getRecord(stateStore, asset.autonId);

        if (auton == null) {
            throw new Error("Auton 404")
        }

        for (let index = 0; index < memberships.length;index++) {
            auton.memberships.push(memberships[index]);
        }

        await db.tables.auton.updateRecord(stateStore, asset.autonId, auton)
    }
}