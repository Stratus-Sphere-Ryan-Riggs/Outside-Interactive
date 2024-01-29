/**
 * Wrapper module for all constants
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        './SS_Transaction'
    ],
    (
        SS_Transaction
    ) => {
        let ENTITY = {};
        ENTITY.CustomFields = {
            CAS:                                'custentity_cas'
        };

        let TRANSACTION = SS_Transaction;
        TRANSACTION.CustomTypes = {};
        TRANSACTION.CustomFields = {
            LAST_COMMUNICATION_DATE:            'custbody_ss_last_statement_comm_date'
        };
        TRANSACTION.CustomSublistFields = {};

        const CUSTOM_LISTS = {
            BankingMethod: 'customlist_vr_bankdetailmethod',
            DataTableSuiteletTypes: {
                DUNNING_STATEMENTS: '1'
            },
            DataTableTaskStatus: {
                PENDING: '1',
                IN_PROGRESS: '2',
                COMPLETED: '3',
                COMPLETED_WITH_ERRORS: '4',
                FAILED: '5'
            },
            DunningLevels: {
                Id: 'customlist_ss_dunning_levels',
                Values: [
                    { id: '1', from: 0, to: 0 },
                    { id: '2', from: 1, to: 30 },
                    { id: '3', from: 31, to: 60 },
                    { id: '4', from: 61, to: 90 },
                    { id: '5', from: 90, to: 0 }
                ]
            },
            TypeOfAccount: 'customlist_vr_typeofaccount'
        };

        const CUSTOM_RECORDS = {
            DataTableTask: {
                Id: 'customrecord_ss_dt_task',
                Fields: {
                    DATA                        : 'custrecord_ss_dt_task_data',
                    ERRORS                      : 'custrecord_ss_dt_task_errors',
                    EXPECTED                    : 'custrecord_ss_dt_task_expected',
                    GENERATED                   : 'custrecord_ss_dt_task_generated',
                    STATUS                      : 'custrecord_ss_dt_task_status',
                    TYPE                        : 'custrecord_ss_dt_task_type'
                }
            },
            VendorRequest: {
                Id: 'customrecord_vendor_request',
                Fields: {
                    // _1099_ELIGIBLE              : 'custrecord_vr_1099',
                    // ACH                         : 'custrecord_ach',
                    ADDITIONAL_VENDOR_INFO      : 'custrecord_vr_addtlveninfo',
                    ADDRESS                     : 'custrecord1524',
                    ADDRESS_1                   : 'custrecord_vr_addr1',
                    ADDRESS_2                   : 'custrecord_vr_addr2',
                    AFFIRMATIVE_ACTION_ACK      : 'custrecord_vr_affirmaction',
                    ANTI_BRIBERY_POLICY         : 'custrecord_vr_antibribcorrup',
                    ANTI_HUMAN_TRAF_POLICY      : 'custrecord_vr_antihtp',
                    // APPROVAL_DATE_AP_CLERK      : 'custrecord_vr_apclerkapprovaldate',
                    // APPROVAL_DATE_CONTROLLER    : 'custrecord_vr_controllerapprovaldate',
                    // APPROVAL_DATE_SUPERVISOR    : 'custrecord_vr_date_approved',
                    // APPROVED_BY_AP_CLERK        : 'custrecord_vr_apclerkapproval',
                    // APPROVED_BY_CONTROLLER      : 'custrecord_vr_controllerapprover',
                    // APPROVED_BY_SUPERVISOR      : 'custrecord_vr_approved_by',
                    BANK_COUNTRY                : 'custrecord_vr_bankcountry',
                    BANK_CURRENCY               : 'custrecord_vr_bankaccountcurrency',
                    BANK_DETAIL_METHOD          : 'custrecord_vr_bankdetailmethod',
                    BANK_ROUTING_NUMBER         : 'custrecord_vr_bankroutingnumber',
                    BANK_SORT_CODE              : 'custrecord_vr_intl_banksortcode',
                    BANK_CITY                   : 'custrecord_vr_intl_bankcity',
                    BANK_STATE                  : 'custrecord_vr_intl_stateprovince',
                    BANK_STREET                 : 'custrecord_vr_intl_bankstreetaddress',
                    BANK_ZIP                    : 'custrecord_vr_intl_postalcode',
                    BRANCH_TRANSIT_NUMBER       : 'custrecord_vr_intl_branchtransnum',
                    BSB_CODE                    : 'custrecord_vr_intl_bsbcode',
                    CATEGORY                    : 'custrecord_vr_category',
                    CERTIFICATE_OF_INSURANCE    : 'custrecord_vr_certofinsurance',
                    CITY                        : 'custrecord_vr_city',
                    COUNTRY                     : 'custrecord_vr_country',
                    CREDITOR_SWIFT_CODE         : 'custrecord_vr_bicswift',
                    CURRENCY                    : 'custrecord_vr_currency',
                    EMAIL                       : 'custrecord_vr_email',
                    // EMAIL_SENT_AP_CLERK         : 'custrecord_finalize_tc',
                    // EMAIL_SENT_CONTROLLER       : 'custrecord_vr_assign_terms',
                    // EMAIL_SENT_OFC_ASST         : 'custrecord_obtain_w9',
                    // EMAIL_SENT_SUPERVISOR       : 'custrecord_vr_confirm_address',
                    // EMAIL_SENT_VENDOR_REQUEST   : 'custrecord_vr_confirm',
                    FAX                         : 'custrecord_vr_fax',
                    FINANCIAL_INSTITUTION       : 'custrecord_vr_intl_fininstnum',
                    GHG_EMISSION_AMOUNTS        : 'custrecord_vr_ghgemissionamount',
                    GHG_EMISSIONS_AUDITED       : 'custrecord_vr_ghgaudit',
                    GHG_EMISSIONS_CALC          : 'custrecord_vr_ghgemission',
                    HAS_SUSTAINABILITY_REPORT   : 'custrecord_vr_sustreport',
                    IBAN                        : 'custrecord_vr_intl_iban',
                    IS_BIZ_SMALL                : 'custrecord_vr_smallbiz',
                    IS_BIZ_SMALL_HUBZONE        : 'custrecord_vr_hubzone',
                    IS_BIZ_SMALL_MINORITY       : 'custrecord_vr_minorityosb',
                    IS_BIZ_SMALL_VET_DISABLED   : 'custrecord_vr_sdvosmallbiz',
                    IS_BIZ_VETERAN_OWNED        : 'custrecord_vr_vetownedbiz',
                    IS_BIZ_WOMEN_OWNED          : 'custrecord_vr_womenownedbiz',
                    // LINK_TO_VENDOR              : 'custrecord_vr_link_vendor',
                    MISC_BANKING_DETAILS        : 'custrecord_vr_intl_bankingdetails',
                    NAICS_CODE                  : 'custrecord_vr_naicscode',
                    NOTES                       : 'custrecord_vr_notes',
                    NUMBER_OF_EMPLOYEES         : 'custrecord_vr_numemployee',
                    PARENT_VENDOR               : 'custrecord_vr_parentvendor',
                    // PAYMENT_TERMS               : 'custrecord_vr_payment_terms',
                    // PERFORM_DUP_SEARCH          : 'custrecord_vr_duplicate',
                    PHONE                       : 'custrecord_vr_phone',
                    PREFERRED_PAYMENT_METHOD    : 'custrecord_vr_pref_pymt_method',
                    PRIMARY_CONTACT             : 'custrecord_vr_primary_contact',
                    // PURCHASE_CONTRACT           : 'custrecord_purchase_contract',
                    PURPOSE_OF_PAYMENT          : 'custrecord_vr_intl_purposeofpayment',
                    RECEIVING_ACCT_NUMBER       : 'custrecord_vr_accountnumber',
                    RECEIVING_BANK_NAME         : 'custrecord_vr_receivingbankname',
                    // REJECTION_NOTES             : 'custrecord_rejection_notes',
                    REMIT_TO_ADDR_1             : 'custrecord_vr_remaddr1',
                    REMIT_TO_ADDR_2             : 'custrecord_vr_remaddr2',
                    REMIT_TO_CITY               : 'custrecord_vr_remcity',
                    REMIT_TO_COUNTRY            : 'custrecord_vr_remcountry',
                    REMIT_TO_STATE              : 'custrecord_vr_remstate',
                    REMIT_TO_ZIP                : 'custrecord_vr_remzip',
                    // REQUEST_DATE                : 'custrecord_vr_request_date',
                    // REQUESTED_BY                : 'custrecord_vr_requested_by',
                    REVENUE                     : 'custrecord_vr_revenue',
                    SAME_AS_LEGAL_ADDRESS       : 'custrecord_vr_sameaslegal',
                    // SEARCH_VENDOR_MASTER        : 'custrecord_search_vendor_master',
                    // SIGNED_TC                   : 'custrecord_signed_tc',
                    SSN                         : 'custrecord_vr_ssn',
                    STATE                       : 'custrecord_vr_state',
                    STATUS                      : 'custrecord_vr_status',
                    // SUBSIDIARY                  : 'custrecord_vr_subsidiary',
                    // SUGGESTED_EXPENSE_ACCT      : 'custrecord1529',
                    T_C                         : 'custrecord_signed_tc',
                    TAX_ID                      : 'custrecord_vr_tax_id',
                    TYPICAL_PRODUCTS_SERVICES   : 'custrecord_vr_typicalprodserv',
                    TYPE_OF_ACCOUNT             : 'custrecord_vendor_request_eft_bill_pay',
                    VENDOR_NAME                 : 'custrecord_vr_companyname',
                    W9                          : 'custrecord_vr_w9',
                    ZIP_CODE                    : 'custrecord_vr_zip'
                }
            }
        };

        const FORMS = {
            DUNNING_STATEMENTS: {
                Title: 'Send Customer Statements',
                Buttons: [
                    {
                        id: 'custpage_btn_apply_filters',
                        label: 'Apply Filters',
                        functionName: 'applyFilters'
                    },
                    {
                        label: 'Send Statements',
                        submit: true
                    }
                ],
                ClientScriptFile: 'SS_CS_DunningStatements.js',
                FieldGroups: [
                    {
                        id: 'custpage_filters',
                        label: 'Search Criteria'
                    },
                    {
                        id: 'custpage_table_container',
                        label: 'Customer Overdue Balance'
                    }
                ],
                Fields: [
                    {
                        id: 'custpage_subsidiary',
                        label: 'Subsidiary',
                        type: 'select',
                        source: 'subsidiary',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_levels',
                        label: 'Levels',
                        type: 'select',
                        source: 'customlist_ss_dunning_levels',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_customer',
                        label: 'Customer',
                        type: 'select',
                        source: 'customer',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_condition',
                        label: 'Condition',
                        type: 'select',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_cas',
                        label: 'CAS',
                        type: 'select',
                        source: 'employee',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_open_balance',
                        label: 'Open Balance (USD)',
                        type: 'currency',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_lastcomm',
                        label: 'Last Communication',
                        type: 'date',
                        source: 'customlist_ss_last_comm',
                        filter: true,
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_url_values',
                        label: 'URL Values',
                        type: 'longtext',
                        display: 'hidden',
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_custom_js',
                        label: 'JS',
                        type: 'inlinehtml',
                        container: 'custpage_filters'
                    },
                    {
                        id: 'custpage_table',
                        label: 'Table',
                        type: 'inlinehtml',
                        layout: 'outsidebelow',
                        container: 'custpage_table_container'
                    }
                ]
            }
        };

        const NS5_CATEGORIES = {
            ON_BOARD:                           '1',
            OFF_SITE:                           '2',
            SUPPLIER:                           '3'
        };

        const REQUEST_PARAMETERS = {
            DATATABLE_BACKEND: [
                'action',
                'sltype'
            ],
            DUNNING_STATEMENTS: [
                'dosearch',
                'subsidiary',
                'levels',
                'customer',
                'condition',
                'cas',
                'openbalanceusd',
                'lastcommunication'
            ],
        };

        const SCRIPTS = {
            DataTableSuitelet: {
                BACKEND: {
                    scriptId: 'customscript_ss_sl_dt_backend',
                },
                DUNNING_STATEMENTS: {
                    deploymentId: 'customdeploy_ss_sl_dt_backend_dunstm'
                }
            },
            DataTableTaskMapReduce: {
                scriptId: 'customscript_ss_mr_dt_task'
            }
        };

        const SCRIPT_PARAMETERS = {
            /* DunningStatements: {
                StatementSearchId       : 'custscript_ss_cs_search',
                TaskSearchId            : 'custscript_ss_cs_tasks_search'
            }, */
            CustomerStatementTaskSearch : '',
            FileUploadFolder            : 'custscript_ss_sl_ven_onboard_form_folder',
            HtmlTemplateFile            : 'custscript_ss_sl_ven_onboard_form_html',
            // DataTableTaskRecord         : 'custscript_ss_mr_dt_task_record',
            DataTableSuitelet: {
                Type                    : 'custscript_ss_sl_dt_type'
            },
            DataTableSuiteletBackend    : {
                InProgressTasks         : 'custscript_ss_sl_dt_backend_inprog_tasks',
                RowSearch               : 'custscript_ss_sl_dt_backend_row_search',
                TaskFolder              : 'custscript_ss_sl_dt_backend_task_folder'
            },
            DataTableTaskMapReduce      : {
                TaskRecord              : 'custscript_ss_mr_dt_task_record'
            }
        };

        return {
            CustomLists         : CUSTOM_LISTS,
            CustomRecords       : CUSTOM_RECORDS,
            Entity              : ENTITY,
            Forms               : FORMS,
            NS5_Categories      : NS5_CATEGORIES,
            RequestParameters   : REQUEST_PARAMETERS,
            ScriptParameters    : SCRIPT_PARAMETERS,
            Scripts             : SCRIPTS,
            Templates           : {
                DataTableSuitelet       : 'DataTable_Template.html'
            },
            Transaction         : TRANSACTION
        };
    }
);