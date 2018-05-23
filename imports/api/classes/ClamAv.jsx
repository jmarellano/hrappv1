export default class ClamAv {
    constructor(options) {
        this.clam = server.getClamscan(options);
    }
    scanFile(filePath, callback) {
        let future = server.createFuture();
        let result = { success: false, error: 'Something went wrong!' };
        this.clam.is_infected(filePath, function (err, file, isInfected) {
            if (err) {
                console.error(err);
                future.return({ ...result, error: err });
            }
            if (callback)
                callback(err, file, isInfected);
            result = { success: true, isInfected };
            future.return(result);
        });
        return future.wait();
    }
    scanDir(dirPath, endCallback, fileCallback) {
        let future = server.createFuture();
        let result = { success: false, error: 'Something went wrong!' };
        this.clam.scan_dir(dirPath, function (err, good_files, bad_files) {
            if (!err) {
                if (endCallback)
                    endCallback();
                result = { success: true, isInfected: bad_files.length > 0 };
            } else {
                console.error(err);
                result = { ...result, error: err };
            }
            future.return(result);
        }, fileCallback);
        return future.wait();
    }
}