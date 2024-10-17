/**
 * @author              Marlon Villarama
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @NScriptType         ClientScript
 */

define(
    [],
    () => {
        const MODULE = `Strat.CS.ApprovalRejectionNotes`;

        const toggleOverlay = (show) => {
            let overlay = document.getElementById('strat_overlay');
            if (show === true) {
                overlay.classList.remove('overlay_hide');
            }
            else {
                overlay.classList.add('overlay_hide');
            }
        };

        const saveRecord = (context) => {
            toggleOverlay(true);
            return true;
        };

        return {
            saveRecord
        };
    }
);