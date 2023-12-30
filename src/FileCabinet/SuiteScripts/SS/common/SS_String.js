/**
 * Utility functions for strings
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [],
    () => {
        const MODULE = `SS|String`;

        return {
            generateRandomString(length = 20) {
                const TITLE = `${MODULE}.GenerateRandomString`;
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';

                let counter = 0;
                while (counter < length) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                    counter++;
                }

                return result;
            },
            normalize(value) {
                let output = '';
                output = value?.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, '');
                output = output || '';
                return output;
            }
        };
    }
);