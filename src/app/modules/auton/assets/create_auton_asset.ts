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

export class CreateAutonAsset extends BaseAsset {
	public name = 'createAuton';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'auton/createAuton-asset',
		title: 'CreateAutonAsset transaction asset for auton module',
		type: 'object',
		required: [],
		properties: {
			name: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 20
			},
			subtitle: {
				dataType: 'string',
				fieldNumber: 2,
				maxLength: 50
			},
			icon: {
				dataType: 'string',
				fieldNumber: 3,
				maxLength: 50
			},
			mission: {
				dataType: 'string',
				fieldNumber: 4,
				maxLength: 1024
			},
			vision: {
				dataType: 'string',
				fieldNumber: 5,
				maxLength: 1024
			},
			tags: {
				type: "array",
				fieldNumber: 6,
				maxItems: 5,
				items: {
					dataType: "string",
					maxLength: 16
				}
			},
			bulkInviteAccountIds: {
				type: "array",
				fieldNumber: 7,
				maxItems: 25,
				items: {
					dataType: "string",
					maxLength: 128
				}
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset

	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const senderAddress = transaction.senderAddress;
		console.log("CHECK THIS IDDDDD")
		console.log(senderAddress)
		console.log(transaction)

		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		const alreadyRegisteredAuton = await db.indices.autonName.getRecord(stateStore, asset.name);
		if (alreadyRegisteredAuton !== null) {
			throw new Error("Oops this auton name is already taken")
		}
		// Get bulk kalipoAccounts to check if they exists
		const bulkAccounts: Array<KalipoAccount> = [];
		const bulkAccountsCheckList: Array<string> = [];
		let multipleInvitesToSameAccount = false;
		if (asset.bulkInviteAccountIds !== undefined) {
			for (let index = 0; index < asset.bulkInviteAccountIds.length; index++) {
				const id = asset.bulkInviteAccountIds[index];
				if (bulkAccountsCheckList.indexOf(id) == -1) {
					bulkAccountsCheckList.push(id)
				} else {
					multipleInvitesToSameAccount = true;
					break;
				}

				const acc: KalipoAccount | null = await db.tables.kalipoAccount.getRecord(stateStore, id)
				if (acc !== null) {
					acc.id = id;
					bulkAccounts.push(acc)
				}

			}
		}

		if (multipleInvitesToSameAccount) {
			throw new Error("Cannot send multiple invites to the same account")
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
			accountId: accountId,
			autonId: db.tables.auton.getDeterministicId(transaction, 0),
			invitation: membershipInvitation,
			votes: [],
			comments: [],
			commentLikes: [],
			commentDislikes: [],
			proposals: []
		}
		console.log("Big 2")


		// Setting row contexts for each id for the total amount of accounts 
		const memberships: Array<string> = [db.tables.membership.getDeterministicId(transaction, 0)];
		for (let index = 0; index < bulkAccounts.length; index++) {
			memberships.push(db.tables.membership.getDeterministicId(transaction, index + 1));
		}

		// Create current proposal types
		// Set template...	
		const constitution: Array<ProposalTypeConstitution> = []
		for (const provisionRowContext = new RowContext(); provisionRowContext.getNonce() < templates.starter.length; provisionRowContext.increment()) {
			const provisions = templates.starter[provisionRowContext.getNonce()];
			const id = await db.tables.provisions.createRecord(stateStore, transaction, provisions, provisionRowContext)
			const porposalType: ProposalTypeConstitution = { type: provisions.type, provisions: [id] }
			constitution.push(porposalType)
		}

		const auton: Auton = {
			memberships: memberships,
			autonProfile: {
				name: asset.name,
				subtitle: asset.subtitle,
				icon: asset.icon,
				mission: asset.mission,
				vision: asset.vision,
				foundingDate: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)
			},
			tags: asset.tags,
			constitution: constitution,
			proposals: [],
			transaction: transaction.id.toString('hex')
		}
		console.log("Big 3")


		const autonRowContext: RowContext = new RowContext;
		const autonId: string = await db.tables.auton.createRecord(stateStore, transaction, auton, autonRowContext)

		const membershipRowContext: RowContext = new RowContext;
		const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, membership, membershipRowContext)

		await db.indices.autonName.setRecord(stateStore, asset.name, { id: autonId })

		let allAutonIds = await db.indices.fullTable.getRecord(stateStore, "autons");

		if (allAutonIds == null) {
			const index = { ids: [autonId] }
			console.log(index)
			await db.indices.fullTable.setRecord(stateStore, "autons", index)
		} else {
			allAutonIds.ids.push(autonId)
			await db.indices.fullTable.setRecord(stateStore, "autons", allAutonIds)
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		if (kalipoAccount !== null) {
			kalipoAccount?.memberships.push(membershipId)
			await db.tables.kalipoAccount.updateRecord(stateStore, accountId, kalipoAccount)
		}

		for (let index = 0; index < asset.tags.length; index++) {
			const tag: string = asset.tags[index];
			const currentIndexState = await db.indices.autonTag.getRecord(stateStore, tag)
			if (currentIndexState !== null) {
				currentIndexState?.ids.push(autonId)
				await db.indices.autonTag.setRecord(stateStore, tag, currentIndexState)
			} else {
				await db.indices.autonTag.setRecord(stateStore, tag, { ids: [autonId] })
			}
		}

		// Bulk invite
		for (let index = 0; index < bulkAccounts.length; index++) {
			const bulkKalipoAccount = bulkAccounts[index];
			if (bulkKalipoAccount !== null) {
				const bulkMembershipInvitation: MembershipInvitation = {
					validStart: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
					validEnd: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
					accepted: BigInt(0),
					refused: BigInt(0),
					proposalId: "Founder invitation",
					message: "Founder"
				}

				console.log("Big 4")


				const bulkMembership: Membership = {
					started: BigInt(0),
					accountId: bulkKalipoAccount.id,
					autonId: db.tables.auton.getDeterministicId(transaction, autonRowContext.getNonce()),
					invitation: bulkMembershipInvitation,
					votes: [],
					comments: [],
					commentLikes: [],
					commentDislikes: [],
					proposals: []
				}
				console.log("Big 5")


				membershipRowContext.increment();

				const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, bulkMembership, membershipRowContext)

				bulkKalipoAccount.memberships.push(membershipId)
				await db.tables.kalipoAccount.updateRecord(stateStore, bulkKalipoAccount.id, bulkKalipoAccount)

			}

		}

	}
}
