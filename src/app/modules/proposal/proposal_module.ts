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

/* eslint-disable class-methods-use-this */

import {
    AfterBlockApplyContext,


    AfterGenesisBlockApplyContext, BaseModule,


    BeforeBlockApplyContext, codec, TransactionApplyContext
} from 'lisk-sdk';
import { process } from '../../database/action_pipeline';
import { db, tableRegistrationClasses } from '../../database/db';
import { ProposalResult, ProposalStatus } from '../../database/enums';
import { RowContext } from '../../database/row_context';
import { Auton } from '../../database/table/auton_table';
import { ProposalProvisions } from '../../database/table/proposal_provisions_table';
import { Proposal } from '../../database/table/proposal_table';
import { MembershipInvitationAsset } from "./assets/membership_invitation_asset";
import { ImprovementAsset } from "./assets/improvement_asset";

export interface BinaryVoteCount {
    acceptCount: number,
    refuseCount: number,
    totalVotes: number,
}

export const currentRowContexts: Record<string, RowContext> = {}

export class ProposalModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getByID: async (params: Record<string, unknown>) => {
            return await db.tables.proposal.getRecordInJSON(this._dataAccess.getChainState.bind(this), (params as { id: string }).id)
        },
    };
    public reducers = {
        // Example below
        // getBalance: async (
        // 	params: Record<string, unknown>,
        // 	stateStore: StateStore,
        // ): Promise<bigint> => {
        // 	const { address } = params;
        // 	if (!Buffer.isBuffer(address)) {
        // 		throw new Error('Address must be a buffer');
        // 	}
        // 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
        // 	return account.token.balance;
        // },
    };
    public name = 'proposal';
    public transactionAssets = [new MembershipInvitationAsset(), new ImprovementAsset()];
    public events = [
        // Example below
        'gotDecided'
    ];
    public id = 1004;

    // public constructor(genesisConfig: GenesisConfig) {
    //     super(genesisConfig);
    // }

    // Lifecycle hooks
    public async beforeBlockApply(_input: BeforeBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
        // const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    private initializeOrResetRowContexts() {
        for (let index = 0; index < tableRegistrationClasses.length; index++) {
            const table = tableRegistrationClasses[index];
            const rowContext = currentRowContexts[table.prefix];
            if (rowContext == null) {
                currentRowContexts[table.prefix] = new RowContext();
            } else {
                rowContext.reset();
            }
        }
    }

    public async afterBlockApply(_input: AfterBlockApplyContext) {
        this.initializeOrResetRowContexts();

        const index = await db.indices.scheduledProposal.getRecord(_input.stateStore, "current");
        if (index !== null) {
            for (let i = 0; i < index.data.length; i++) {
                const reference = index.data[i];

                if (_input.block.header.timestamp >= Number(reference.scheduled)) {
                    // Determine status
                    const proposal = await db.tables.proposal.getRecord(_input.stateStore, reference.id)
                    if (proposal != null) {
                        let sendToActionPipeline = false;
                        const auton = await db.tables.auton.getRecord(_input.stateStore, proposal.autonId)
                        const provision = await db.tables.provisions.getRecord(_input.stateStore, proposal.provisionId)

                        if (proposal.status == ProposalStatus.CAMPAIGNING) {
                            proposal.status = ProposalStatus.VOTING;
                        } else if ((proposal.status == ProposalStatus.VOTING || proposal.status == ProposalStatus.DECIDED)
                            && BigInt(_input.block.header.timestamp) >= proposal.windowClosed) {
                            proposal.status = ProposalStatus.ENDED;
                            // Remove from index because end status is reached
                            index.data.splice(i, 1);
                        } else if (proposal.status == ProposalStatus.VOTING) {

                            if (auton != null && provision != null) {
                                const binaryVoteCount = await this.calculateBinaryVoteCount(proposal, _input)
                                const totalActiveMembers = await this.calculateTotalActiveMembers(auton, proposal, _input)
                                const isProposalSupportReached = this.isProposalSupportReached(provision, totalActiveMembers, binaryVoteCount)
                                const isProposalResistanceReached = this.isProposalResistanceReached(provision, totalActiveMembers, binaryVoteCount)

                                if (isProposalSupportReached) {
                                    proposal.status = ProposalStatus.DECIDED
                                    proposal.binaryVoteResult = {
                                        result: ProposalResult.ACCEPTED,
                                        memberCount: totalActiveMembers,
                                        acceptedCount: binaryVoteCount.acceptCount,
                                        refusedCount: binaryVoteCount.refuseCount,
                                        decided: BigInt(_input.block.header.timestamp)
                                    }
                                    sendToActionPipeline = true;
                                    reference.scheduled = proposal.windowClosed
                                    index[i] = reference;
                                } else if (isProposalResistanceReached) {
                                    proposal.status = ProposalStatus.DECIDED
                                    proposal.binaryVoteResult = {
                                        result: ProposalResult.REJECTED,
                                        memberCount: totalActiveMembers,
                                        acceptedCount: binaryVoteCount.acceptCount,
                                        refusedCount: binaryVoteCount.refuseCount,
                                        decided: BigInt(_input.block.header.timestamp)
                                    }
                                    sendToActionPipeline = true;
                                    reference.scheduled = proposal.windowClosed
                                    index[i] = reference;
                                }
                            }
                        }

                        await db.tables.proposal.updateRecord(_input.stateStore, reference.id, proposal)

                        if (proposal.binaryVoteResult.result != "UNDECIDED") {
                            const proposalJSON = await db.tables.proposal.getRecordInJSON(_input.stateStore, reference.id)
                            this._channel.publish('proposal:gotDecided', { id: reference.id, proposal: proposalJSON });
                        }

                        if (sendToActionPipeline) {
                            await process(proposal.binaryVoteResult.result, reference.id, proposal, provision, auton, _input)
                        }
                    }
                }
            }

            await db.indices.scheduledProposal.setRecord(_input.stateStore, "current", index);
        }
    }

    private async calculateBinaryVoteCount(proposal: Proposal, _input: AfterBlockApplyContext): Promise<BinaryVoteCount> {
        let acceptCount = 0;
        let refuseCount = 0;

        for (let vI = 0; vI < proposal.votes.length; vI++) {
            const voteId = proposal.votes[vI];
            const vote = await db.tables.vote.getRecord(_input.stateStore, voteId)

            if (vote?.answer == "ACCEPT") {
                acceptCount++
            }
            if (vote?.answer == "REFUSE") {
                refuseCount++
            }
        }

        const totalVotes = acceptCount + refuseCount;
        return { acceptCount, refuseCount, totalVotes }
    }

    private async calculateTotalActiveMembers(auton: Auton, proposal: Proposal, _input: AfterBlockApplyContext): Promise<number> {
        let totalActiveMemberships = 0;
        for (let mI = 0; mI < auton.memberships.length; mI++) {
            const membershipId = auton.memberships[mI];
            const membership = await db.tables.membership.getRecord(_input.stateStore, membershipId)
            // TODO: Add ending check when endings are implemented...
            if (membership != null && membership.started != BigInt(0) && BigInt(_input.block.header.timestamp) >= membership.started &&
                membership.started < proposal.created) {
                totalActiveMemberships++;
            }
        }
        return totalActiveMemberships;
    }

    private isProposalSupportReached(provision: ProposalProvisions, totalActiveMemberships: number, binaryVoteCount: BinaryVoteCount): boolean {
        if (binaryVoteCount.totalVotes / totalActiveMemberships > provision.attendance / 100) {
            // QUORUM REACHED
            if (binaryVoteCount.acceptCount / totalActiveMemberships > provision.acceptance / 100) {
                // Acceptance REACHED
                return true;
            }
        }
        return false;
    }

    private isProposalResistanceReached(provision: ProposalProvisions, totalActiveMemberships: number, binaryVoteCount: BinaryVoteCount): boolean {
        if (binaryVoteCount.totalVotes / totalActiveMemberships > provision.attendance / 100) {
            // QUORUM REACHED
            if (binaryVoteCount.refuseCount / totalActiveMemberships >= (100 - provision.acceptance) / 100) {
                // Resistance REACHED
                return true;
            }
        }
        return false;
    }

    public async beforeTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccounts = genesisBlock.header.asset.accounts;
    }
}
