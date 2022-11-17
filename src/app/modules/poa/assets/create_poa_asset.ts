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


export class CreatePoaAsset extends BaseAsset {

    public name = 'createPoa';
    public id = 0;

    public schema = {
        $id: 'poa/createPoa-asset',
        title: 'CreatePoaAsset transaction asset for poa module',
        type: 'object',
        required: ["autonId", "name"],
        properties: {
            autonId: {
                dataType: 'string',
                fieldNumber: 1,
            },
            name: {
                dataType: 'string',
                fieldNumber: 2,
            },  
            staticImageId: {
                dataType: 'string',
                fieldNumber: 3,
            }
        },
    }

    public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}


    // VRAGEN
    // Wanneer wordt de apply functie aangeroepen?
    // Waar wordt het op de blockhain opgeslagen?



	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
        // create a new Poa
        const auton =  await db.tables.auton.getRecord( stateStore, asset.autonId );

        if ( auton == null ) {
            throw new Error(`Auton can not be found`);
        }

        const poa: Poa = {
            autonId: asset.autonId,
            name: asset.name,
            staticImageId: asset.staticImageId,
            issuedPoas: [],
        }

        
        const poaRowContext: RowContext = new RowContext;
        const poaId: string = await db.tables.poa.createRecord(stateStore, transaction, poa, poaRowContext);


        await db.indices.poaName.setRecord(stateStore, asset.name, {id: poaId}) 


        let allPoaIds = await db.indices.fullTable.getRecord(stateStore, "poas");

		if (allPoaIds == null) {
			const index = { ids: [poaId] }
			console.log(index)
			await db.indices.fullTable.setRecord(stateStore, "poas", index)
		} else {
			allPoaIds.ids.push(poaId)
			await db.indices.fullTable.setRecord(stateStore, "poas", allPoaIds)
		}

        auton.poas.push(poaId);
		await db.tables.auton.updateRecord(stateStore, asset.autonId, auton)

    }
}
