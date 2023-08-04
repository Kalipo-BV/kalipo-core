import { ParameterSettingsAlterationAsset } from '../../../../../src/app/modules/proposal/assets/parameter_settings_alteration_asset';

describe('ParameterSettingsAlterationAsset', () => {
  let transactionAsset: ParameterSettingsAlterationAsset;

	beforeEach(() => {
		transactionAsset = new ParameterSettingsAlterationAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(3);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('parameterSettingsAlteration');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
      it.todo('should throw errors for invalid schema');
      it.todo('should be ok for valid schema');
    });
	});

	describe('apply', () => {
    describe('valid cases', () => {
      it.todo('should update the state store');
    });

    describe('invalid cases', () => {
      it.todo('should throw error');
    });
	});
});
