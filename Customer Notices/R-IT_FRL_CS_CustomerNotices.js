/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
 define(['N/currentRecord', 'N/ui/dialog'], function (currentRecord, dialog) {

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *     
     */        
    function saveRecord(context) {

        var btnIds = ['NextLevel', 'CurrentLevel', 'Level1', 'Level2', 'Level3', 'Level4', 'Notice'];
        var cRecord = currentRecord.get();
        var optionFlag = cRecord.getValue({fieldId : 'custpage_optionflag'});   
        alert('optionFlag = ' + optionFlag);
        var selected = btnIds.indexOf(optionFlag);
        
        if(selected == -1 && optionFlag != 'FILTERS') {

            var options = {
                title: "Option Selected",
                message: "Do you want to send the dunning letters with the option 'CURRENT LEVEL'?"
            };

            function success(result) {
                
                if(result){
                    cRecord.setValue({
                        fieldId : 'custpage_optionflag',
                        value : 'NextLevel'
                    });                    

                    document.forms['main_form'].submitter.click();    
                }
            }

            function failure(reason) {
                console.log('Ups... Something was wrong!');
                return false;
            }

            dialog.confirm(options).then(success).catch(failure);
        } else{
            return true;
        }   
        
        return false;
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *     
     */
    function fieldChanged(context) {
        try{
            console.log('Begin fieldChanged: ' + context.fieldId);
            var fieldId = context.fieldId;
            var cRecord = currentRecord.get();

            if(!empty(fieldId) && (fieldId == 'custpage_subsid' || fieldId == 'custpage_customer' || fieldId == 'custpage_levels' || fieldId == 'custpage_invoice' || fieldId == 'custpage_condition' || fieldId == 'custpage_open_balance')){
                if(fieldId == "custpage_open_balance"){
                    var cond = cRecord.getValue("custpage_condition");
                    if(empty(cond)){
                        return;
                    } 
                }
                if(fieldId == "custpage_condition"){
                    var opBalance = cRecord.getValue("custpage_open_balance");
                    if(empty(opBalance)){
                        return;
                    } 
                }
                cRecord.setValue({
                    fieldId : 'custpage_optionflag',
                    value : 'FILTERS'
                });                    
                document.forms['main_form'].submitter.click();                        
            }
        }catch(e){
            console.log(e);
            return false;
        }
        
        return true;
    }

    function triggerbtn_II() {

        console.log('Action Level1');

        var options = {
            title: "Option Selected",
            message: "Do you want to send the Dunning Letters with the option 'LEVEL 1'?"
        };

        function success(result) {
            
            if(result){
                var cRecord = currentRecord.get();
                cRecord.setValue({
                    fieldId : 'custpage_optionflag',
                    value : 'Level1'
                });                    
                document.forms['main_form'].submitter.click();  
            }
        }

        function failure(reason) {
            console.log('Ups... Something was wrong!');
            return false;
        }

        dialog.confirm(options).then(success).catch(failure);        
    }

    function triggerbtn_III() {

        console.log('Action Level2');

        var options = {
            title: "Option Selected",
            message: "Do you want to send the Dunning Letters with the option 'LEVEL 2'?"
        };

        function success(result) {
            
            if(result){        
                var cRecord = currentRecord.get();
                cRecord.setValue({
                    fieldId : 'custpage_optionflag',
                    value : 'Level2'
                });                    
                document.forms['main_form'].submitter.click();  
            }
        }

        function failure(reason) {
            console.log('Ups... Something was wrong!');
            return false;
        }

        dialog.confirm(options).then(success).catch(failure);        
    }   
    
    function triggerbtn_IV() {

        console.log('Action Level3');

        var options = {
            title: "Option Selected",
            message: "Do you want to send the Dunning Letters with the option 'LEVEL 3'?"
        };        

        function success(result) {
            
            if(result){  
                var cRecord = currentRecord.get();
                cRecord.setValue({
                    fieldId : 'custpage_optionflag',
                    value : 'Level3'
                });                    
                document.forms['main_form'].submitter.click();  
            }
        }    

        function failure(reason) {
            console.log('Ups... Something was wrong!');
            return false;
        }

        dialog.confirm(options).then(success).catch(failure);                           
    }       

    function triggerbtn_V() {

        console.log('Action Level4');

        var options = {
            title: "Option Selected",
            message: "Do you want to send the Dunning Letters with the option 'LEVEL 4'?"
        };        

        function success(result) {
            
            if(result){  
                var cRecord = currentRecord.get();
                cRecord.setValue({
                    fieldId : 'custpage_optionflag',
                    value : 'Level4'
                });                    
                document.forms['main_form'].submitter.click();  
            }
        }    

        function failure(reason) {
            console.log('Ups... Something was wrong!');
            return false;
        }

        dialog.confirm(options).then(success).catch(failure);                           
    } 

    function empty(val) {
        return val === '' || val === null || val === undefined;
    }   

    return {
        triggerbtn_II: triggerbtn_II,
        triggerbtn_III: triggerbtn_III,
        triggerbtn_IV: triggerbtn_IV,
        triggerbtn_V: triggerbtn_V,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
});
