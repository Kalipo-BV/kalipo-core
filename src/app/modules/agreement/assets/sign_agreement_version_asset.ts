import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';

export class SignAgreementVersionAsset extends BaseAsset {
	public name = 'SignAgreementVersion';
  	public id = 2;

  // Define schema for asset
	public schema = {
		$id: 'agreement/SignAgreementVersion-asset',
		title: 'SignAgreementVersionAsset transaction asset for agreement module',
		type: 'object',
		required: ["tid"],
		properties: {
			tid: {
				dataType: "string",
				fieldNumber: 1,
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
 	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const senderAddress = transaction.senderAddress;

		//creator
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'));
		let accountId = accountIdWrapper?.id;

		//agreement id = asset.tid
		const existingAgreement = await db.tables.agreementTable.getRecord(stateStore, asset.tid?.toString('hex'));

		if (existingAgreement !== null) {
			if(!existingAgreement?.agreementVersion?.signedBy.includes(accountId)) {
				existingAgreement?.agreementVersion?.signedBy?.push(accountId);
			}
			
			if (asset.tid) {
				await db.tables.agreementTable.updateRecord(stateStore, asset.tid, existingAgreement);
			}
		}

	}
}
