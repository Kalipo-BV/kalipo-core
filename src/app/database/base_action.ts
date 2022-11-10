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

import { AfterBlockApplyContext } from 'lisk-sdk';
import { Auton } from './table/auton_table';
import { ProposalProvisions } from './table/proposal_provisions_table';
import { Proposal, ProposalResult, ProposalType } from './table/proposal_table';

export abstract class BaseAction<T = unknown> {
    public abstract proposalType: ProposalType;
    public abstract process(proposalResult: ProposalResult, proposalId: string, proposal: Proposal,
        provision: ProposalProvisions,
        auton: Auton, _input: AfterBlockApplyContext): T;
}