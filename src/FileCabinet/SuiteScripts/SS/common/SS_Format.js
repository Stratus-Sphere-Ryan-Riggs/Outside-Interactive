/**
 * Wrapper module for N/format
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/format',
    ],
    (
        NS_Format
    ) => {
        const MODULE = 'SS.Format';

        const cleanObject = (param) => {
            if (isEmpty(param)) { return null; }

            for (const [key, value] of Object.entries(param)) {
                if (isEmpty(value)) {
                    delete param[key];
                }
            }
            if (isEmpty(param)) { return null; }

            return param;
        };

        const cleanString = (value, delimiter) => {
            if (!value) { return ''; }

            let delim = delimiter || '';
            let output = value?.toLowerCase();
            output = output.replaceAll(' ', delim);
            output = output.replaceAll('/', delim);
            output = output.replaceAll('|', delim);
            output = output.replaceAll('_', delim);

            return output;
        };

        const dateToString = (date) => {
            if (!date) { return '' };
            return NS_Format.format({ type: NS_Format.Type.DATE, value: date });
        };

        const formatCurrency = (options) => {
            let symbol = options.hideSymbol === true ? '' : (options.symbol || '$');
            let inputValue = options.value || 0;
            if (inputValue == 0) {
                return `${symbol}0.00`;
            }
            else {
                return `${symbol}${NS_Format.format({ type: NS_Format.Type.CURRENCY, value: inputValue })}`;
            }
        };

        const formatDate = (options) => {
            return options.value ? NS_Format.format({ type: NS_Format.Type.DATE, value: options.value }) : '';
        };

        const formatFloat = (options) => {
            return options.value ? NS_Format.format({ type: NS_Format.Type.FLOAT, value: options.value }) : '';
        };

        const formatInteger = (options) => {
            return options.value ? NS_Format.format({ type: NS_Format.Type.INTEGER, value: options.value }) : '';
        };

        return {
            get Type() {
                return NS_Format.Type;
            },
            clean(param) {
                let output = null;
                let type = Object.prototype.toString.call(param);
                switch (type) {
                    case '[object Object]': {
                        output = cleanObject(param);
                        break;
                    }
                    case '[object String]': {
                        output = cleanString(param);
                        break;
                    }
                }
    
                return output;
            },
            dateToString,
            format(options) {
                switch (options.type) {
                    case this.Type.CURRENCY: {
                        return formatCurrency(options);
                    }
                    case this.Type.DATE: {
                        return formatDate(options);
                    }
                    case this.Type.FLOAT: {
                        return formatFloat(options);
                    }
                    case this.Type.INTEGER: {
                        return formatInteger(options);
                    }
                    default: {
                        return options.value;
                    }
                }
            },
            isEmpty(value) {
                let output = false;
                let type = Object.prototype.toString.call(value);
                switch (type) {
                    case '[object Object]': {
                        if (Object.keys.length <= 0) {
                            output = true;
                        }
                        break;
                    }
                    case '[object String]': {
                        if (value == '' || value == null || value == undefined) {
                            output = true;
                        }
                        else if (value.trim() == '') {
                            output = true;
                        }
                        break;
                    }
                }
    
                return output;
            },
            normalizeDate(options) {
                let date = NS_Format.parse({ type: this.Type.DATE, value: options.value });
                let output = dateToString(date);
                return output;
            },
            parse(options) {
                return NS_Format.parse(options)
            }
        }
    }
);