import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { Contract } from '../../../database/table/grant_contract_table';
import { RowContext } from '../../../database/row_context';

export class SignConctractAsset extends BaseAsset {
	public name = 'signConctract';
  	public id = 1;

    //   Define schema for asset
	public schema = {
        $id: "kalipo/tables/contract_table",
        type: "object",
        required: ["editFase", "status", "type", "fullySigned", "date", "formData"],
        properties: {
            // contractId: {
            //     dataType: "string",
            //     fieldNumber: 1,
            // },
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
                required: ["parties", "preample", "purpose", "payment", "dates", "propertyRights", "terminationOfAgreement", "governingLawAndJurisdiction", "finalProvisions", "requiredToSign", "signed", "signingWindow"],
                properties: {
                    parties: {
                        type: "object",
                        fieldNumber: 1,
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
                        fieldNumber: 2,
                    },
                    purpose: {
                        dataType: "string",
                        fieldNumber: 3,
                    },
                    payment: {
                        type: "object",
                        fieldNumber: 4,
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
                        fieldNumber: 5,
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
                        fieldNumber: 6,
                    },
                    terminationOfAgreement: {
                        dataType: "string",
                        fieldNumber: 7,
                    },
                    governingLawAndJurisdiction: {
                        dataType: "string",
                        fieldNumber: 8,
                    },
                    finalProvisions: {
                        dataType: "string",
                        fieldNumber: 9,
                    },
                    milestones: {
                        type: "array",
                        fieldNumber: 10,
                        items: {
                            type: "object",
                            // required: ["amount"],
                            // required: [],
                            properties: {
                                info: {
                                    dataType: "string",
                                    fieldNumber: 1,
                                },
                                amount: {
                                    dataType: "uint32",
                                    fieldNumber: 2,
                                },
                            }
                        }
                    },
                    custom: {
                        type: "array",
                        fieldNumber: 11,
                        items: {
                            type: "object",
                            // required: ["type", "info", "data"],
                            // required: [],
                            properties: {
                                type: {
                                    //[FINDME_BAS] not sure if string is right for type (unsure)
                                    dataType: "string",
                                    fieldNumber: 1,
                                },
                                info: {
                                    dataType: "string",
                                    fieldNumber: 2,
                                },
                                data: {
                                    //[FINDME_BAS] type based on ^type, not sure how to do this (?cast)
                                    dataType: "bytes",
                                    fieldNumber: 3,
                                },
                            }
                        }
                    },
                    requiredToSign: {
                        dataType: "boolean",
                        fieldNumber: 12,
                    },
                    signed: {
                        dataType: "boolean",
                        fieldNumber: 13,
                    },
                    signingWindow: {
                        dataType: "string",
                        fieldNumber: 14,
                    },
                }
            },
            // transaction: {
            //     dataType: "string",
            //     fieldNumber: 8,
            // },
        }
    };

  	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

    private _createContract(asset, transaction) {
		// This is the default auton, where poas and event are empty
		// these fields are only needed for the auton type 'event'
        console.log(asset);
        
        let contract: Contract = {
            editFase: asset.editFase,
            status: asset.status,
            type: asset.type,
            fullySigned: asset.fullySigned,
            // signingWindow: asset.signingWindow,
            date: asset.date,
            // formData: {"parties": {"client": asset.grant_contract.parties.client, "contractor": asset.grant_contract.parties.contractor}, "preample": asset.grant_contract.preample, "purpose": asset.grant_contract.purpose, "payment": {"amount": asset.grant_contract.payment.amount, "note": asset.grant_contract.payment.note}, "dates": {"startDate": asset.grant_contract.dates.startDate, "endDate": asset.grant_contract.dates.endDate} , "propertyRights": asset.grant_contract.propertyRights, "terminationOfAgreement": asset.grant_contract.terminationOfAgreement, "governingLawAndJurisdiction": asset.grant_contract.governingLawAndJurisdiction, "finalProvisions": asset.grant_contract.finalProvisions, "milestones": asset.grant_contract.milestones, "custom": asset.grant_contract.custom, "requiredToSign": asset.grant_contract.requiredToSign, "signed": asset.grant_contract.signed, "signingWindow": asset.grant_contract.signingWindow},
            // formData: {"parties": {"client": asset.grant_contract.parties.client, "contractor": asset.grant_contract.parties.contractor}, "preample": asset.grant_contract.preample, "purpose": asset.grant_contract.purpose, "payment": {"amount": asset.grant_contract.payment.amount, "note": asset.grant_contract.payment.note}, "dates": {"startDate": asset.grant_contract.dates.startDate, "endDate": asset.grant_contract.dates.endDate} , "propertyRights": asset.grant_contract.propertyRights, "terminationOfAgreement": asset.grant_contract.terminationOfAgreement, "governingLawAndJurisdiction": asset.grant_contract.governingLawAndJurisdiction, "finalProvisions": asset.grant_contract.finalProvisions, "milestones": asset.grant_contract.milestones, "custom": asset.grant_contract.custom, "requiredToSign": asset.grant_contract.requiredToSign, "signed": asset.grant_contract.signed},
            formData: asset.formData
            // transaction: transaction  
        }

        return contract;
    }

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		// throw new Error('Asset "sign" apply hook is not implemented.');

        //validation?

        const grantContractRowContext: RowContext = new RowContext;
		const grantContract: Contract = this._createContract(asset, transaction)
        const grantContractId: string = await db.tables.grantContractTable.createRecord(stateStore, transaction, grantContract, grantContractRowContext)

        
		let allGrantIds = await db.indices.fullTable.getRecord(stateStore, "grantContracts");

		if (allGrantIds == null) {
			const index = { ids: [grantContractId] }
            console.log("test0001", index);
			await db.indices.fullTable.setRecord(stateStore, "grantContracts", index)
		} else {
			allGrantIds.ids.push(grantContractId)
			await db.indices.fullTable.setRecord(stateStore, "grantContracts", allGrantIds)
		}

        

        // const senderAddress = transaction.senderAddress;
        // const accountIdWrapper = await db.indices.liskId.getRecord(stateStore, senderAddress.toString('hex'))
		// const accountId = accountIdWrapper?.id

		// if (accountId == null) {
		// 	throw new Error("No Kalipo account found for this Lisk account")
		// }

		// const kalipoAccount = await db.tables.kalipoAccount.getRecord(stateStore, accountId)

		// if (kalipoAccount !== null) {
		// 	kalipoAccount?.socials = asset.socials
		// 	await db.tables.kalipoAccount.updateRecord(stateStore, accountId, kalipoAccount)
		// }


    
        //not sure if needed
        // await db.indices.grantContract.setRecord(stateStore, asset.grantContractId, { id: grantContractId })
        // await db.indices.grantContract.setRecord(stateStore, asset.contractId, { id: contractId 
	}
}
