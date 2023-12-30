/**
 * Wrapper module for jQuery DataTables
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [],
    () => {
        const MODULE = `SS|DataTable`;

        const renderStyle = () => {
            
        };

        class DataTable {
            constructor(options) {
                this.columns = options.columns;
                this.rows = options.rows;
            }
        }

        return {
            render(options) {
                const TITLE = `${MODULE}.Render`;
                let { columns, rows, params } = options;
            }
        };
    }
);