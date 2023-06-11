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

import { ChainStateStore } from '@liskhq/lisk-chain/dist-node/state_store/chain_state_store';
import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';
import { db } from '../../../database/db';
import { AutonTypeEnum, checkStatus, RoleEnum } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { Auton, ProposalTypeConstitution } from '../../../database/table/auton_table';
import { Dao } from '../../../database/table/dao_table';
import { KalipoAccount } from '../../../database/table/kalipo_account_table';
import { Membership, MembershipInvitation } from '../../../database/table/membership_table';
import { templates } from '../../../database/templates';
import { VALID_INVITATION_WINDOW } from '../../membership/membership_module';

export class CreateDaoAsset extends BaseAsset {
	public name = 'createDao';
	public id = 0;

	public schema = {
		$id: 'auton/createAuton-asset',
		title: 'CreateAutonAsset transaction asset for auton module',
		type: 'object',
		required: ["name", "governingAutonName", "icon"],
		properties: {
			name: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 20
			},
			governingAutonName: {
				dataType: 'string',
				fieldNumber: 2,
				minLength: 2,
				maxLength: 20
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
			linkedChannels: {
				type: "array",
				fieldNumber: 6,
				maxItems: 5,
				items: {
					type: 'object',
					required: ["channel", "link"],
					properties: {
						channel: {
							dataType: 'string',
							fieldNumber: 1,
							minLength: 2,
							maxLength: 20
						},
						link: {
							dataType: 'string',
							fieldNumber: 2,
							minLength: 2,
							maxLength: 50
						}
					}
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
			},
			hasLegalEntity: {
				dataType: 'boolean',
				fieldNumber: 8
			},
			jurisdiction: {
				dataType: 'string',
				fieldNumber: 9,
				maxLength: 264
			},
			cocId: {
				dataType: 'string',
				fieldNumber: 10,
				maxLength: 128
			},
			businessAddress: {
				dataType: 'string',
				fieldNumber: 11,
				maxLength: 264
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		console.log("OUI")
		console.log(asset)

		const senderAddress = transaction.senderAddress;
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		if (asset.name == asset.governingAutonName) {
			throw new Error("Oops the governing auton name cannot be the same as the DAO name")
		}

		const alreadyRegisteredDao = await db.indices.autonName.getRecord(stateStore, asset.name);
		if (alreadyRegisteredDao !== null) {
			throw new Error("Oops this dao name is already taken")
		}

		const alreadyRegisteredGoverningAuton = await db.indices.autonName.getRecord(stateStore, asset.governingAutonName);
		if (alreadyRegisteredGoverningAuton !== null) {
			throw new Error("Oops the governing auton name is already taken")
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

		const membership: Membership = {
			started: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
			accountId: accountId,
			autonId: db.tables.auton.getDeterministicId(transaction, 0),
			invitation: membershipInvitation,
			votes: [],
			comments: [],
			commentLikes: [],
			commentDislikes: [],
			proposals: [],
			role: RoleEnum.FULL_MEMBER,
			checkedStatus: checkStatus.CHECKEDIN,
			poasIssued: []
		}

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

		const daoId = db.tables.dao.getDeterministicId(transaction, 0);

		const governingAuton: Auton = {
			memberships: memberships,
			autonProfile: {
				name: asset.governingAutonName,
				subtitle: "Governing Auton",
				icon: asset.icon,
				mission: asset.mission,
				vision: asset.vision,
				foundingDate: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
			},
			tags: ["GOVERNING"],
			constitution: constitution,
			proposals: [],
			transaction: transaction.id.toString('hex'),
			type: AutonTypeEnum.GOVERNING,
			poas: [],
			event: {},
			lesson: {},
			daoId: daoId,
			governmentalDocuments: []
		};

		const autonRowContext: RowContext = new RowContext;
		const autonId: string = await db.tables.auton.createRecord(stateStore, transaction, governingAuton, autonRowContext)

		const membershipRowContext: RowContext = new RowContext;
		const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, membership, membershipRowContext)

		// Dao creation
		let dao: Dao = {
			autons: [autonId],
			governingAutonId: autonId,
			daoProfile: {
				name: asset.name,
				subtitle: "DAO",
				icon: asset.icon,
				mission: asset.mission,
				vision: asset.vision,
				foundingDate: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
			},
			contactChannels: asset.linkedChannels,

		}


		dao.legalEntityProfile = {
			jurisdiction: asset.jurisdiction,
			cocId: asset.cocId,
			businessAddress: asset.businessAddress
		}


		const daoIdSuccess: string = await db.tables.dao.createRecord(stateStore, transaction, dao, new RowContext())

		await db.indices.autonName.setRecord(stateStore, asset.governingAutonName, { id: autonId })
		await db.indices.autonName.setRecord(stateStore, asset.name, { id: daoId })

		let allAutonIds = await db.indices.fullTable.getRecord(stateStore, "autons");

		if (allAutonIds == null) {
			const index = { ids: [autonId] }
			await db.indices.fullTable.setRecord(stateStore, "autons", index)
		} else {
			allAutonIds.ids.push(autonId)
			await db.indices.fullTable.setRecord(stateStore, "autons", allAutonIds)
		}

		let allDaoIds = await db.indices.fullTable.getRecord(stateStore, "daos");

		if (allDaoIds == null) {
			const index = { ids: [daoId] }
			await db.indices.fullTable.setRecord(stateStore, "daos", index)
		} else {
			allDaoIds.ids.push(daoId)
			await db.indices.fullTable.setRecord(stateStore, "daos", allDaoIds)
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		if (kalipoAccount !== null) {
			kalipoAccount?.memberships.push(membershipId)
			await db.tables.kalipoAccount.updateRecord(stateStore, accountId, kalipoAccount)
		}

		for (let index = 0; index < governingAuton.tags.length; index++) {
			const tag: string = governingAuton.tags[index];
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

				let bulkMembershipInvitation: MembershipInvitation = {
					validStart: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
					validEnd: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp + VALID_INVITATION_WINDOW),
					accepted: BigInt(0),
					refused: BigInt(0),
					proposalId: "Founder invitation",
					message: "Founder"
				};

				let bulkMembership: Membership = {
					started: BigInt(0),
					accountId: bulkKalipoAccount.id,
					autonId: db.tables.auton.getDeterministicId(transaction, autonRowContext.getNonce()),
					invitation: bulkMembershipInvitation,
					votes: [],
					comments: [],
					commentLikes: [],
					commentDislikes: [],
					proposals: [],
					role: RoleEnum.AFFILIATE_MEMBER,
					poasIssued: []
				};

				if (asset.type == AutonTypeEnum.LESSON) {
					bulkMembership.started = BigInt(stateStore.chain.lastBlockHeaders[0].timestamp)
				}

				membershipRowContext.increment();
				console.log("Big 5.1")

				const membershipId: string = await db.tables.membership.createRecord(stateStore, transaction, bulkMembership, membershipRowContext)
				console.log("Big 5.2")
				bulkKalipoAccount.memberships.push(membershipId)

				await db.tables.kalipoAccount.updateRecord(stateStore, bulkKalipoAccount.id, bulkKalipoAccount)
			}
		}
	}
}
