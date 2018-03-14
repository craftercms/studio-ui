// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function () {

    // TODO move this out of here into its own file and make it a "component"

    var cache = {  };

    this.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = (!/\W/.test(str))
            ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML)
            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            : new Function("obj", [
            "var p = [],",
            "print = function () { p.push.apply(p.arguments) };",
            // Introduce the data as local variables using with(){}
            "with (obj) {",
            "p.push('",
            // Convert the template into pure JavaScript
            (str)
                .replace(/[\r\t\n]/g, " ")
                .split("<%")
                .join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t")
                .join("');")
                .split("%>")
                .join("p.push('")
                .split("\r")
                .join("\\'")
            + "');",
            "};",
            "return p.join('');"
        ].join(""));

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };

}) ();

Element.prototype.hasClassName = function(name) {
    return new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function(name) {
    if (!this.hasClassName(name)) {
        var c = this.className;
        this.className = c ? [c, name].join(' ') : name;
    }
};

Element.prototype.removeClassName = function(name) {
    if (this.hasClassName(name)) {
        var c = this.className;
        this.className = c.replace(
            new RegExp("(?:^|\\s+)" + name + "(?:\\s+|$)", "g"), "");
    }
};

// insertAdjacentHTML(), insertAdjacentText() and insertAdjacentElement
// for Netscape 6/Mozilla by Thor Larholm me@jscript.dk
if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement) {

    HTMLElement.prototype.insertAdjacentElement = function (where, parsedNode) {
        switch (where) {
            case 'beforeBegin':
                this.parentNode.insertBefore(parsedNode, this)
                break;
            case 'afterBegin':
                this.insertBefore(parsedNode, this.firstChild);
                break;
            case 'beforeEnd':
                this.appendChild(parsedNode);
                break;
            case 'afterEnd':
                if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);
                else this.parentNode.appendChild(parsedNode);
                break;
        }
    }

    HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
        var r = this.ownerDocument.createRange();
        r.setStartBefore(this);
        var parsedHTML = r.createContextualFragment(htmlStr);
        this.insertAdjacentElement(where, parsedHTML);
    }

    HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
        var parsedText = document.createTextNode(txtStr)
        this.insertAdjacentElement(where, parsedText)
    }

}

(function () {
    "use strict";

    var CSA = CStudioAuthoring,
        join = function (array, chr) {
            return array.join(chr || "");
        },
        tmpl = window.tmpl,
        isJSON = CSA.Utils.isJSON;

    var TMPL = join([
            '<div class="<%= theme.fileDisplay %>">',
            '<strong><%= file.name %></strong>\n',
            '(<%= file.type %>, <%= Math.round(file.size / 1024) %> KB) - ',
            '<span class="progress">0%</span>',
            '</div>'
        ]),
        TMPL_ERROR = join([
            '<div class="<%= theme.fileError %>"',
            '<span>',
            'An error has occurred trying to read the dropped file. ',
            '(<%= typeof error !== "undefined" && error.info ? error.info : "" %>)',
            '</span>',
            '</div>'
        ]),
        TMPL_UPLOAD_ERROR = join([
            '<div class="<%= theme.uploadError %>"',
            '<span>An error has occurred trying to upload <i>"<%= file.name %>"</i>.</span>',
            // TODO dismissing the message keeps the file UI container, remove it?
            '<button onclick="this.parentNode.parentNode.removeChild(this.parentNode)">Dismiss Message</button>',
            '</div>'
        ]),

    // Upload events
        SUCCESS = "success",
        ERROR = "error";

    var extend = function (target, src) {
            var value;
            for (var key in src) {
                value = src[key];
                if ((typeof value === 'object') && !(value instanceof HTMLElement) && !('splice' in value)) {
                    (typeof target[key] !== 'object') && (target[key] = { });
                    extend (target[key], value);
                } else {
                    target[key] = src[key];
                }
            }
            return target;
        },
        getElem = function (value) {
            var elem;
            if (value instanceof HTMLElement) {
                elem = value;
            } else if (typeof value === 'string') {
                elem = document.querySelector(value);
                !elem && (elem = document.getElementById(value));
            } else {
                elem = getElem (value.element);
            }
            return elem;
        };

    function FileManager () {
        this.files = {  };
        this.complete = {  };
    }

    extend(FileManager.prototype, {
        get: function (id) {
            return this.files[id];
        },
        push: function (id, file) {
            this.files[id] = file;
        },
        setCompleted: function (id) {
            this.complete[id] = true;
        }
    });

    function Dropbox () {

        // Default Dropbox settings
        this.oCfg = {
            /**
             * Element that will serve as the dropbox */
            element: '#dropbox',

            /**
             * Element that will display dropped
             * files and their status */
            display: '#dropbox',

            /**
             * File display UI element child that will serve as the
             * upload progress reporting element. Progress element is
             * passed to the showUploadProgress function */
            progress: '.progress',

            /**
             * The file in queue template */
            template: TMPL,
            /**
             * The file error template */
            templateError: TMPL_ERROR,
            /**
             * The file upload error template. Template is
             * called provided the file info, theme object,
             * HTTP response status code and the response text */
            templateUploadError: TMPL_UPLOAD_ERROR,

            /**
             * Theming css classes for the UI */
            theme: {
                over: 'dropbox-dragover',
                main: 'dropbox-element',
                fileDisplay: 'dropbox-file-display',
                fileError: 'dropbox-file-error',
                uploadError: 'dropbox-upload-error'
            },

            /**
             * The URL to upload files to */
            target: '/url/to/upload/files',
            /**
             * Uploaded file name in the submitted form data */
            uploadPostKey: 'submitted-file',
            /**
             * Additional parameters to be sent with the form data */
            formData: { },

            /**
             * Newly dropped elements may go on top or at the bottom of the queue.
             * This proper controls whether the file list display
             * behaves as a stack or a queue */
            newOnTop: false,

            /**
             * Flag to determine whether to start uploading immediately or
             * on demand */
            immediateUpload: true
        }

        this.manager = new FileManager ();
        this.subscribers = {  };

        var id = "DRPBX_" + (++ids);
        this.getID = function () { return id; };
        this.init.apply(this, arguments);

    }

    var DP = Dropbox.prototype,
    // unique instance id counter
        ids = 0,
    // private members container object
        _;

    _ = {
        addClass: function (c) {
            this.element.addClassName(c);
        },
        removeClass: function (c) {
            this.element.removeClassName(c);
        },
        dragover: function (e) {
            e.dataTransfer.dropEffect = 'copy';
            _.addClass.call(this, this.oCfg.theme.over);
        },
        dragleave: function (e) {
            _.removeClass.call(this, this.oCfg.theme.over);
        },
        drop: function (e) {

            // instance settings
            var cfg = this.oCfg;
            _.removeClass.call(this, cfg.theme.over);

            // Initialise the instance file collection if it has not
            // previously been initialised
            var id = this.getID(),
                manager = this.manager, // instance files
                files = e.dataTransfer.files, // drag/dropped files
                display = this.display,
                me = this; // instance

            if(!document.getElementById("folder" + cfg.formData.path)){
                display.insertAdjacentHTML('beforeEnd',
                    '<div class="folder-container" data-path="'+ cfg.formData.path +'" id="folder' + cfg.formData.path + '"></div>');
            }

            var length = e.dataTransfer.files.length;

            var queryStringUrlReplacement = function(url, param, value) {
                var re = new RegExp("[\\?&]" + param + "=([^&#]*)"), match = re.exec(url), delimiter, newString;

                if (match === null) {
                    // append new param
                    var hasQuestionMark = /\?/.test(url);
                    delimiter = hasQuestionMark ? "&" : "?";
                    newString = url + delimiter + param + "=" + value;
                } else {
                    delimiter = match[0].charAt(0);
                    newString = url.replace(re, delimiter + param + "=" + value);
                }

                return newString;
            };

            var getParameter = function(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            };

            var uploadFile = function(file, cfg) {
                var reader = new FileReader ();
                var CHUNK_SIZE = 1024;
                var offset = 0

                if(cfg.path) cfg.target = queryStringUrlReplacement(cfg.target, "path", cfg.path);

                reader.onerror = (function (aFile) {
                    return function (evt) {

                        var error = evt.target.error,
                            data = {
                                'theme': cfg.theme,
                                'error': {
                                    info: error.code || error.name
                                }
                            };

                        // Render thumbnail template with the file info (data object).
                        document.querySelector(cfg.display).insertAdjacentHTML(
                            cfg.newOnTop ? 'afterBegin' : 'beforeEnd', tmpl(cfg.templateError, data));

                    };
                }) (file);

                // Create a closure to capture the file information.
                reader.onload = (function (aFile) {
                    return function (evt) {

                        var fileID = "FILE_" + (++ids),
                            data = {
                                'theme': cfg.theme,
                                'file': extend(aFile, {
                                    // It seems like extending native type File
                                    // does not create problems and the properties
                                    // are usable
                                    'id': fileID,
                                    'src': (function (target) {
                                        try {
                                            return target.result;
                                        } catch (ex) {
                                            return null;
                                        }
                                    }) (evt.target)
                                })
                            };

                        var containerId = cfg.path,
                            container = document.getElementById("folder" + containerId);

                        // Render thumbnail template with the file info (data object).
                        container.insertAdjacentHTML(
                            cfg.newOnTop ? 'afterBegin' : 'beforeEnd', join([
                                '<div data-dropbox-file-id="', fileID ,'">',
                                tmpl(cfg.template, data),
                                '</div>'
                            ]));

                        // Store the file in this instance's file manager
                        manager.push(fileID, data.file);

                        if (cfg.immediateUpload) me.upload(fileID, cfg);

                    };
                }) (file);

                // Read in the image file as a data url.
                if( file.type.indexOf("image") !== -1){
                    reader.readAsDataURL(file);
                }else{
                    var slice = file.slice(offset, offset + CHUNK_SIZE);
                    reader.readAsDataURL(slice);
                }
            };

            var toArray = function(list) {
                return Array.prototype.slice.call(list || [], 0);
            };

            cfg.site = getParameter("site", cfg.target);
            cfg.path = getParameter("path", cfg.target);

            function traverseFileTree(item, cfg) {
                var path = cfg.path || "";
                if (item.isFile) {
                    item.file(function(file){
                        uploadFile(file, cfg);
                    });
                } else if (item.isDirectory) {

                    var cfgSubFolder = JSON.parse(JSON.stringify(cfg));
                    cfgSubFolder.path = cfg.path + "/" + item.name;

                    var serviceUri = CStudioAuthoring.Service.createServiceUri("/api/1/services/api/1/content/create-folder.json?site=" + cfg.site + "&path=" + cfg.path + "&name=" + item.name);
                    serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;

                    if(!document.getElementById("folder" + cfg.path + '/' + item.name)){
                        display.insertAdjacentHTML('beforeEnd',
                            '<div class="folder-container" data-path="'+ cfg.path + "/"+ item.name +'" id="folder' + cfg.path + '/' + item.name + '"></div>');
                    }

                    var serviceCallback = {
                        success: function(oResponse) {
                            // Get folder contents
                            var dirReader = item.createReader();
                            dirReader.readEntries(function(entries) {
                                for (var i=0; i<entries.length; i++) {
                                    traverseFileTree(entries[i], cfgSubFolder);
                                }
                            });
                        },

                        failure: function (response) {
                            console.log(response.responseText);
                        }
                    };

                    YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
                    YConnect.asyncRequest('POST', serviceUri, serviceCallback);
                }
            }

            var event = e;

            var items = event.dataTransfer.items;
            for (var i=0; i<items.length; i++) {
                try{    //chrome feature to upload folders
                    // webkitGetAsEntry for chrome
                    var item = items[i].webkitGetAsEntry();
                    if (item) {
                        traverseFileTree(item, cfg);
                    }
                }catch(e){      //other browsers
                    var file = files[x];
                    uploadFile(file, cfg);
                }
            }


            /////////////////////////////////////

            return false;
        },

        fire: function (event, data) {
            var me = this,
                subs = this.subscribers[event];
            if (subs) for (var i = 0, l = subs.length; i < l; i++) {
                if (typeof data === 'object') {
                    // Is 'data' an array?
                    if ("concat" in data) {
                        subs[i].apply(me, data);
                    } else {
                        subs[i].call(data.context || me, data);
                    }
                } else {
                    subs[i].call(me, data);
                }
            };
        }
    };

    DP.init = function (oCfg) {

        // Verify that the browser has the necessary
        // features for the Dropbox to work
        if ((function () {
                return join([
                        typeof window.FileReader !== 'undefined',
                        'draggable' in document.createElement('span'),
                        !!window.FormData,
                        "upload" in new XMLHttpRequest
                    ], ' ').indexOf('false') !== -1;
            }) ()) {
            // TODO fallback to input[type="file"]?
            CStudioAuthoring.Operations.showSimpleDialog(
                "browserError-dialog",
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                "Notification",
                'Your browser does not support the necessary features to use drag and drop file uploading',
                null, // use default button
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                "studioDialog"
            );
        };

        var me = this,
            settings = this.oCfg,
            elem;

        elem = getElem (oCfg);

        if (!elem) throw ('Dropbox: Unable to select dropbox element');

        this.element = elem;

        // Default the file display to the same dropbox element
        // Override the default configuration settings with the provided settings
        if (typeof oCfg === 'string') {
            settings.element = oCfg;
            settings.display = oCfg;
        } else {
            settings.display = oCfg instanceof HTMLElement ? oCfg : oCfg.element;
            // Extend the default configuration settings with the provided instance settings
            extend (settings, oCfg);
        }

        this.display = getElem (settings.display);

        if (!this.display)  throw ('Dropbox: Unable to select display element');

        var eventHandlerFn = function (e) {
            e.stopPropagation();
            e.preventDefault();
            var fn = _[e.type];
            fn && fn.call(me, e);
        };

        // Setup drag and drop handlers.
        elem.addEventListener('dragenter', eventHandlerFn, false);
        elem.addEventListener('dragover', eventHandlerFn, false);
        elem.addEventListener('dragleave', eventHandlerFn, false);
        elem.addEventListener('drop', eventHandlerFn, false);

        // Add theme class
        _.addClass.call(this, settings.theme.main);

    };

    DP.upload = function (fileID, cfg) {

        /* References
         * @see http://www.w3.org/TR/FileAPI/
         * @see http://www.w3.org/TR/progress-events/
         * @see http://hacks.mozilla.org/2009/12/uploading-files-with-xmlhttprequest/
         * */

        var me = this,
            cfg = cfg ? cfg : me.oCfg,
            display = this.display,
            file = this.manager.get(fileID);

        var xhr = new XMLHttpRequest(),
            fileUI = display.querySelector('[data-dropbox-file-id="' + file.id + '"]'),
            elemProgress = fileUI.querySelector(cfg.progress);

        var error = function () {
            var response = xhr.responseText;
            fileUI.innerHTML = tmpl(cfg.templateUploadError, {
                file: file,
                theme: cfg.theme,
                statusCode: xhr.status,
                responseText: response !== "" && isJSON(response)
                    ? eval('(' + xhr.responseText + ')')
                    : xhr.responseText
            });
        };

        xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                me.showUploadProgress(
                    elemProgress,
                    Math.round((e.loaded * 100) / e.total),
                    fileUI);
            }
        }, false);

        xhr.addEventListener("load", function (e) {
            var success = (xhr.status === 200);
            if (success) {
                me.manager.setCompleted(file.id);
                me.showUploadProgress( elemProgress, 100, fileUI );

                document.querySelector(".bulk-upload .buttons-container .close").classList.remove("disabled");
            } else {
                error();
            }
            // fire the respective event
            _.fire.call(me, ((success) ? SUCCESS : ERROR),
                { ui: fileUI, file: file });
        });

        xhr.addEventListener("error", function (e) {
            error();
            _.fire.call(me, ERROR, { ui: fileUI, file: file });
        }, false);

        // TODO:
        // what to do about dropped files with error? remove them
        // from manager or keep them and allow some form of retry

        var fd = new FormData(),
            auxFormData = cfg.formData;

        auxFormData.path = cfg.path ? cfg.path : auxFormData.path;

        if (auxFormData) for (var key in auxFormData) {
            fd.append(key, auxFormData[key]);
        }
        fd.append(cfg.uploadPostKey, file);

        xhr.open("POST", cfg.target + "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken);
        xhr.send(fd);

        document.querySelector(".bulk-upload .buttons-container .cancel").style.display = "none";
        document.querySelector(".bulk-upload .buttons-container .close").style.display = "";
        document.querySelector(".bulk-upload .buttons-container .close").classList.add("disabled");

    }

    /**
     * Adds parameters to the form data or overrides the value
     * if the parameter name preexisted on the form data
     * @param key
     * @param value
     */
    DP.addFormData = function (key, value) {
        if (!this.oCfg.formData) this.oCfg.formData = { };
        this.oCfg.formData[key] = value;
    }

    /**
     * Removes a key/value from the form data parameters
     * @param key the FormData key to remove
     * @return {*}
     */
    DP.removeFormData = function (key) {
        var fd = this.oCfg.formData,
            value;
        if (fd) {
            value = fd[key];
            delete fd[key];
        }
        return value;
    }

    /**
     * TODO this function could be overwritten through inheritance
     * TODO need inheritace mechanism [use Ember's?]
     */
    DP.showUploadProgress = function (elem, progress, fileUI) {
        // TODO need some way to cache the progress element, this may impact performance
        // Alternative: specify the progress element selector throught the settings/config
        // object and receive the cached progress element instead of the whole file display UI
        // (or both)
        elem.innerHTML = progress;
    }

    /**
     * Sets the accepted file types
     * @param fileTypes {Array} List of strings of file types e.g. ['image/gif', 'application/pdf']
     */
    DP.accept = function (fileTypes) {

    }

    /**
     * Sets the accepted file types through rejecting a set of types
     * @param fileTypes {Array} List of strings of file types e.g. ['image/gif', 'application/pdf']
     */
    DP.reject = function (fileTypes) {

    }

    DP.clear = function () {

    }

    DP.set = function (property, value) {
        // TODO set nested properties (objects inside the settings object)
        this.oCfg[property] = value;
    }

    DP.get = function (property) {
        return this.oCfg[property];
    }

    DP.on = function (eventName, fn) {
        var subs = this.subscribers,
            event = subs[eventName] || (subs[eventName] = []);
        event.push(fn);
    }

    Dropbox.UPLOAD_SUCCESS_EVENT = SUCCESS;
    Dropbox.UPLOAD_ERROR_EVENT = ERROR;

    CSA.register("Component.Dropbox", Dropbox);
    CSA.Env.ModuleMap.map("component-dropbox", Dropbox);

}) ();

/*
 "image/gif" // .gif
 "application/pdf" // .pdf
 "application/x-javascript" // .js
 "text/css" // .css
 "application/zip" // .zip
 "application/x-gzip" // .tar.gz
 "text/plain" // .txt
 "text/html" // .html
 "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
 "application/msword" // .doc
 "application/x-diskcopy" // .dmg
 */