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
import { MembershipTable } from './table/membership_table'
import { UsernameIndex } from './index/username_index'
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

export const tableRegistrationClasses: Array<BaseTable> = [new KalipoAccountTable(), new AutonTable(), new MembershipTable(),
new ProposalTable(), new ProposalProvisionsTable(), new VoteTable(), new ProposalCampaignCommentTable()]

export const db = {
    tables: {
        kalipoAccount: new KalipoAccountTable(),
        auton: new AutonTable(),
        membership: new MembershipTable(),
        proposal: new ProposalTable(),
        provisions: new ProposalProvisionsTable(),
        vote: new VoteTable(),
        campaignComment: new ProposalCampaignCommentTable()
    },
    indices: {
        liskId: new LiskIdIndex(),
        username: new UsernameIndex(),
        autonName: new AutonNameIndex(),
        autonTag: new AutonTagIndex(),
        fullTable: new FullTableIndex(),
        scheduledProposal: new ScheduledProposalIndex()
    }
}