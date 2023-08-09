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
    AUTON_CREATION = 'auton-creation',
    TERMS_AND_CONDITIONS_BILL = 'terms-and-conditions-bill',
    PROPOSAL_TYPE_SETTINGS_BILL = 'proposal-type-settings-bill'
}

export enum GovernmentalDocumentEnum {
    CONSTITUTION = 'CONSTITUTION',
    CODE_OF_CONDUCT = 'CODE_OF_CONDUCT',
    MANIFESTO = 'MANIFESTO',
}

export enum ChangesEnum {
    PARENT_CHANGED = 'PARENT_CHANGED',
    ORDER_CHANGED = 'ORDER_CHANGED',
    TITLE_CHANGED = 'TITLE_CHANGED',
    CONTENT_CHANGED = 'CONTENT_CHANGED',
}

export enum MutationEnum {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

export enum GovernmentalSectionEnum {
    GLOSSARY = 'GLOSSARY',
    PREAMBLES = 'PREAMBLES',
    ARTICLES = 'ARTICLES',
}

export enum AutonTypeEnum {
    DEFAULT = "DEFAULT",
    GOVERNING = "GOVERNING",
    EVENT = "EVENT",
    LESSON = "LESSON"
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