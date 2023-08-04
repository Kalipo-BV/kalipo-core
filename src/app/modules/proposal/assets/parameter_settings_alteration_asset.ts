import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { RowContext } from '../../../database/row_context';
import { ProposalProvisions, ProposalProvisionsI } from '../../../database/table/proposal_provisions_table';

export interface ParameterSettingAlteration {
	autonId: string,
	proposalType: string,
	mandatoryAttendence: number,
	acceptence: number,
	dialogWindow: number,
	votingWindow: number,
	executeWhenFinal: boolean
}

export class ParameterSettingsAlterationAsset extends BaseAsset {
	public name = 'parameterSettingsAlteration';
	public id = 3;

	// Define schema for asset
	public schema = {
		$id: 'proposal/parameterSettingsAlteration-asset',
		title: 'ParameterSettingsAlterationAsset transaction asset for proposal module',
		type: 'object',
		required: [],
		properties: {
			autonId: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 128,
			},
			proposalType: {
				dataType: 'string',
				fieldNumber: 2,
				minLength: 2,
				maxLength: 128,
			},
			mandatoryAttendence: {
				dataType: 'uint32',
				fieldNumber: 3,
				minimum: 0,
				maximum: 100,
			},
			acceptence: {
				dataType: 'uint32',
				fieldNumber: 4,
				minimum: 0,
				maximum: 100,
			},
			dialogWindow: {
				dataType: 'uint32',
				fieldNumber: 5,
				minimum: 0,
				maximum: 43200,
			},
			votingWindow: {
				dataType: 'uint32',
				fieldNumber: 6,
				minimum: 1440,
				maximum: 43200,
			},
			executeWhenFinal: {
				dataType: 'boolean',
				fieldNumber: 7,
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		console.log("Parameter settings alteration started...")
		const input = asset as ParameterSettingAlteration

		const auton = await db.tables.auton.getRecord(stateStore, input.autonId);
		if (auton == null) {
			throw new Error("Auton not found");
		}

		let proposalTypeFound = false;
		for (let index = 0; index < auton.constitution.length; index++) {
			const proposalTypeWrapper = auton.constitution[index];
			if (proposalTypeWrapper.type == input.proposalType) {
				const newProvision: ProposalProvisionsI = {
					type: proposalTypeWrapper.type,
					attendance: input.mandatoryAttendence,
					acceptance: input.acceptence,
					campaigning: BigInt(input.dialogWindow),
					votingWindow: BigInt(input.votingWindow),
					execAfterEnd: !input.executeWhenFinal,
					transactionId: "" + transaction.id
				}
				console.log(newProvision);
				const provisionId = await db.tables.provisions.createRecord(stateStore, transaction, newProvision, new RowContext())
				console.log(provisionId);
				proposalTypeWrapper.provisions.push(provisionId);
				proposalTypeFound = true;
				break;
			}
		}

		if (proposalTypeFound) {
			await db.tables.auton.updateRecord(stateStore, input.autonId, auton);
			console.log("Auton Updated")
		} else {
			console.log("Auton was not updated because proposal type was not found")
		}
	}
}
