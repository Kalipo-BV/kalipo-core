import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import * as sanitizeHtml from 'sanitize-html';

export class PostAsset extends BaseAsset {
	public name = 'post';
	public id = 0;

	// Define schema for asset
	public schema = {
		$id: 'choices/post-asset',
		title: 'PostAsset transaction asset for choices module',
		type: 'object',
		required: [],
		properties: {
			"dataType": "Array<{label: string, value: string}>",
			"fieldNumber": 1,
			"minLength": 2,
			"maxLength": 4,
		},
	};

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		asset.content = sanitizeHtml(asset.content);
		await stateStore.chain.set("choices", codec.encode(this.schema, asset));
	}
}
