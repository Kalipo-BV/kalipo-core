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


//q: what do you call when someone has not checked in yet, something with check
// a: 

export enum checkStatus {
    NOTCHECKEDIN = 'NOTCHECKEDIN',
    CHECKEDIN = 'CHECKEDIN',
    CHECKEDOUT = 'CHECKEDOUT',
}

export enum ProposalType {
    MEMBERSHIP_INVITATION = 'membership-invitation',
    PROPOSAL_TEST = 'test_proposaltype'
}

export enum AutonTypeEnum {
    DEFAULT = "DEFAULT",
    EVENT = "EVENT",
    LESSON = "LESSON"
}
//stakeholders resultaten
export enum StakeholderVote{
    UNDECIDED = 'UNDECIDED',
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED',
}

export enum RoleEnum {
    FULL_MEMBER = "FULL_MEMBER",
    AFFILIATE_MEMBER = "AFFILIATE_MEMBER"
}

export enum ProposalStatus {
    CAMPAIGNING = 'CAMPAIGNING',
    VOTING = 'VOTING',
    DECIDED = 'DECIDED',
    ENDED = 'ENDED',
}

export enum ProposalResult {
    UNDECIDED = 'UNDECIDED',
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED',
}



export enum MembershipValidationError {
    NO_ERROR = 'NO_ERROR',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    NO_ACTIVE_MEMBERSHIP = 'NO_ACTIVE_MEMBERSHIP',
    OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED = 'OPEN_INVITATION_NOT_ACCEPTED_OR_REFUSED',
}