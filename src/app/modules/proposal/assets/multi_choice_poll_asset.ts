import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { MembershipValidationError, ProposalType } from '../../../database/enums';

export class MultiChoicePollAsset extends BaseAsset {
	public name = 'MultiChoicePoll';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'proposal/MultiChoicePoll-asset',
		title: 'MultiChoicePollAsset transaction asset for proposal module',
		type: 'object',
		required: ["title", "proposalType", "autonId", "question", "answers", "addedValue"],
		properties: {
			title: {
				dataType: 'string',
				fieldNumber: 1,
				minLength: 2,
				maxLength: 32,
			},
			proposalType: {
				dataType: 'string',
				fieldNumber: 2,
				maxLength: 256,
			},
			autonId: {
				dataType: 'string',
				fieldNumber: 3,
				maxLength: 256,
			},
			question: {
				dataType: 'string',
				fieldNumber: 4,
			},
			answers: {
				type: 'array',
				fieldNumber: 5,
				items: {
					type: 'string'
				}
			},
			addedValue: {
				dataType: 'string',
				fieldNumber: 6
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const TYPE = ProposalType.MULTI_CHOICE_POLL
		//  Get latest provision for auton by proposal type membership-invtitation
		const senderAddress = transaction.senderAddress;

		//Kalipo account
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		const accountId = accountIdWrapper?.id

		if (accountId == null) {
			throw new Error("No Kalipo account found for this Lisk account")
		}

		const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// Auton
		const auton = await db.tables.auton.getRecord(stateStore, asset.autonId)
		if (auton == null) {
			throw new Error("The auton cannot be found")
		}

		// Membership
		const membershipCheck = await db.tables.membership.validateMembership(kalipoAccount, asset.autonId, stateStore);
		const submitterMembershipId: string | null = membershipCheck.membershipId

		if (membershipCheck.error == MembershipValidationError.ACCOUNT_NOT_FOUND) {
			throw new Error("No Kalipo account found")
		}

		if (membershipCheck.error == MembershipValidationError.NO_ACTIVE_MEMBERSHIP) {
			throw new Error("You need a membership to submit new proposals")
		}

		if (membershipCheck.error == MembershipValidationError.OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED) {
			throw new Error("You aren't member yet, you still need to accept the invitation")
		}
		
		
	}
}
