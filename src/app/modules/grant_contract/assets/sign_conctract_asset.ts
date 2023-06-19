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
    };

  	public validate({ asset }: ValidateAssetContext<{}>): void {
        if (asset.editFase == undefined ||
        asset.status == "" || asset.status == undefined || 
        asset.type == "" || asset.type == undefined || 
        (asset.fullySigned !== true || asset.fullySigned !== false) || 
        asset.date == "" || asset.date == undefined || !new Date(asset.date) || 
        asset.formData?.title == "" || asset.formData?.title == undefined || 
        asset.formData?.parties?.client?.length > 0 || 
        asset.formData?.parties?.contractor?.length > 0 || 
        asset.formData?.preample == "" || asset.formData?.preample == undefined || 
        asset.formData?.productDescription == "" || asset.formData?.productDescription == undefined || 
        asset.formData?.purpose == "" || asset.formData?.purpose == undefined || 
        asset.formData?.payment?.amount == undefined || 
        asset.formData?.dates?.startDate == "" || asset.formData?.dates?.startDate == undefined || !new Date(asset.formData?.dates?.startDate) ||
        asset.formData?.dates?.endDate == "" || asset.formData?.dates?.endDate == undefined || !new Date(asset.formData?.dates?.endDate) ||
        asset.formData?.dates?.signingDate == "" || asset.formData?.dates?.signingDate == undefined || !new Date(asset.formData?.dates?.signingDate) ||
        asset.formData?.propertyRights == "" || asset.formData?.propertyRights == undefined || 
        asset.formData?.terminationOfAgreement == "" || asset.formData?.terminationOfAgreement == undefined || 
        asset.formData?.governingLawAndJurisdiction == "" || asset.formData?.governingLawAndJurisdiction == undefined || 
        asset.formData?.finalProvisions == "" || asset.formData?.finalProvisions == undefined || 
        (asset.formData?.requiredToSign !== true || asset.formData?.requiredToSign !== false) || 
        (asset.formData?.signed !== true || asset.formData?.signed !== false)) {
			throw new Error('One of the values is not correct/filled in');
		}
		
		if(asset.editFase <= 0 ||
        asset.payment?.amount < 0 ||
        Date.parse(asset.date) < Date.now() ||
        Date.parse(asset.dates?.startDate) < Date.now() ||
        Date.parse(asset.dates?.signingDate) < Date.now() ||
        Date.parse(asset.dates?.endDate) <= Date.parse(asset.dates?.startDate)
        ) {
            throw new Error('One of the values is not correct')
        }
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
