/**
 * Wrapper module for N/file
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/file',
        './SS_Search'
    ],
    (
        NS_File,
        SS_Search
    ) => {
        const MODULE = 'SS.File';
        
        return {
            create (options) {
                let title = `${MODULE}.Create`;

                if (!options.folder) {
                    return { status: false, error: 'Missing required value: Folder.' };
                }
    
                if (!options.name) {
                    options.name = `file_${(new Date()).getTime()}.txt`;
                    options.fileType = NS_File.Type.PLAINTEXT;
                }
    
                if (!options.fileType) {
                    options.fileType = NS_File.Type.PLAINTEXT;
                }
    
                try {
                    let fileObject = NS_File.create(options);
                    let fileId = fileObject.save();
        
                    return {
                        status: true,
                        data: {
                            id: fileId,
                            name: options.name
                        }
                    };
                }
                catch (ex) {
                    let errorMessage = ex.message || ex.toString();
                    nsLog.error({ title, details: errorMessage });
                    return { status: false, error: errorMessage };
                }
            },
            get (options) {
                let title = `${MODULE}.Get`;
                let { name } =  options;
                let fileId = 0;
    
                if (!name) {
                    nsLog.debug({ title: title, details: 'Missing required value: File Name.' });
                    return fileId;
                }
                let fileSearch = SS_Search.create({
                    type: 'file',
                    filters: [
                        [ 'name', 'startswith', `${name}` ]
                    ]
                });
                
                let fileResults = fileSearch.getFirst();
                if (fileResults.length <= 0) {
                    nsLog.debug({ title: title, details: `No file record found with Name = ${name}.` });
                    return fileId;
                }
    
                return fileResults[0].id;
            },
            load (options) {
                let title = `${MODULE}.Load`;
                let fileObject = null;
    
                if (options.id) {
                    return NS_File.load({ id: options.id });
                }
    
                if (!options.name) {
                    nsLog.error({ title: title, details: `Missing required value: File ID or Name.` });
                    return fileObject;
                }
    
                let fileId = this.get({ name: options.name });
                if (fileId <= 0) { return fileObject; }
    
                return NS_File.load({ id: fileId });
            },
            read (options) {
                let title = `${MODULE}.Read`;
                let fileObject = null;
                let fileContents = '';
    
                if (options.id) {
                    fileObject = NS_File.load({ id: options.id });
                    if (!fileObject) { return fileContents; }
    
                    return fileObject.getContents();
                }
    
                if (!options.name) {
                    nsLog.error({ title: title, details: `Missing required value: File ID or Name.` });
                    return fileContents;
                }
    
                fileObject = this.load({ name: options.name });
                fileContents = fileObject.getContents();
    
                return fileContents;
            }
        };
    }
);