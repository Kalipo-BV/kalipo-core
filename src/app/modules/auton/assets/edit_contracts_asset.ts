import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';

export class EditContractsAsset extends BaseAsset {
	public name = 'EditContracts';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'auton/EditContracts-asset',
		title: 'EditContractsAsset transaction asset for auton module',
		type: 'object',
		required: ["contract"],
		properties: {
			contract: {
				type: "object",
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
						// required: ["parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "milestones", "custom", "requiredToSign", "signed", "signingWindow"],
						required: ["title", "parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "requiredToSign", "signed", "signingWindow"],
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
								required: ["startDate", "endDate"],
								properties: {
									startDate: {
										//[FINDME_BAS] not sure if string is the correct type for dates
										dataType: "string",
										fieldNumber: 1,
									},
									endDate: {
										dataType: "string",
										fieldNumber: 2,
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
							// milestones: {
							//     type: "array",
							//     fieldNumber: 10,
							//     items: {
							//         type: "object",
							//         // required: ["amount"],
							//         required: [],
							//         properties: {
							//             info: {
							//                 dataType: "string",
							//                 fieldNumber: 1,
							//             },
							//             amount: {
							//                 dataType: "uint32",
							//                 fieldNumber: 2,
							//             },
							//         }
							//     }
							// },
							// custom: {
							//     type: "array",
							//     fieldNumber: 11,
							//     items: {
							//         type: "object",
							//         // required: ["type", "info", "data"],
							//         required: [],
							//         properties: {
							//             type: {
							//                 //[FINDME_BAS] not sure if string is right for type (unsure)
							//                 dataType: "string",
							//                 fieldNumber: 1,
							//             },
							//             info: {
							//                 dataType: "string",
							//                 fieldNumber: 2,
							//             },
							//             data: {
							//                 //[FINDME_BAS] type based on ^type, not sure how to do this (?cast)
							//                 dataType: "bytes",
							//                 fieldNumber: 3,
							//             },
							//         }
							//     }
							// },
							requiredToSign: {
								dataType: "boolean",
								fieldNumber: 11,
							},
							signed: {
								dataType: "boolean",
								fieldNumber: 12,
							},
							signingWindow: {
								dataType: "string",
								fieldNumber: 13,
							},
						}
					},
					// transaction: {
					//     dataType: "string",
					//     fieldNumber: 8,
					// },
				}
			
			}
		}
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	private _addGrantContract(auton, asset) {
		auton?.contracts.grant_contracts.forEach(grant => {
			if(grant.id = asset.contract.id) {
				grant.updateRecord
			}
		});
		
		auton?.contracts.grant_contracts.push(asset.contract);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
  	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		console.log("-----------------------APPLY FUNC EDIT CONTRACTS (ASSET) IN AUTON (ASSET) -----------------------")
		
		//get auton 
		const senderAddress = transaction.senderAddress;
		const autonIdWrapper = await db.indices.autonUuid.getRecord(stateStore, senderAddress.toString('hex'));4
		const autonId = autonIdWrapper?.id;
		const auton = await db.tables.auton.getRecord(stateStore, autonId);

		//add more types of contracts here
		this._addGrantContract(auton, asset);

		//update database
		await db.tables.auton.updateRecord(stateStore, autonId, auton)
	}
}
