/**
 * Wrapper module for N/search
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/search',
        './SS_Script',
        './SS_String'
    ],
    (
        NS_Search,
        SS_Script,
        SS_String
    ) => {
        const MODULE = {
            get LogicalOperator() {
                return {
                    AND: 'and',
                    OR: 'or'
                };
            },
            get Operator() {
                return NS_Search.Operator;
            },
            get Sort() {
                return NS_Search.Sort;
            },
            get Summary() {
                return NS_Search.Summary;
            },
            get Type() {
                return NS_Search.type;
            }
        };

        class Search {
            // GETTERS
            constructor(options) {
                this.filters = options.filters;
                this.columns = options.columns;
                this.search = options.search;
                this.type = options.type;
            };

            get Columns() {
                return this.search.columns;
            };
            
            get Expression() {
                return this.search.filterExpression;
            };

            get Filters() {
                return this.search.filters;
            };

            // SETTERS
            set Columns(value) {
                this.search.columns = value;
            }

            set Expression(value) {
                this.search.filterExpression = value;
            }

            set Filters(value) {
                this.search.filters = value;
            }

            addColumn(options) {
                this.search.columns.push(options);
            };

            addExpression(value) {
                let expression = this.search.filterExpression;
                if (expression.length <= 0) {
                    this.search.filterExpression = value;
                    return;
                }

                this.search.filterExpression = expression.concat([
                    MODULE.LogicalOperator.AND,
                    value
                ]);
            };

            addFilter(options) {
                this.search.filters.push(options);
            };

            getAll() {
                return this.getResults();
            };

            getFirst() {
                return this.getResults({ size: 1 });
            };

            getResults() {
                log.debug({ title: `SS.Search|GetResults search`, details: JSON.stringify(this.search) });
                let allResults = [];
                let subResults = [];
                let start = 0;
                let size = 1000;
                let end = size;
                // let { keys } = options || [];
                
                do {
                    subResults = this.search.run().getRange({ start, end });
                    allResults = allResults.concat(subResults);

                    start += size;
                    end += size;
                } while (subResults.length >= size);

                /* if (keys.length <= 0) {
                    for (let i = 0, count = this.search.columns.length; i < count; i++) {
                        let column = this.search.columns[i];
                        keys.push(SS_String.normalize(column.label) || column.name);
                    }
                } */
                log.debug({ title: `SS.Search|GetResults`, details: `allResults = ${allResults.length}` });
                allResults = allResults.map(row => {
                    let rowObject = { id: row.id };

                    for (let i = 0, count = this.search.columns.length; i < count; i++) {
                        let column = this.search.columns[i];
                        let label = SS_String.normalize(column.label) || column.name;
                        if (label.indexOf('_text') > 0) {
                            label = label.substring(0, label.indexOf('_text'));
                            rowObject[label] = row.getText(column);
                        }
                        else {
                            rowObject[label] = row.getValue(column);
                        }
                    }

                    return rowObject;
                });
                log.debug({ title: `SS.Search|GetResults`, details: `allResults = ${allResults.length}` });

                return allResults;
            }

            /* getValue(options) {
                let { column, name, join, row, summary } = options;

                if (column) {
                    return row.getValue(column);
                }

                return row.getValue({ name, join, summary });
            }; */

            run() {
                return this.search.run();
            };
        };
        
        return {
            get Operator() {
                return NS_Search.Operator;
            },

            get Type() {
                return NS_Search.Type;
            },

            cast(search) {
                return new Search({ search });
            },
            create(options) {
                const TITLE = `${MODULE}.Create`;
                let { columns = [], filters = [], type } = options;

                return this.cast(NS_Search.create({ type, filters, columns }));
            },
            load(options) {
                const TITLE = `${MODULE}.Load`;
                if (!options?.id) {
                    log.error({ title: TITLE, details: `Missing required value: Id.` });
                    return null;
                }

                return this.cast(NS_Search.load(options));
            },
            loadFromParameter(options) {
                let title = `${MODULE}.LoadFromParameter`;
                let { name } = options;
                let searchIdParam = SS_Script.getParameter({ name });
                if (!searchIdParam) {
                    log.error({ title: title, details: `Missing required value: Search ID` })
                    return null;
                }
    
                return this.load({ id: searchIdParam });
            },
            lookup(options) {
                const TITLE = `${MODULE}.Lookup`;
                let { type, id, columns } = options;
                if (!type) {
                    log.error({ title: TITLE, details: `Missing required value: Type.` });
                    return null;
                }

                if (!id) {
                    log.error({ title: TITLE, details: `Missing required value: Id.` });
                    return null;
                }

                if (!!columns?.length === false) {
                    log.error({ title: TITLE, details: `Missing required value: Fields.` });
                    return null;
                }

                return NS_Search.lookupFields({ type, id, columns });
            }
        }
    }
);