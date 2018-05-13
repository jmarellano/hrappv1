let RetryHandler = function () {
    this.interval = 1000; // Start at one second
    this.maxInterval = 60 * 1000; // Don't wait longer than a minute
};
RetryHandler.prototype.retry = function (fn) {
    setTimeout(fn, this.interval);
    this.interval = this.nextInterval_();
};
RetryHandler.prototype.reset = function () {
    this.interval = 1000;
};
RetryHandler.prototype.nextInterval_ = function () {
    let interval = this.interval * 2 + this.getRandomInt_(0, 1000);
    return Math.min(interval, this.maxInterval);
};
RetryHandler.prototype.getRandomInt_ = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
MediaUploader = function (options) {
    let noop = function () { };
    this.file = options.file;
    this.contentType = options.contentType || this.file.type || 'application/octet-stream';
    this.metadata = options.metadata || {
        'title': this.file.name,
        'mimeType': this.contentType
    };
    this.token = options.token;
    this.onComplete = options.onComplete || noop;
    this.onProgress = options.onProgress || noop;
    this.onError = options.onError || noop;
    this.offset = options.offset || 0;
    this.chunkSize = options.chunkSize || 0;
    this.retryHandler = new RetryHandler();

    this.url = options.url;
    if (!this.url) {
        let params = options.params || {};
        params.uploadType = 'resumable';
        this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
    }
    this.httpMethod = options.fileId ? 'PUT' : 'POST';
};
MediaUploader.prototype.upload = function () {
    let xhr = new XMLHttpRequest();
    xhr.open(this.httpMethod, this.url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

    xhr.onload = function (e) {
        if (e.target.status < 400) {
            let location;
            this.url = location = e.target.getResponseHeader('Location');
            this.sendFile_();
        } else {
            this.onUploadError_(e);
        }
    }.bind(this);
    xhr.onerror = this.onUploadError_.bind(this);
    xhr.send(JSON.stringify(this.metadata));
};
MediaUploader.prototype.sendFile_ = function () {
    let content = this.file;
    let end = this.file.size;

    if (this.offset || this.chunkSize) {
        // Only bother to slice the file if we're either resuming or uploading in chunks
        if (this.chunkSize) {
            end = Math.min(this.offset + this.chunkSize, this.file.size);
        }
        content = content.slice(this.offset, end);
    }

    let xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (end - 1) + "/" + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
        xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send(content);
};
MediaUploader.prototype.resume_ = function () {
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Range', "bytes */" + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
        xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send();
};
MediaUploader.prototype.extractRange_ = function (xhr) {
    let range = xhr.getResponseHeader('Range');
    if (range) {
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }
};
MediaUploader.prototype.onContentUploadSuccess_ = function (e) {
    if (e.target.status === 200 || e.target.status === 201) {
        this.onComplete(e.target.response);
    } else if (e.target.status === 308) {
        this.extractRange_(e.target);
        this.retryHandler.reset();
        this.sendFile_();
    }
};
MediaUploader.prototype.onContentUploadError_ = function (e) {
    if (e.target.status && e.target.status < 500) {
        this.onError(e.target.response);
    } else {
        this.retryHandler.retry(this.resume_.bind(this));
    }
};
MediaUploader.prototype.onUploadError_ = function (e) {
    this.onError(e.target.response);
};
MediaUploader.prototype.buildQuery_ = function (params) {
    params = params || {};
    return Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
};
MediaUploader.prototype.buildUrl_ = function (id, params, baseUrl) {
    let url = baseUrl || 'https://www.googleapis.com/upload/drive/v3/files/';
    if (id) {
        url += id;
    }
    let query = this.buildQuery_(params);
    if (query) {
        url += '?' + query;
    }
    return url;
};