/**
 * @NApiVersion         2.1
 * @NModuleScope        Public
 */

define(
    [
        'N/ui/serverWidget',
        './SS_File',
        './SS_Format',
        './SS_String',
        './SS_Script'
    ],
    (
        NS_ServerWidget,
        SS_File,
        SS_Format,
        SS_String,
        SS_Script
    ) => {
        const MODULE_NAME = 'SS.UI';

        /**
         * 
         * @param {Object} options 
         * @param {string} options.id
         * @param {Object} options.parent
         * @returns 
         */
        const getField = (options) => {
        };

        /**
         * 
         * @param {Object} options 
         * @param {string} options.id
         * @param {Object} options.parent
         * @returns 
         */
        const getSublist = (options) => {
            if (!options.form) {
                return null;
            }

            if (!options.id) {
                return null;
            }

            return options.form.getSublist({ id: options.id });
        };

        /**
         * 
         * @param {Object} options
         * @param {Object} options.config
         * @param {String} options.label
         * @returns 
         */
        const getSublistColumnKeyByLabel = (options) => {
            if (!options.config) {
                return null;
            }

            return options.config.Fields.find(f => ssFormat.Clean(f.label.toLowerCase()) === ssFormat.Clean(options.label.toLowerCase()));
        };

        /**
         * 
         * @param {Object} options 
         * @param {Array}  options.data
         * @param {Object} options.config
         * @param {Object} options.sublist 
         */

        return {
            addButton (options) {
                if (!options.parent || !options.button) {
                    return;
                }
    
                if (options.button.submit) {
                    options.parent.addSubmitButton(options.button);
                }
                else {
                    options.parent.addButton(options.button);
    
                    let button = options.parent.getButton({ id: options.button.id });
                    if (options.disabled === true) {
                        button.isDisabled = true;
                    }
                }
    
                return options.parent;
            },
            addField (options) {
                let fieldOptions = { ...options.field };
                if (!fieldOptions.type) {
                    fieldOptions.type = NS_ServerWidget.FieldType.TEXT;
                }
    
                let field = options.parent.addField(fieldOptions);
                if (fieldOptions.items) {
                    let selectItems = fieldOptions.items.map(item => {
                        return {
                            text: item.text,
                            value: item.value
                        };
                    });
                    for (let i = 0, length = selectItems.length; i < length; i++) {
                        field.addSelectOption({ ...selectItems[i] });
                    }
                }
    
                if (options.defaultValue) {
                    let fieldValue = (fieldOptions.type == 'multiselect' ? options.defaultValue.split(',') : (options.defaultValue || ''));
                    field.defaultValue = fieldValue;
                }
    
                if (fieldOptions.display) {
                    field.updateDisplayType({ displayType: fieldOptions.display });
                }
    
                if (fieldOptions.break) {
                    field.updateBreakType({ breakType: fieldOptions.break });
                }
    
                if (fieldOptions.layout) {
                    field.updateLayoutType({ layoutType: fieldOptions.layout });
                }
    
                return options.parent;
            },
            addSublist (options) {
                let title = `${MODULE_NAME}.AddSublist`;
                let sublistConfig = options.sublist;
                let formSublist = options.form.addSublist({
                    id: sublistConfig.id,
                    label: sublistConfig.label,
                    type: sublistConfig.type
                });
    
                if (sublistConfig.selectItems) {
                    formSublist.addMarkAllButtons();
                    formSublist.addField({ id: 'custpage_data_select', label: 'select', type: NS_ServerWidget.FieldType.CHECKBOX });
                }
    
                for (let i = 0, fieldCount = sublistConfig.Fields.length; i < fieldCount; i++) {
                    formSublist = this.addField({ field: sublistConfig.Fields[i], parent: formSublist });
                }
    
                return options.form;
            },
            buildButtons (options) {
                if (!options.config.Buttons) {
                    return options.parent;
                }
    
                for (let i = 0, length = options.config.Buttons.length; i < length; i++) {
                    options.parent = this.addButton({ button: options.config.Buttons[i], parent: options.parent });
                }
    
                return options.parent;
            },
            buildFieldGroups (options) {
                if (!options.config.FieldGroups) {
                    return options.parent;
                }
    
                for (let i = 0, length = options.config.FieldGroups.length; i < length; i++) {
                    options.parent.addFieldGroup(options.config.FieldGroups[i]);
                }
    
                return options.parent;
            },
            buildFields (options) {
                if (!options.config.Fields) {
                    return options.parent;
                }
    
                for (let i = 0, length = options.config.Fields.length; i < length; i++) {
                    let fieldConfig = options.config.Fields[i];
                    options.parent = this.addField({
                        defaultValue: options.defaultValues?.[fieldConfig.id],
                        field: fieldConfig,
                        parent: options.parent
                    });
                }
    
                return options.parent;
            },
            buildForm (options) {
                let title = `${MODULE_NAME}.BuildForm`;
                log.debug({ title: title, details: '*** START ***' });
    
                let formConfig = options.config;
                let form = NS_ServerWidget.createForm({
                    config: formConfig,
                    hideNavBar: options.hideNavBar,
                    title: options.title || formConfig.Title || 'Default Title'
                });
                form = this.buildButtons({ config: formConfig, parent: form });
                form = this.buildFieldGroups({ config: formConfig, parent: form });
                form = this.buildFields({ config: formConfig, defaultValues: options.defaultValues, parent: form });
    
                if (options.sublists) {
                    form = this.buildSublists({ config: formConfig, dynamicColumns: options.dynamicColumns, form: form });
                }
    
                if (formConfig.ClientScriptFile) {
                    form.clientScriptFileId = SS_File.get({ name: formConfig.ClientScriptFile });
                }
    
                if (options.data) {
                    let sublistConfigs = this.getDeploymentSublists({ config: options.config });
    
                    if (sublistConfigs.length <= 0) {
                        return form;
                    }
    
                    let sublist = this.getSublist({ form: form, id: sublistConfigs[0].id });
                    this.writeSublistData({ config: sublistConfigs[0], data: options.data, sublist: sublist });
                }
                
                log.debug({ title: title, details: '*** END ***' });
                return form;
            },
            buildSublists (options) {
                let sublistConfigs = this.getDeploymentSublists({ config: options.config });
                if (sublistConfigs.length <= 0) {
                    return options.form;
                }
    
                for (let i = 0, length = sublistConfigs.length; i < length; i++) {
                    options.form = this.addSublist({ dynamicColumns: options.dynamicColumns, form: options.form, sublist: sublistConfigs[i] });
                }
    
                return options.form;
            },
            getDeploymentSublists (options) {
                let deploymentId = SS_Script.DeploymentId;
                if (!options.config.Sublists) {
                    return [];
                }
    
                return options.config.Sublists.filter(s => s.deploymentId === deploymentId);
            },
            getField (options) {
                if (!options.parent) {
                    return null;
                }
    
                if (!options.id) {
                    return null;
                }
    
                return options.parent.getField({ id: options.id });
            },
            getSublist (options) {
                if (!options.form) {
                    return null;
                }
    
                if (!options.id) {
                    return null;
                }
    
                return options.form.getSublist({ id: options.id });
            },
            getSublistColumnKeyByLabel (options) {
                if (!options.config) {
                    return null;
                }
    
                return options.config.Fields.find(f => SS_Format.clean(f.label) === SS_Format.clean(options.label));
            },
            mapParametersToFields (options) {
                const TITLE = `${MODULE_NAME}.MapParametersToFields`;
                let { fields, form, parameters } = options;
                let output = {};
    
                log.debug({ title: `${TITLE} fields`, details: JSON.stringify(fields) });
    
                for (let i = 0, count = fields.length; i < count; i++) {
                    let key = fields[i];
                    if (!parameters[key]) {
                        continue;
                    }
    
                    let field = form.Fields.find(f => {
                        return f.filter === true &&
                            key === SS_String.normalize(f.label);
                    })?.id
                    if (!field) {
                        continue;
                    }
                    output[field] = parameters[key];
                }
                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
    
                return output;
            },
            readQueryParameters (options) {
                const title = `${MODULE_NAME}.ReadQueryParameters`;
                let output = {};
                let { fields, request } = options;
                let params = request.parameters;
                
                output.action = params.action;
                for (let i = 0, count = fields.length; i < count; i++) {
                    let key = fields[i];
                    output[key] = params[key];
                }
                
                log.debug({ title: title, details: JSON.stringify(output) });
                return output;
            },
            writeSublistData (options) {
                let title = `${MODULE_NAME}.WriteSublistData`;
    
                for (let i = 0, length = options.data.length; i < length; i++) {
                    let rowData = {};
                    for (const [key, value] of Object.entries(options.data[i])) {
                        let sublistColumn = this.getSublistColumnKeyByLabel({ config: options.config, label: key });
                        if (!sublistColumn) { continue; }
    
                        let colValue = value;
                        if (sublistColumn.currency) {
                            colValue = SS_Format.format({ type: SS_Format.Type.CURRENCY, value: colValue });
                        }
                        else if (sublistColumn.float) {
                            colValue = SS_Format.format({ type: SS_Format.Type.FLOAT, value: colValue });
                        }
    
                        options.sublist.setSublistValue({
                            id: sublistColumn.id,
                            line: i,
                            value: colValue || '-'
                        });
                        rowData[sublistColumn.id] = value || null;
                    }
    
                    let objEqual = false;
                    let rowDataKeys = Object.keys(rowData).sort();
    
                    if (objEqual) {
                        options.sublist.setSublistValue({
                            id: 'custpage_data_select',
                            line: i,
                            value: 'T'
                        });
                    }
                }
            }
        };
    }
);