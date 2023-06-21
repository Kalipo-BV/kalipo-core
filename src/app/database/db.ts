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

import { KalipoAccountTable } from './table/kalipo_account_table'
import { AutonTable } from './table/auton_table'
import { DaoTable } from './table/dao_table'
import { MembershipTable } from './table/membership_table'
import { UsernameIndex } from './index/username_index'
import { ContractIdIndex } from './index/contract_index'
import { AutonNameIndex } from './index/auton_name_index'
import { FullTableIndex } from './index/full_table_index'
import { AutonTagIndex } from './index/auton_tag_index'
import { LiskIdIndex } from './index/lisk_id_index'
import { ProposalTable } from './table/proposal_table'
import { ProposalProvisionsTable } from './table/proposal_provisions_table'
import { VoteTable } from './table/vote_table'
import { ScheduledProposalIndex } from './index/scheduled_proposal_index'
import { ProposalCampaignCommentTable } from './table/proposal_campaign_comment_table'
import { BaseTable } from './base_table'
import { PoaTable } from './table/poa_table'
import { PoaNameIndex } from './index/poa_index'
import { PoaIssueTable } from './table/poa_issue_table'
import { PoaIssueIndex } from './index/poa_issue_index'
import { MembershipIndex } from './index/membership_index'
import { AutonUuidIndex } from './index/auton_uuid_index'
import { GrantContractTable } from './table/grant_contract_table'
import { AgreementTable } from './table/agreement_table'
import { AgreementIdIndex } from './index/agreement_index'
import { GovernmentalDocumentTable } from './table/governmental_document_table'
import { GovernmentalVersionTable } from './table/governmental_version_table'
import { GovernmentalEntryTable } from './table/governmental_entry'

export const tableRegistrationClasses: Array<BaseTable> = [new KalipoAccountTable(), new AutonTable(), new MembershipTable(),
new ProposalTable(), new ProposalProvisionsTable(), new VoteTable(), new ProposalCampaignCommentTable(), new GovernmentalDocumentTable(),
new GovernmentalVersionTable(), new GovernmentalEntryTable(), new GrantContractTable(), new AgreementTable()]

export const db = {
    tables: {
        kalipoAccount: new KalipoAccountTable(),
        auton: new AutonTable(),
        dao: new DaoTable(),
        membership: new MembershipTable(),
        proposal: new ProposalTable(),
        provisions: new ProposalProvisionsTable(),
        vote: new VoteTable(),
        campaignComment: new ProposalCampaignCommentTable(),
        poa: new PoaTable(),
        poaIssue: new PoaIssueTable(),
        memberships: new MembershipTable(),
        grantContractTable: new GrantContractTable(),
        agreementTable: new AgreementTable(),
        governmentalDocument: new GovernmentalDocumentTable(),
        governmentalVersion: new GovernmentalVersionTable(),
        governmentalEntry: new GovernmentalEntryTable(),
    },
    indices: {
        liskId: new LiskIdIndex(),
        username: new UsernameIndex(),
        autonName: new AutonNameIndex(),
        autonTag: new AutonTagIndex(),
        autonUuid: new AutonUuidIndex(),
        fullTable: new FullTableIndex(),
        scheduledProposal: new ScheduledProposalIndex(),
        poaName: new PoaNameIndex(),
        poaIssue: new PoaIssueIndex(),
        memberships: new MembershipIndex(),
        contracts: new ContractIdIndex(),
        agreements: new AgreementIdIndex(),
    }
}