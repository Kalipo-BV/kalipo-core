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

/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { AutonModule } from "./modules/auton/auton_module";
import { CommentModule } from "./modules/comment/comment_module";
import { HelloModule } from "./modules/hello/hello_module";
import { KalipoAccountModule } from "./modules/kalipo_account/kalipo_account_module";
import { MembershipModule } from "./modules/membership/membership_module";
import { PoaModule } from './modules/poa/poa_module';
import { ProposalModule } from "./modules/proposal/proposal_module";
import { VoteModule } from "./modules/vote/vote_module";

// @ts-expect-error Unused variable error happens here until at least one module is registered
export const registerModules = (app: Application): void => {
    app.registerModule(HelloModule);
    app.registerModule(KalipoAccountModule);
    app.registerModule(MembershipModule);
    app.registerModule(AutonModule);
    app.registerModule(ProposalModule);
    app.registerModule(VoteModule);
    app.registerModule(CommentModule);
    app.registerModule(PoaModule);
};
