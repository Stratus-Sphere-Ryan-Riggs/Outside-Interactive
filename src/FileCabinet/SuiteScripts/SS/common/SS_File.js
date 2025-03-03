/**
 * Wrapper module for N/file
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/file',
        './SS_Record',
        './SS_Search'
    ],
    (
        NS_File,
        SS_Record,
        SS_Search
    ) => {
        const MODULE = 'SS.File';

        const getContainingFolder = (options) => {
            const TITLE = `${MODULE}.GetContainingFolder`;
            let { id } = options;

            let fileSearch = SS_Search.create({
                type: 'file',
                filters: [ 'internalid', 'anyof', id ],
                columns: [ 'folder' ]
            });
            let fileResults = fileSearch.getResults();
            log.debug({ title: TITLE, details: JSON.stringify(fileResults) });
            
            return fileResults[0]?.folder;
        };

        const getType = (options) => {
            const TITLE = 'Get File Type';
            let extension = parseLast(options.name);
            let type = NS_File.Type.PLAINTEXT;

            switch (extension) {
                case 'bmp': { type = NS_File.Type.BPMIMAGE; break; }
                case 'css': { type = NS_File.Type.STYLESHEET; break; }
                case 'csv': { type = NS_File.Type.CSV; break; }
                case 'doc':
                case 'docx': { type = NS_File.Type.WORD; break; }
                case 'gif': { type = NS_File.Type.GIFIMAGE; break; }
                case 'gzip': { type = NS_File.Type.GZIP; break; }
                case 'html': { type = NS_File.Type.HTMLDOC; break; }
                case 'jpg':
                case 'jpeg': { type = NS_File.Type.JPGIMAGE; break; }
                case 'json': { type = NS_File.Type.JSON; break; }
                case 'pdf': { type = NS_File.Type.PDF; break; }
                case 'png': { type = NS_File.Type.PNGIMAGE; break; }
                case 'svg': { type = NS_File.Type.SVG; break; }
                case 'xls':
                case 'xlsx': { type = NS_File.Type.EXCEL; break; }
                case 'xml': { type = NS_File.Type.XMLDOC; break; }
                case 'zip': { type = NS_File.Type.ZIP; break; }
                default: { type = NS_File.Type.PLAINTEXT; break; }
            }

            return type;
        };

        const parseLast = (name) => {
            if (!name) {
                return '';
            }

            let arrParts = name.split('.');
            if (arrParts.length <= 0) {
                return '';
            }

            return arrParts[arrParts.length - 1].toLowerCase();
        };

        return {
            copy (options) {
                const TITLE = `${MODULE}.Copy`;
                let { folder, id, move } = options;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });

                if (!id) {
                    log.debug({ title: TITLE, details: 'Missing required value: File Id.' });
                    return id;
                }

                if (!folder) {
                    log.debug({ title: TITLE, details: 'Missing required value: Destination Folder.' });
                    return id;
                }

                let oldFolder = getContainingFolder({ id });
                let fileObject = NS_File.load({ id });
                fileObject.folder = parseInt(folder);
                let fileId = fileObject.save();
                log.debug({ title: TITLE, details: `Successfully copied new file ${fileId}.` });

                if (move === true) {
                    if (oldFolder) {
                        log.debug({ title: TITLE, details: `Deleting old folder ${oldFolder}...` });
                        SS_Record.delete({ type: 'folder', id: oldFolder });
                    }
                }

                return fileId;
            },
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

                let fileOptions = {
                    fileType: options.name ? getType({ name: options.name }) : NS_File.Type.PLAINTEXT,
                    folder: options.folder,
                    name: options.name || `file_${(new Date()).getTime()}.txt`,
                };
                fileOptions.contents = options.getContents();
    
                try {
                    let fileObject = NS_File.create(fileOptions);
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
                    log.error({ title, details: errorMessage });
                    return { status: false, error: errorMessage };
                }
            },
            delete (options) {
                const TITLE = `${MODULE}.Delete`;
                let { id } = options;

                if (!id) {
                    log.debug({ title: TITLE, details: 'Missing required value: File Id.' });
                    return id;
                }

                NS_File.delete({ id });
            },
            get (options) {
                let title = `${MODULE}.Get`;
                let { name } =  options;
                let fileId = 0;
    
                if (!name) {
                    log.debug({ title: title, details: 'Missing required value: File Name.' });
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
                    log.debug({ title: title, details: `No file record found with Name = ${name}.` });
                    return fileId;
                }
    
                return fileResults[0].id;
            },
            // getContainingFolder (options) {},
            load (options) {
                let title = `${MODULE}.Load`;
                let fileObject = null;
    
                if (options.id) {
                    return NS_File.load({ id: options.id });
                }
    
                if (!options.name) {
                    log.error({ title: title, details: `Missing required value: File ID or Name.` });
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
                    log.error({ title: title, details: `Missing required value: File ID or Name.` });
                    return fileContents;
                }
    
                fileObject = this.load({ name: options.name });
                fileContents = fileObject.getContents();
    
                return fileContents;
            }
        };
    }
);