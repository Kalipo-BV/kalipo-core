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
		required: ["tid", "version"],
		properties: {
			tid: {
				dataType: "string",
				fieldNumber: 1,
			},
			version: {
				dataType: "uint32",
				fieldNumber: 2,
			}
		},
	};

	private _getSingInfo(data, asset) {
		const singInfo = data?.agreementVersion[asset.version - 1].signedBy
		let signInfo = {};

		signInfo[data?.creator] = {name: (data?.creator)?.name, signed: singInfo.includes(data?.creator)};
		data?.contractor.forEach(element => {
			signInfo[element] = {name: element?.name, signed: singInfo.includes(element)};
		});
		data?.client.forEach(element => {
			signInfo[element] = {name: element?.name, signed: singInfo.includes(element)};
		});
		
		return signInfo;
	}

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

		//all members/parties + singed info
		let singInfo = this._getSingInfo(existingAgreement, asset);

		//signed members/parties 
		const signees = existingAgreement?.agreementVersion[asset.version - 1]?.signedBy;

		if (existingAgreement !== null) {
			if(!signees?.includes(accountId)) {
				signees?.push(accountId);
			}
			
			if (asset.tid) {
				await db.tables.agreementTable.updateRecord(stateStore, asset.tid, existingAgreement);
			}
		}

		// update singInfo
		singInfo = this._getSingInfo(existingAgreement, asset);

		if(Object.values(singInfo).every(result => result.signed)) {
			//add logic for if every one agrees.
		}
	}
}
