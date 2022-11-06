/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { BlogModule } from "./modules/blog/blog_module";
import { ChoicesModule } from "./modules/choices/choices_module";

// @ts-expect-error Unused variable error happens here until at least one module is registered
export const registerModules = (app: Application): void => {
    app.registerModule(BlogModule);
    app.registerModule(ChoicesModule);
};
