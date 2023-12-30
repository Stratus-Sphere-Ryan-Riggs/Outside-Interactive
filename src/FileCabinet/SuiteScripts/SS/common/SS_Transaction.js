/**
 * Wrapper module for Transaction constants
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/record'
    ],
    (
        NS_Record
    ) => {
        const FIELDS = {
            ACCOUNT:                    'account',
            ALT_NAME:                   'altname',
            AMOUNT_REMAINING:           'amountremaining',
            BALANCE:                    'balance',
            CLASS:                      'class',
            CLEARED:                    'cleared',
            CLEARED_DATE:               'cleareddate',
            CREATED_FROM:               'createdfrom',
            CURRENCY:                   'currency',
            CURRENCY_NAME:              'currencyname',
            CURRENCY_SYMBOL:            'currencysymbol',
            CUSTOM_FORM:                'customform',
            DAYS_OVERDUE:               'daysoverdue',
            DEPARTMENT:                 'department',
            ENTITY:                     'entity',
            EXCHANGE_RATE:              'exchangerate',
            EXTERNAL_ID:                'externalid',
            ID:                         'id',
            INTERNAL_ID:                'internalid',
            IS_BASE_CURRENCY:           'isbasecurrency',
            JOB:                        'job',
            LAST_MODIFIED_DATE:         'lastmodifieddate',
            LOCATION:                   'location',
            MEMO:                       'memo',
            NAME:                       'name',
            OTHER_REF_NUM:              'otherrefnum',
            PAYMENT:                    'payment',
            POSTING_PERIOD:             'postingperiod',
            PREPAYMENT_ACCOUNT:         'prepaymentaccount',
            PRINT_VOUCHER:              'printvoucher',
            PURCHASE_ORDER:             'purchaseorder',
            STATUS:                     'status',
            SUBSIDIARY:                 'subsidiary',
            SUPERVISOR_APPROVAL:        'supervisorapproval',
            TERMS:                      'terms',
            TO_BE_PRINTED:              'tobeprinted',
            TRAN_DATE:                  'trandate',
            TRAN_ID:                    'tranid',
            TRANSACTION_NUMBER:         'transactionnumber',
            VENDOR:                     'vendor'
        };

        const SUBLISTS = {
            ACCOUNTING_BOOKS:           'accountingbookdetail',
            EXPENSE:                    'expense',
            ITEM:                       'item'
        };

        const SUBLIST_FIELDS = {
            ACCOUNTING_BOOK:            'accountingbook',
            AMOUNT:                     'amount',
            CLASS:                      'class',
            DEPARTMENT:                 'department',
            DESCRIPTION:                'description',
            EXCHANGE_RATE:              'exchangerate',
            ITEM:                       'item',
            PORT:                       'custcol_osg_port',
            QUANTITY:                   'quantity',
            RATE:                       'rate',
            VOYAGE:                     'cseg_osg_voyage'
        };

        const TYPES = {
            CASH_REFUND:                'cashrefund',
            CASH_SALE:                  'cashsale',
            CUSTOMER_DEPOSIT:           'customerdeposit',
            CUSTOMER_PAYMENT:           'customerpayment',
            CUSTOMER_REFUND:            'customerrefund',
            DEPOSIT:                    'deposit',
            DEPOSIT_APPLICATION:        'depositapplication',
            INVOICE:                    'invoice',
            ITEM_FULFILLMENT:           'itemfulfillment',
            JOURNAL_ENTRY:              'journalentry',
            PURCHASE_ORDER:             'purchaseorder',
            SALES_ORDER:                'salesorder',
            VENDOR_BILL:                'vendorbill',
            VENDOR_PAYMENT:             'vendorpayment',
            VENDOR_PREPAYMENT:          'vendorprepayment'
        };

        return {
            get Fields() {
                return FIELDS;
            },
            get SublistFields() {
                return SUBLIST_FIELDS;
            },
            get Sublists() {
                return SUBLISTS;
            },
            get Types() {
                return TYPES;
            },
        }
    }
);