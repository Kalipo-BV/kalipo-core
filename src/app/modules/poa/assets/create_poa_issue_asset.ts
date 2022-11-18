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
        title: 'CreatePoaAsset transaction asset for poa module',
        type: 'object',
        required: ["poaId", "receiverAddress"],
        properties: {
            receiverAddress: {
                dataType: 'string',
                fieldNumber: 1,
            },
            poaId: {
                dataType: 'string',
                fieldNumber: 2,
            }
        },
    }

    public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}



	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {

        const poa = await db.tables.poa.getRecord(stateStore, asset.poaId);


        if ( poa == null ) {
            throw new Error(`Auton can not be found`);
        }

        const now: BigInt = (BigInt)(new Date().getTime());

        if (asset.receiverAddress == null) {
            asset.receiverAddress = transaction.senderAddress.toString('hex');
        }

        const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, asset.receiverAddress)
		const kalipoAccountId = accountIdWrapper?.id

        
        if (kalipoAccountId == null) {
            throw new Error(`Lisk account can not be found`);
        } 

        const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, kalipoAccountId);
        
        if (kalipoAccount == null) {
            throw new Error(`Only the creator of the Poa can create issues`);
        }

        const membershipsId = kalipoAccount.memberships;
        const auton = await db.tables.auton.getRecord(stateStore, poa.autonId); 

        if (auton == null) {
            throw new Error(`Auton can not be found`);
        }


        let validMembership = membershipsId.find((id) => auton.memberships.includes(id) );

        if (validMembership == null) {
            throw new Error(`Only members of the event can receive poas`);
        }


        console.log("BIG 1");
        

        const poaIssue: PoaIssue = {
            accountId: kalipoAccountId,
            poaId: asset.poaId,
            membershipId: asset.membershipId,
            issueDate: now,
        }

        
        const poaIssueRowContext: RowContext = new RowContext;
        const poaIssueId: string = await db.tables.poaIssue.createRecord(stateStore, transaction, poaIssue, poaIssueRowContext);

        console.log("BIG 2");

        let allPoaIssueIds = await db.indices.fullTable.getRecord(stateStore, "poaIssues");

		if (allPoaIssueIds == null) {
			const index = { ids: [poaIssueId] }
			console.log(index)
			await db.indices.fullTable.setRecord(stateStore, "poaIssues", index)
		} else {
			allPoaIssueIds.ids.push(poaIssueId)
			await db.indices.fullTable.setRecord(stateStore, "poaIssues", allPoaIssueIds)
		}

        console.log("BIG 3");


        poa.issuedPoas.push(poaIssueId);
		await db.tables.poa.updateRecord(stateStore, asset.poaId, poa)

        kalipoAccount.issuedPoas.push(poaIssueId);
        await db.tables.kalipoAccount.updateRecord(stateStore, kalipoAccountId, kalipoAccount)
    }
}
