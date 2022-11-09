import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import * as sanitizeHtml from 'sanitize-html';

export class PostAsset extends BaseAsset {
	public name = 'post';
	public id = 1;

	// Define schema for asset
	public schema = {
		$id: 'choices/post-asset',
		title: 'PostAsset transaction asset for choices module',
		type: 'object',
		required: [],
		properties: {
			choicesObject: {
				type: 'array',
				fieldNumber: 1,
				items: {
					type: 'string'
				}
			}
		}
	}

	public validate({ asset }: ValidateAssetContext<{}>): void {
		// Validate your asset
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		asset.content = sanitizeHtml(asset.content);
		await stateStore.chain.set("choices", codec.encode(this.schema, asset));
	}
}
