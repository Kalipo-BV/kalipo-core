import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { RowContext } from '../../../database/row_context';

export class CreateAgreementAsset extends BaseAsset {
	public name = 'createAgreement';
  	public id = 1;

 	// Define schema for asset
	public schema = {
    	$id: 'agreement/CreateAgreement-asset',
		title: 'CreateAgreementAsset transaction asset for agreement module',
		type: 'object',
		required: ["contractor", "client", "contractorAuton"],
		properties: {
			creator: {
				dataType: "string",
				fieldNumber: 1,
			},
			contractor: {
				type: "array",
				fieldNumber: 2,
				items: {
					dataType: "string",
				}
			},
			client: {
				type: "array",
				fieldNumber: 3,
				items: {
					dataType: "string",
				}
			},
			clientAuton: {
				dataType: "string",
				fieldNumber: 4,
			},
			contractorAuton: {
				dataType: "string",
				fieldNumber: 5,
			},
			agreementVersion: {
				type: "array",
				fieldNumber: 6,
				items: {
					type: "object",
					required: [], //["version", "status", "contract"],
					properties: {
						version: {
							dataType: "uint32",
							fieldNumber: 1,
						},
						status: {
							dataType: "string",
							fieldNumber: 2,
						},
						contract: {
							dataType: "string",
							fieldNumber: 3,
						},
					}
				}
			},
			contract: {
				type: "object",
				fieldNumber: 7,
				required: ["editFase", "status", "type", "fullySigned", "date", "formData"],
				properties: {
					editFase: {
						dataType: "uint32",
						fieldNumber: 1,
					},
					status: {
						dataType: "string",
						fieldNumber: 2,
					},
					type: {
						dataType: "string",
						fieldNumber: 3,
					},
					fullySigned: {
						dataType: "boolean",
						fieldNumber: 4,
					},
					date: {
						dataType: "string",
						fieldNumber: 5,
					},
					formData: {
						type: "object",
						fieldNumber: 6,
						required: ["title", "parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "requiredToSign", "signed"],
						properties: {
							title: {
								dataType: "string",
								fieldNumber: 1,
							},
							parties: {
								type: "object",
								fieldNumber: 2,
								required: ["client", "contractor"],
								properties: {
									client: {
										type: "array",
										fieldNumber: 1,
										items: {
											dataType: "string",
										}
									},
									contractor: {
										type: "array",
										fieldNumber: 2,
										items: {
											dataType: "string",
										}
									},
								},
							},
							preample: {
								dataType: "string",
								fieldNumber: 3,
							},
							purpose: {
								dataType: "string",
								fieldNumber: 4,
							},
							payment: {
								type: "object",
								fieldNumber: 5,
								required: ["amount"],
								properties: {
									amount: {
										dataType: "uint32",
										fieldNumber: 1,
									},
									note: {
										dataType: "string",
										fieldNumber: 2,
									},
								}
							},
							dates: {
								type: "object",
								fieldNumber: 6,
								required: ["startDate", "endDate", "signingDate"],
								properties: {
									startDate: {
										dataType: "string",
										fieldNumber: 1,
									},
									endDate: {
										dataType: "string",
										fieldNumber: 2,
									},
									signingDate: {
										dataType: "string",
										fieldNumber: 3,
									},
								}
							},
							propertyRights: {
								dataType: "string",
								fieldNumber: 7,
							},
							terminationOfAgreement: {
								dataType: "string",
								fieldNumber: 8,
							},
							governingLawAndJurisdiction: {
								dataType: "string",
								fieldNumber: 9,
							},
							finalProvisions: {
								dataType: "string",
								fieldNumber: 10,
							},
							requiredToSign: {
								dataType: "boolean",
								fieldNumber: 11,
							},
							signed: {
								dataType: "boolean",
								fieldNumber: 12,
							},
							productDescription: {
								dataType: "string",
								fieldNumber: 13,
							}
						}
					},
				}
			},
			status: {
				dataType: "string",
				fieldNumber: 8,
			},
			tid: {
				dataType: "string",
				fieldNumber: 9,
			}
		},
  	};

	private async checkAccount(account, stateStore) {
		// creator contractor", "client
		const accountIdWrapper = await db.tables.kalipoAccount.getRecord(stateStore, account.toString('hex'));
		if (accountIdWrapper == null || accountIdWrapper == undefined) {
			throw new Error("Kalipo account: "+ account + "; not found.");
		}
	}

	public validate({ asset }: ValidateAssetContext<{}>): void {
		if (
		// asset.creator == "" || asset.creator == undefined ||
		asset.contractor?.length <= 0 ||
		asset.client?.length <= 0
		// asset.clientAuton == "" || asset.clientAuton == undefined ||
		// asset.contractorAuton == "" || asset.contractorAuton == undefined
		) {
			throw new Error('One of the values is not correct/filled in');
		} 
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {		
		const senderAddress = transaction.senderAddress;

        //creator
		const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'));
		let accountId = accountIdWrapper?.id;

		//clientAuton id !!!!
		const clientAutonIdWrapper = await db.indices.autonUuid.getRecord(stateStore, senderAddress.toString('hex'));
		let clientAutonId = clientAutonIdWrapper?.id;

		//check parties/people
		await this.checkAccount(accountId, stateStore);
		asset.client.forEach(async element => {await this.checkAccount(element, stateStore);});
		asset.contractor.forEach(async element => {await this.checkAccount(element, stateStore);});

        //agreement id
		let agreementId = asset.tid;
		console.log(agreementId);

		//create contract
		const contractId = await db.tables.grantContractTable.createRecord(stateStore, transaction, asset.contract, new RowContext());

		//create new if not exits else update
		if (agreementId == undefined || agreementId == "") {
			let newAgreementVersion = [{version: 1, status: asset.status, signedBy: [accountId], contract: contractId}],

            newAgreement = {
				creator: accountId,
				contractor: asset.contractor,
				client: asset.client,
				clientAuton: clientAutonId,
				contractorAuton: asset.contractorAuton,
				agreementVersion: newAgreementVersion,
			}

			agreementId = await db.tables.agreementTable.createRecord(stateStore, transaction, newAgreement, new RowContext());
			let allAgreementIds = await db.indices.fullTable.getRecord(stateStore, "agreements");

			if (allAgreementIds !== null) {
				allAgreementIds.ids.push(agreementId);
			} else {
				allAgreementIds = {
					ids: [agreementId]
				}
			}
			
			await db.indices.fullTable.setRecord(stateStore, "agreements", allAgreementIds);
        } else {
			const existingAgreement = await db.tables.agreementTable.getRecord(stateStore, agreementId.toString('hex'))

			if (existingAgreement !== null) {
				
				existingAgreement.agreementVersion.push({version: (existingAgreement.agreementVersion.length + 1), status: asset.status, signedBy: [accountId], contract: contractId});

				existingAgreement.creator = accountId;
				existingAgreement.contractor = asset.contractor;
				existingAgreement.client = asset.client;
				existingAgreement.clientAuton = clientAutonId;
				existingAgreement.contractorAuton = asset.contractorAuton;

				if (agreementId) {
					await db.tables.agreementTable.updateRecord(stateStore, agreementId, existingAgreement)
				}
			}
        }

		await db.indices.agreements.setRecord(stateStore, senderAddress.toString('hex'), {
			id: agreementId
		});

		// let allAgreementIds = await db.indices.fullTable.getRecord(stateStore, "agreements");
		// await db.indices.fullTable.setRecord(stateStore, "agreements", allAgreementIds);
		
		// console.log("E")
	}
}
