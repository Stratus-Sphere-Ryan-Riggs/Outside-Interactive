/**
 * Wrapper module for N/record
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/record',
        './SS_Constants'
    ],
    (
        NS_Record,
        SS_Constants
    ) => {
        class Record {
            record;
            id;
            type;

            constructor(options) {
                this.record = options.record;
                this.id = options.record.id || '';
                this.type = options.record.type;
            };

            get Id() {
                return this.id;
            };

            get Type() {
                return this.type;
            };

            commitLine(options) {
                this.record.commitLine(options);
            }

            findSublistLineWithValue(options) {
                return this.record.findSublistLineWithValue(options);
            }

            getCurrentLineValues(options) {
                let { sublistId } = options;
                let output = {};

                if (!!options.fields?.length === false) {
                    return output;
                }

                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.record.getCurrentSublistValue({ sublistId, fieldId });
                }

                return output;
            }

            getCurrentSublistSubrecord(options) {
                return this.record.getCurrentSublistSubrecord(options);
            }

            getField(options) {
                return this.record.getField(options);
            };

            getLineCount(options) {
                return this.record.getLineCount(options);
            }

            getHeaderText(options) {
                return this.record.getText(options);
            }

            getHeaderTexts(options) {
                if (!!options.fields?.length) {
                    return {};
                }

                let output = { id: this.id };
                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.getHeaderText({ fieldId });
                }

                return output;
            }

            getHeaderValue(options) {
                if (options.fieldId === 'id') {
                    return this.record.id;
                }
                else {
                    return this.record.getValue(options);
                }
            };

            getHeaderValues(options) {
                const TITLE = `Record.getHeaderValues`;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
                if (!!options.fields?.length === false) {
                    return {};
                }

                let output = { id: this.id };
                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.getHeaderValue({ fieldId });
                    log.debug({ title: `${TITLE} getHeaderValue`, details: `fieldId = ${fieldId}; value = ${output[fieldId]}` });
                }

                /* const FIELDS = SS_Constants.CustomRecords.VendorRequest.Fields;
                [ FIELDS.BANK_DETAIL_METHOD, FIELDS.TYPE_OF_ACCOUNT ].forEach(fieldId => {
                    output[fieldId] = this.record.getValue({ fieldId });
                    log.debug({ title: `${TITLE} getHeaderValue`, details: `fieldId = ${fieldId}; value = ${output[fieldId]}` });
                }); */

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            };

            getLineValues(options) {
                let { sublistId, line } = options;
                let output = {};

                if (!!options.fields?.length === false) {
                    return output;
                }

                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.record.getSublistValue({ sublistId, fieldId, line });
                }

                return output;
            }

            getSublistSubrecord(options) {
                return this.record.getSublistSubrecord(options);
            }

            getSublistValue(options) {
                let { sublistId, fieldId, line = 0 } = options;
                if (!sublistId) { return ''; }
                if (!fieldId) { return ''; }

                return this.record.getSublistValue({ sublistId, fieldId, line });
            };

            getSublistValues(options) {
                const TITLE = `Record.getSublistValues`;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
                let output = [];
                if (!!options.fields?.length === false) {
                    return output;
                }

                let { sublistId, fields } = options;
                for (let i = 0, count = this.getLineCount({ sublistId }); i < count; i++) {
                    let rowValues = { line: i };
                    fields.forEach(fieldId => {
                        rowValues[fieldId] = this.getSublistValue({ sublistId, fieldId, line: i });
                    })
                    output.push(rowValues);
                }

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            }

            getText(options) {
                return this.record.getText(options);
            }

            getTexts(options) {
                if (!!options.fields?.length) {
                    return {};
                }

                let output = {};
                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.getText({ fieldId });
                }

                return output;
            }

            getValue(options) {
                if (options.fieldId === 'id') {
                    return this.record.id;
                }
                else {
                    return this.record.getValue(options);
                }
            };

            getValues(options) {
                const TITLE = `Record.getHeaderValues`;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
                if (!!options.fields?.length === false) {
                    return {};
                }

                let output = {};
                for (let i = 0, count = options.fields.length; i < count; i++) {
                    let fieldId = options.fields[i];
                    output[fieldId] = this.getValue({ fieldId });
                }

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            };

            getSublistValue(options) {
                let { sublistId, fieldId, line = 0 } = options;
                if (!sublistId) { return ''; }
                if (!fieldId) { return ''; }

                return this.record.getSublistValue({ sublistId, fieldId, line });
            };

            getSublistValues(options) {
                const TITLE = `Record.getSublistValues`;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
                let output = [];
                if (!!options.fields?.length === false) {
                    return output;
                }

                let { sublistId, fields } = options;
                for (let i = 0, count = this.getLineCount({ sublistId }); i < count; i++) {
                    let rowValues = { line: i };
                    fields.forEach(fieldId => {
                        rowValues[fieldId] = this.getSublistValue({ sublistId, fieldId, line: i });
                    })
                    output.push(rowValues);
                }

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            }

            removeLine(options) {
                this.record.removeLine(options);
            }

            save(options) {
                return this.record.save(options);
            }

            selectNewLine(options) {
                log.debug({ title: `SS_Record.SelectNewLine record`, details: JSON.stringify(this.record) });
                let { sublistId } = options;
                this.record.selectNewLine({ sublistId });
            }

            setCurrentSublistValue(options) {
                this.record.setCurrentSublistValue(options);
            }

            setCurrentSublistValues(options) {
                let { sublistId, values } = options;
                for (const [fieldId, value] of Object.entries(values)) {
                    this.setCurrentSublistValue({ sublistId, fieldId, value });
                }
            }

            setHeaderText(options) {
                if (options.skipEmpty === true && !!options.value?.trim() === false) {
                    return;
                }

                log.debug({ title: `Record setHeaderText`, details: JSON.stringify(options) });
                this.record.setText(options);
            }

            setHeaderTexts(options) {
                for (const [fieldId, value] of Object.entries(options)) {
                    this.setHeaderText({ fieldId, value });
                }
            }

            setHeaderValue(options) {
                if (options.skipEmpty === true && !!options.value?.trim() === false) {
                    return;
                }

                log.debug({ title: `Record setHeaderValue`, details: JSON.stringify(options) });
                this.record.setValue(options);
            }

            setHeaderValues(options) {
                for (const [fieldId, value] of Object.entries(options)) {
                    this.setHeaderValue({ fieldId, value });
                }
            }

            setText(options) {
                if (options.skipEmpty === true && !!options.value?.trim() === false) {
                    return;
                }

                this.record.setText(options);
            }

            setTexts(options) {
                for (const [fieldId, value] of Object.entries(options)) {
                    this.setText({ fieldId, value });
                }
            }

            setValue(options) {
                if (options.skipEmpty === true && !!options.value?.trim() === false) {
                    return;
                }

                log.debug({ title: `Record setHeaderValue`, details: JSON.stringify(options) });
                this.record.setValue(options);
            }

            setValues(options) {
                for (const [fieldId, value] of Object.entries(options)) {
                    this.setValue({ fieldId, value });
                }
            }

            setSublistValue(options) {
                this.record.setSublistValue(options);
            }

            setSublistValues(options) {
                let { sublistId, line, values } = options
                for (const [fieldId, value] of Object.entries(values)) {
                    this.setSublistValue({ sublistId, fieldId, line, value });
                }
            }
        }

        return {
            Record: Record,
            get Type() {
                return NS_Record.Type;
            },
            cast(record) {
                return new Record({ record });
            },
            copy(options) {
                return this.cast(NS_Record.copy(options));
            },
            create(options) {
                return this.cast(NS_Record.create(options));
            },
            delete(options) {
                return NS_Record.delete(options);
            },
            load(options) {
                return this.cast(NS_Record.load(options));
            },
            submitFields(options) {
                return NS_Record.submitFields(options);
            },
            transform(options) {
                return this.cast(NS_Record.transform(options));
            }
        };
    }
);