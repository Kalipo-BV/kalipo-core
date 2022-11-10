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

import * as Config from '@oclif/config';
import { AccountCreateCommand } from '../../../src/commands/account/create';
import { getConfig } from '../../utils/config';

describe('account:create', () => {
	let config: Config.IConfig;
	let results: any;
	beforeEach(async () => {
		results = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => results.push(val));
	});

	it('should throw an error if the flag is invalid number', async () => {
		await expect(AccountCreateCommand.run(['--count=NaN'], config)).rejects.toThrow(
			'Count flag must be an integer and greater than 0',
		);
	});

	it('should throw an error if the Count flag is less than 1', async () => {
		await expect(AccountCreateCommand.run(['--count=0'], config)).rejects.toThrow(
			'Count flag must be an integer and greater than 0',
		);
	});

	it('should throw an error if the Count flag contains non-number characters', async () => {
		await expect(AccountCreateCommand.run(['--count=10sk24'], config)).rejects.toThrow(
			'Count flag must be an integer and greater than 0',
		);
	});

	describe('account:create', () => {
		it('should create an account', async () => {
			await AccountCreateCommand.run([], config);
			expect(Object.keys(JSON.parse(results[0])[0])).toEqual([
				'passphrase',
				'privateKey',
				'publicKey',
				'binaryAddress',
				'address',
			]);
		});
	});

	describe('account:create --count=x', () => {
		const defaultNumber = 2;
		it('should create multiple accounts', async () => {
			await AccountCreateCommand.run(['--count', defaultNumber.toString()], config);
			expect(JSON.parse(results[0])).toHaveLength(defaultNumber);
		});
	});
});
