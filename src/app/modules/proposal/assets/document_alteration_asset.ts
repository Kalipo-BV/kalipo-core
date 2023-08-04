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

import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { db } from '../../../database/db';
import { ChangesEnum, GovernmentalSectionEnum, MutationEnum } from '../../../database/enums';
import { RowContext } from '../../../database/row_context';
import { GovernmentalDocument } from '../../../database/table/governmental_document_table';
import { GovernmentalEntry } from '../../../database/table/governmental_entry';
import { GovernmentalEntryMutation, GovernmentalPositionTreeWrapper, GovernmentalVersion } from '../../../database/table/governmental_version_table';

export interface DocumentAlterationMutation {
	type: string,
	entryId: string,
	title: string,
	content: string,
}

export interface DocumentAlteration {
	autonId: string,
	documentId: string,
	type: string,
	mutations: Array<DocumentAlterationMutation>,
	trees: Array<GovernmentalPositionTreeWrapper>
}

export class DocumentAlterationAsset extends BaseAsset {
	public name = 'documentAlteration';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'proposal/documentAlteration-asset',
		title: 'DocumentAlterationAsset transaction asset for proposal module',
		type: 'object',
		required: ["autonId", "documentId", "type", "mutations"],
		properties: {
			autonId: {
				dataType: 'string',
				fieldNumber: 1,
				maxLength: 128,
			},
			documentId: {
				dataType: 'string',
				fieldNumber: 2,
				maxLength: 128,
			},
			type: {
				dataType: 'string',
				fieldNumber: 3,
				maxLength: 128,
			},
			mutations: {
				type: "array",
				fieldNumber: 4,
				maxItems: 1000,
				items: {
					type: "object",
					required: [],
					properties: {
						type: {
							dataType: "string",
							fieldNumber: 1,
						},
						entryId: {
							dataType: "string",
							fieldNumber: 2,
						},
						title: {
							dataType: "string",
							fieldNumber: 3,
						},
						content: {
							dataType: "string",
							fieldNumber: 4,
						}
					}
				}
			},
			trees: {
				type: "array",
				fieldNumber: 5,
				items: {
					type: "object",
					required: ["section", "tree"],
					properties: {
						section: {
							dataType: "string",
							fieldNumber: 1,
						},
						tree: {
							type: "array",
							fieldNumber: 2,
							items: {
								type: "object",
								required: ["entryId", "children"],
								properties: {
									entryId: {
										dataType: "string",
										fieldNumber: 1,
									},
									children: {
										type: "array",
										fieldNumber: 2,
										items: {
											type: "object",
											required: ["entryId", "children"],
											properties: {
												entryId: {
													dataType: "string",
													fieldNumber: 1,
												},
												children: {
													type: "array",
													fieldNumber: 2,
													items: {
														type: "object",
														required: ["entryId", "children"],
														properties: {
															entryId: {
																dataType: "string",
																fieldNumber: 1,
															},
															children: {
																type: "array",
																fieldNumber: 2,
																items: {
																	type: "object",
																	required: ["entryId", "children"],
																	properties: {
																		entryId: {
																			dataType: "string",
																			fieldNumber: 1,
																		},
																		children: {
																			type: "array",
																			fieldNumber: 2,
																			items: {
																				type: "object",
																				required: ["entryId"],
																				properties: {
																					entryId: {
																						dataType: "string",
																						fieldNumber: 1,
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	};

	private recursiveTreeUpdate(tree, updateMap) {
		if (updateMap[tree.entryId]) {
			tree.entryId = updateMap[tree.entryId]
		}

		if (tree.children) {
			for (let index = 0; index < tree.children.length; index++) {
				const element = tree.children[index];
				this.recursiveTreeUpdate(element, updateMap)
			}
		}
	}

	private recursiveTreeCollector(tree): Array<string> {
		const result = [tree.entryId]
		console.log(result)

		if (tree.children) {
			for (let index = 0; index < tree.children.length; index++) {
				const element = tree.children[index];
				let tempResult = this.recursiveTreeCollector(element)
				for (let index2 = 0; index2 < tempResult.length; index2++) {
					const rItem = tempResult[index2];
					result.push(rItem)
				}
			}
		}

		return result;
	}

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
		const input = asset as DocumentAlteration

		// Collecting all ids available in the proposing tree to do some validation
		const allIds: Array<string> = []
		for (let index = 0; index < input.trees.length; index++) {
			const treeWrapper = input.trees[index];
			console.log(treeWrapper)
			for (let index2 = 0; index2 < treeWrapper.tree.length; index2++) {
				const tree = treeWrapper.tree[index2];
				const entryIds = this.recursiveTreeCollector(tree)
				console.log(entryIds)
				for (let indexIds = 0; indexIds < entryIds.length; indexIds++) {
					const id = entryIds[indexIds];
					allIds.push(id);
				}

			}

		}

		for (let index = 0; index < input.mutations.length; index++) {
			const mutation = input.mutations[index];
			if (mutation.type != MutationEnum.CREATE && mutation.type != MutationEnum.UPDATE && mutation.type != MutationEnum.DELETE) {
				throw new Error("The type field in a mutation should either be CREATE, UPDATE or DELETE")
			}

			// Check if there are not duplicate entryIds in different mutations
			for (let index2 = 0; index2 < input.mutations.length; index2++) {
				const comparedMutation = input.mutations[index2];
				if (comparedMutation.entryId == mutation.entryId && index != index2) {
					throw new Error("There are multiple mutations with the following entryId: " + mutation.entryId)
				}
			}

			// Check when CREATE or UPDATE, the entryId is available in the proposing tree
			if (mutation.type == MutationEnum.CREATE || mutation.type == MutationEnum.UPDATE) {
				console.log(allIds)
				console.log(mutation.entryId)
				console.log(!allIds.includes(mutation.entryId))
				if (!allIds.includes(mutation.entryId)) {
					throw new Error("A mutation is sent in this transaction but not set in a tree, with the following entryId: " + mutation.entryId)
				}
			}
			// Check when DELETE type is set if the proposing tree does not have the entryId and is properly deleted
			if (mutation.type == MutationEnum.DELETE) {
				if (allIds.includes(mutation.entryId)) {
					throw new Error("A DELETE mutation is sent in this transaction but it is still set in a tree, where it should be removed, with the following entryId: " + mutation.entryId)
				}
			}
		}

		// Check if the tree does not point to the same entryId multiple times
		for (let index = 0; index < allIds.length; index++) {
			const id = allIds[index];
			for (let index2 = 0; index2 < allIds.length; index2++) {
				const idToCompare = allIds[index2];
				if (index != index2 && id == idToCompare) {
					throw new Error("The proposing tree points multiple times to the following entryId: " + id)
				}
			}
		}

		// Check if all sections do conformate to typing
		for (let index = 0; index < input.trees.length; index++) {
			const tree = input.trees[index];

			if (tree.section != GovernmentalSectionEnum.GLOSSARY &&
				tree.section != GovernmentalSectionEnum.PREAMBLES &&
				tree.section != GovernmentalSectionEnum.ARTICLES) {
				throw new Error("The section field in a mutation should either be GLOSSARY, PREAMBLES or ARTICLES")
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		const input = asset as DocumentAlteration

		// Create new document or update one that already exists
		let isNewDocument = false;
		let document: GovernmentalDocument | null = null;
		let versions: Array<GovernmentalVersion> = [];
		let existingVersionIds: Array<string> = []

		const auton = await db.tables.auton.getRecord(stateStore, input.autonId);
		if (auton == null) {
			throw new Error("Auton not found");
		}

		if (input.documentId == null || input.documentId == 'new') {
			isNewDocument = true;
		} else {
			if (!auton.governmentalDocuments.includes(input.documentId)) {
				throw new Error("Auton does not has document: " + input.documentId);
			}

			const document = await db.tables.governmentalDocument.getRecord(stateStore, input.documentId)

			if (document == null) {
				throw new Error("DocumentId does not exist");
			} else if (document.type != input.type) {
				throw new Error("Document type does not match the transaction");
			} else {
				// Get versions
				existingVersionIds = document.versions;
				for (let index = 0; index < document.versions.length; index++) {
					const versionId = document.versions[index];
					const version = await db.tables.governmentalVersion.getRecord(stateStore, versionId);
					if (version) {
						versions.push(version);
					}
				}
			}
		}

		const inputSectionMap = {}
		for (let index = 0; index < input.trees.length; index++) {
			const treeWrapper = input.trees[index];
			const allIds: Array<string> = []
			for (let index2 = 0; index2 < treeWrapper.tree.length; index2++) {
				const tree = treeWrapper.tree[index2];
				const entryIds = this.recursiveTreeCollector(tree)
				for (let index3 = 0; index3 < entryIds.length; index3++) {
					const id = entryIds[index3];
					allIds.push(id);
				}
			}
			inputSectionMap[treeWrapper.section] = allIds;
		}

		const sectionMap = {}
		if (versions.length > 0) {
			const latestVersion = versions[versions.length - 1]
			for (let index = 0; index < latestVersion.trees.length; index++) {
				const treeWrapper = latestVersion.trees[index];
				if (inputSectionMap[treeWrapper.section] == undefined) {
					throw new Error("The following section seems to be missing in the tree: " + treeWrapper.section)
				}

				const allIds: Array<string> = []
				for (let index2 = 0; index2 < treeWrapper.tree.length; index2++) {
					const tree = treeWrapper.tree[index2];
					const entryIds = this.recursiveTreeCollector(tree)
					for (let index3 = 0; index3 < entryIds.length; index3++) {
						const id = entryIds[index3];
						allIds.push(id);
					}
				}
				sectionMap[treeWrapper.section] = allIds;
				for (let index2 = 0; index2 < allIds.length; index2++) {
					const element = allIds[index2];
					if (inputSectionMap[treeWrapper.section] && !inputSectionMap[treeWrapper.section].includes(element)) {
						let found = false;
						for (let index3 = 0; index3 < input.mutations.length; index3++) {
							const mutation = input.mutations[index3];
							if (mutation.entryId == element && mutation.type == MutationEnum.DELETE) {
								found = true;
								break;
							}
						}
						if (!found) {
							throw new Error("The following entryId is removed from the tree but does not have a corresponding DELETE mutation: " + element)
						}
					}
				}
			}

			// Check if all new entryIds in the proposing tree have a corresponding CREATE mutation
			for (let index = 0; index < input.trees.length; index++) {
				const treeWrapper = input.trees[index];
				const inputIds = inputSectionMap[treeWrapper.section]
				for (let index2 = 0; index2 < inputIds.length; index2++) {
					const inputId = inputIds[index2];
					if (sectionMap[treeWrapper.section] && !sectionMap[treeWrapper.section].includes(inputId)) {
						let found = false;
						for (let index3 = 0; index3 < input.mutations.length; index3++) {
							const mutation = input.mutations[index3];
							if (mutation.entryId == inputId && mutation.type == MutationEnum.CREATE) {
								found = true;
								break;
							}
						}
						if (!found) {
							throw new Error("The following entryId is created in the tree but does not have a corresponding CREATE mutation: " + inputId)
						}
					}

				}
			}

			for (let index = 0; index < input.mutations.length; index++) {
				const mutation = input.mutations[index];
				// Check if UPDATE and DELETE mutations point to existing entries. Otherwise an conflict should occur.
				if (mutation.type == MutationEnum.UPDATE || mutation.type == MutationEnum.DELETE) {
					let found = false;
					for (let index = 0; index < latestVersion.trees.length; index++) {
						const treeWrapper = latestVersion.trees[index];
						if (sectionMap[treeWrapper.section] && sectionMap[treeWrapper.section].includes(mutation.entryId)) {
							found = true;
							break;
						}
					}
					if (!found) {
						throw new Error("Mutation: " + mutation.entryId + " points to an entry that does not exist in the current version of the document")
					}
				}
				// Check if CREATE mutations do NOT point to existing entryIds but have their own temporary id for tree matching
				if (mutation.type == MutationEnum.CREATE) {
					let found = false;
					for (let index = 0; index < latestVersion.trees.length; index++) {
						const treeWrapper = latestVersion.trees[index];
						if (sectionMap[treeWrapper.section] && sectionMap[treeWrapper.section].includes(mutation.entryId)) {
							found = true;
							break;
						}
					}
					if (found) {
						throw new Error("Mutation: " + mutation.entryId + " points to an existing entryId while the mutation is of the type CREATE, it's id should be an temporary one matching with one in the proposing tree.")
					}
				}
			}
		} else {
			// There can only be update mutations since there are no previous versions...
			for (let index = 0; index < input.mutations.length; index++) {
				const mutation = input.mutations[index];
				if (mutation.type != MutationEnum.CREATE) {
					throw new Error("There are no previous versions of this document so the only allowed mutation type is CREATE")
				}
			}
		}

		const newVersion: GovernmentalVersion = {
			id: db.tables.governmentalVersion.getDeterministicId(transaction, 0),
			documentId: isNewDocument ? db.tables.governmentalDocument.getDeterministicId(transaction, 0) : input.documentId,
			proposalId: "",
			version: document ? versions.length++ : 1,
			effectuationDate: BigInt(stateStore.chain.lastBlockHeaders[0].timestamp),
			mutations: [],
			trees: []
		};

		const replaceInTree = {}
		for (let rowContext = new RowContext(); rowContext.getNonce() < input.mutations.length; rowContext.increment()) {
			const mutation = input.mutations[rowContext.getNonce()];
			if (mutation.type == MutationEnum.CREATE || mutation.type == MutationEnum.UPDATE) {
				const newEntry: GovernmentalEntry = {
					id: db.tables.governmentalEntry.getDeterministicId(transaction, rowContext.getNonce()),
					versionId: db.tables.governmentalVersion.getDeterministicId(transaction, 0),
					title: mutation.title,
					content: mutation.content
				};

				if (mutation.type == MutationEnum.CREATE) {
					replaceInTree[mutation.entryId] = newEntry.id
				}

				const newEntryId = await db.tables.governmentalEntry.createRecord(stateStore, transaction, newEntry, rowContext)
				const prevEntry = await db.tables.governmentalEntry.getRecord(stateStore, mutation.entryId)

				const changes: Array<string> = [];
				if (prevEntry) {
					if (prevEntry.title != newEntry.title) {
						changes.push(ChangesEnum.TITLE_CHANGED);
					}
					if (prevEntry.content != newEntry.content) {
						changes.push(ChangesEnum.CONTENT_CHANGED);
					}
				}

				const governmentalEntryMutation: GovernmentalEntryMutation = {
					oldEntryId: mutation.type == MutationEnum.CREATE ? '' : mutation.entryId,
					newEntryId: newEntryId,
					type: mutation.type,
					changes: changes
				}
				newVersion.mutations.push(governmentalEntryMutation);
			} else if (mutation.type == MutationEnum.DELETE) {
				const governmentalEntryMutation: GovernmentalEntryMutation = {
					oldEntryId: mutation.entryId,
					newEntryId: mutation.entryId,
					type: mutation.type,
					changes: []
				}
				newVersion.mutations.push(governmentalEntryMutation);
			}
		}

		// Make tree up to date (convert all entryIds of CREATE mutations to their just created database entryId)
		for (let index = 0; index < input.trees.length; index++) {
			const treeWrapper = input.trees[index];
			for (let index2 = 0; index2 < treeWrapper.tree.length; index2++) {
				const tree = treeWrapper.tree[index2];
				this.recursiveTreeUpdate(tree, replaceInTree);
			}
		}

		console.log("input.trees")
		for (let index = 0; index < input.trees.length; index++) {
			const treeWrapper = input.trees[index];
			for (let index2 = 0; index2 < treeWrapper.tree.length; index2++) {
				const tree = treeWrapper.tree[index2];
				console.log(tree)
			}
		}

		newVersion.trees = input.trees;

		console.log(newVersion)
		await db.tables.governmentalVersion.createRecord(stateStore, transaction, newVersion, new RowContext());

		const governmentalDocument: GovernmentalDocument = {
			id: (input.documentId == "" || input.documentId == "new") ? db.tables.governmentalDocument.getDeterministicId(transaction, 0) : input.documentId,
			type: input.type,
			versions: existingVersionIds
		}
		governmentalDocument.versions.push(db.tables.governmentalVersion.getDeterministicId(transaction, 0));
		console.log(governmentalDocument)

		if (isNewDocument) {
			await db.tables.governmentalDocument.createRecord(stateStore, transaction, governmentalDocument, new RowContext())
			auton.governmentalDocuments.push(governmentalDocument.id)
			await db.tables.auton.updateRecord(stateStore, input.autonId, auton);
		} else {
			await db.tables.governmentalDocument.updateRecord(stateStore, input.documentId, governmentalDocument);
		}

	}
}
