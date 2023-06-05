import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { RowContext } from '../../../database/row_context';

export class SignConctractAsset extends BaseAsset {
	public name = 'signConctract';
  	public id = 1;

    //   Define schema for asset
	public schema = {
        $id: "grant_contract/SignConctract-asset",
        title: 'SignContractAsset transaction asset for grant_contract module',
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
            uuid: {
                dataType: "string",
                fieldNumber: 7,
            }
        }
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
            
        let newContract = {
            editFase: asset.editFase,
            status: asset.status,
            type: asset.type,
            fullySigned: asset.fullySigned,
            // signingWindow: asset.signingWindow,
            date: asset.date,
            formData: asset.formData,
            createdBy: accountId,
            version: 1, 
        };

        let contractId = await db.tables.grantContractTable.createRecord(stateStore, transaction, newContract, new RowContext());
        let allContractIds = await db.indices.fullTable.getRecord(stateStore, "grantContracts");

        if (allContractIds !== null) {
            allContractIds.ids.push(contractId);
        } else {
            allContractIds = {
                ids: [contractId]
            }
        }

        await db.indices.fullTable.setRecord(stateStore, "grantContracts", allContractIds);
    
        await db.indices.contracts.setRecord(stateStore, senderAddress.toString('hex'), {
            id: contractId
        });
	}
}
