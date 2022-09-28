import { BaseAsset, ApplyAssetContext, ValidateAssetContext, codec } from 'lisk-sdk';
import * as sanitizeHtml from 'sanitize-html';

export class PostAsset extends BaseAsset {
	public name = 'post';
  public id = 0;

  // Define schema for asset
	public schema = {
    $id: 'blog/post-asset',
		title: 'PostAsset transaction asset for blog module',
		type: 'object',
		required: [],
		properties: {
			"title": {
				"dataType": "string",
				"fieldNumber": 1,
				"minLength": 3,
				"maxLength": 32
			},
			"content": {
				"dataType": "string",
				"fieldNumber": 2,
				"minLength": 100,
				"maxLength": 30000
			}
		},
  };

  public validate({ asset }: ValidateAssetContext<{}>): void {
    // Validate your asset
  }

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<{}>): Promise<void> {
		asset.content = sanitizeHtml(asset.content);
		await stateStore.chain.set("test", codec.encode(this.schema, asset));
	  }
}
