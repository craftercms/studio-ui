/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioForms.Controls.VideoPicker = CStudioForms.Controls.VideoPicker ||
    function(id, form, owner, properties, constraints, readonly)  {
        this.owner = owner;
        this.owner.registerField(this);
        this.errors = [];
        this.properties = properties;
        this.constraints = constraints;
        this.inputEl = null;
        this.required = false;
        this.value = "_not-set";
        this.form = form;
        this.id = id;
        this.datasources = null;
        this.upload_dialog = null;
        this.validExtensions = ["MOV", "mov", "MP4", "mp4", "wmv", "WMV", "webm"];
        this.readonly = readonly;
        this.external = null;

        return this;
    }

YAHOO.extend(CStudioForms.Controls.VideoPicker, CStudioForms.CStudioFormField, {

    getLabel: function() {
        return CMgs.format(langBundle, "video");
    },

    _onChange: function(evt, obj) {
        obj.value = obj.inputEl.value;

        if(obj.required) {
            if(obj.inputEl.value == "") {
                obj.setError("required", "Field is Required");
                obj.renderValidation(true, false);
            }
            else {
                obj.clearError("required");
                obj.renderValidation(true, true);
            }
        }
        else {
            obj.renderValidation(false, true);
        }

        obj.owner.notifyValidation();

        if(obj.videoData){
            obj.form.updateModel(obj.id, obj.videoData);
        }else{
            obj.form.updateModel(obj.id, obj.getValue(), obj.remote);
        }
    },

    _onChangeVal: function(evt, obj) {
        obj.edited = true;
        this._onChange(evt,obj);
    },

    /**
     * perform count calculation on keypress
     * @param evt event
     * @param el element
     */
    count: function(evt, countEl, el) {
    },

    /**
     * create dialog
     */
    createDialog: function() {
        YDom.removeClass("cstudio-wcm-popup-div", "yui-pe-content");

        var newdiv = YDom.get("cstudio-wcm-popup-div");
        if (newdiv == undefined) {
            newdiv = document.createElement("div");
            document.body.appendChild(newdiv);
        }

        var divIdName = "cstudio-wcm-popup-div";
        newdiv.setAttribute("id",divIdName);
        newdiv.className= "yui-pe-content video-dialog";
        var url = !this.external ? CStudioAuthoringContext.previewAppBaseUri : '' + this.inputEl.value;

        newdiv.innerHTML = '<embed src=\"' +
            url + '\" width=\"500px\" height=\"500px\"></embed>' +
            '<input type="button" class="zoom-button btn btn-primary cstudio-form-control-asset-picker-zoom-cancel-button" id="zoomCancelButton" value="Close"/>'+
            '<input type="button" class="zoom-button btn btn-primary cstudio-form-control-asset-picker-zoom-full-button" id="zoomFullButton" value="Full"/>';

        // Instantiate the Dialog
        upload_dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div",
            { fixedcenter : true,
                visible : false,
                modal:true,
                close:true,
                constraintoviewport : true,
                underlay:"none",
                keylisteners: new YAHOO.util.KeyListener(document, { ctrl:false, keys:27 },
                    { fn: this.uploadPopupCancel, correctScope:true } )
            });

        // Render the Dialog
        upload_dialog.render();
        YAHOO.util.Event.addListener("zoomCancelButton", "click", this.uploadPopupCancel, this, true);
        YAHOO.util.Event.addListener("zoomFullButton", "click", function() {this.fullImageTab(!this.external ? CStudioAuthoringContext.previewAppBaseUri : '' + this.inputEl.value);}, this, true);
        this.upload_dialog = upload_dialog;
        upload_dialog.show();
    },

    /**
     * event fired when the full is pressed
     */
    fullImageTab: function(url) {
        window.open(url);
    },

    /**
     * Show Alert
     */
    showAlert: function(message){
        var self = this;
        var dialog = new YAHOO.widget.SimpleDialog("alertDialog",
            { width: "400px",fixedcenter: true, visible: false, draggable: false, close: false, modal: true,
                text: message, icon: YAHOO.widget.SimpleDialog.ICON_ALARM,
                constraintoviewport: true,
                buttons: [ { text:"OK", handler: function(){
                    this.destroy();
                    CStudioAuthoring.Utils.decreaseFormDialog();

                }, isDefault:false } ]
            });
        dialog.setHeader("CStudio Warning");
        dialog.render(document.body);
        dialog.show();
    },

    /**
     * event fired when the ok is pressed
     */
    uploadPopupCancel: function(event) {
        this.upload_dialog.destroy();
    },

    addVideo: function() {
        var _self = this;
        var videoManagerNames = this.datasources;

        videoManagerNames = (!videoManagerNames) ? "" :
            (Array.isArray(videoManagerNames)) ? videoManagerNames.join(",") : videoManagerNames;
        var datasourceMap = this.form.datasourceMap,
            datasourceDef = this.form.definition.datasources;

        if(videoManagerNames != "" && videoManagerNames.indexOf(",") != -1){

            if(this.addContainerEl) {
                addContainerEl = this.addContainerEl;
                this.addContainerEl = null;
                this.containerEl.removeChild(addContainerEl);
            }
            //else {
            addContainerEl = document.createElement("div")
            this.containerEl.appendChild(addContainerEl);
            YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-video-picker-add-container');
            this.addContainerEl = addContainerEl;



            addContainerEl.style.left = this.addEl.offsetLeft + "px";
            addContainerEl.style.top = this.addEl.offsetTop + 22 + "px";

            // The datasource title is only found in the definition.datasources. It'd make more sense to have all
            // the information in just one place.

            var addMenuOption = function (el) {
                // We want to avoid possible substring conflicts by using a reg exp (a simple indexOf
                // would fail if a datasource id string is a substring of another datasource id)
                var regexpr = new RegExp("(" + el.id + ")[\\s,]|(" + el.id + ")$"),
                    mapDatasource;

                //if (videoManagerNames.search(regexpr) > -1) {
                if (videoManagerNames.indexOf(el.id) != -1) {
                    mapDatasource = datasourceMap[el.id];

                    var itemEl = document.createElement("div");
                    YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-video-picker-add-container-item');
                    itemEl.innerHTML = el.title;
                    addContainerEl.appendChild(itemEl);

                    YAHOO.util.Event.on(itemEl, 'click', function() {
                        _self.addContainerEl = null;
                        _self.containerEl.removeChild(addContainerEl);

                        _self._addVideo(mapDatasource);

                    }, itemEl);
                }
            }
            datasourceDef.forEach(addMenuOption);
        }
        else if(videoManagerNames != ""){
            videoManagerNames = videoManagerNames.replace("[\"","").replace("\"]","");
            this._addVideo(datasourceMap[videoManagerNames]);
        }
    },

    _addVideo: function(datasourceEl) {
        var CMgs = CStudioAuthoring.Messages;
        var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

        var datasource = datasourceEl,
            self = this;
        if(datasource) {
            if(datasource.insertVideoAction) {
                var callback = {
                    success: function(videoData) {
                        this.videoPicker.inputEl.value = videoData.relativeUrl;

                        if(videoData.external){
                            this.videoPicker.videoData = videoData;
                        }

                        var valid = false;
                        var message = '';

                        if (this.videoPicker.validExtensions.indexOf(videoData.fileExtension) != -1) {
                            valid = true;
                        } else {
                            message = "The uploaded file is not of type video";
                        }

                        if (!valid) {
                            this.videoPicker.showAlert(message);
                            //this.videoPicker.deleteVideo();
                        } else {
                            this.videoPicker.previewEl.src = videoData.previewUrl;
                            this.videoPicker.previewEl.setAttribute("controls", "true");
                            this.videoPicker.urlEl.innerHTML = videoData.relativeUrl.replace("?crafterCMIS=true","");
                            this.videoPicker.downloadEl.href = videoData.previewUrl;
                            this.videoPicker.remote = videoData.remote && videoData.remote === true ? true : false;

                            this.videoPicker.addEl.value = CMgs.format(langBundle, "replace");

                            this.videoPicker.noPreviewEl.style.display = "none";
                            this.videoPicker.previewEl.style.display = "inline";

                            this.videoPicker.downloadEl.style.display = "inline-block";
                            this.videoPicker.zoomEl.style.display = "inline-block";

                            this.videoPicker.delEl.disabled = false;
                            YAHOO.util.Dom.removeClass(this.videoPicker.delEl, 'cstudio-button-disabled');

                            this.videoPicker._onChangeVal(null, this.videoPicker);

                            CStudioAuthoring.Utils.decreaseFormDialog();
                        }
                    },
                    failure: function(message) {
                        this.imagePicker.showAlert(message);
                    }
                };
                callback.videoPicker = this;
                datasource.insertVideoAction(callback);
            }
        }
    },

    deleteVideo: function() {
        var CMgs = CStudioAuthoring.Messages;
        var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

        if(this.inputEl.value != "") {
            this.inputEl.value = '';
            this.urlEl.innerHTML = '';
            this.previewEl.src = '';
            this.previewEl.style.display = "none";
            this.noPreviewEl.style.display = "inline";
            this.addEl.value = CMgs.format(langBundle, "add");
            this.remote = false;

            this.downloadEl.style.display = "none";
            this.zoomEl.style.display = "none";

            this.delEl.disabled = true;
            YAHOO.util.Dom.addClass(this.delEl, 'cstudio-button-disabled');

            this._onChangeVal(null, this);
        }
    },

    render: function(config, containerEl) {
        containerEl.id = this.id;

        var divPrefix = config.id + "-";
        var datasource = null;

        var CMgs = CStudioAuthoring.Messages;
        var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

        var titleEl = document.createElement("span");

        YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
        titleEl.innerHTML = config.title;

        var controlWidgetContainerEl = document.createElement("div");
        YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-video-picker-container');

        var validEl = document.createElement("span");
        YAHOO.util.Dom.addClass(validEl, 'validation-hint');
        YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
        controlWidgetContainerEl.appendChild(validEl);

        var inputEl = document.createElement("input");
        this.inputEl = inputEl;
        inputEl.style.display = "none";
        YAHOO.util.Dom.addClass(inputEl, 'datum');
        controlWidgetContainerEl.appendChild(inputEl);

        var urlEl = document.createElement("div");
        this.urlEl = urlEl;
        urlEl.innerHTML = this.inputEl.value;
        controlWidgetContainerEl.appendChild(urlEl);

        var videoEl = document.createElement("div");
        this.videoEl = videoEl;
        videoEl.id = divPrefix + "cstudio-form-video-picker";

        YAHOO.util.Dom.addClass(videoEl, 'cstudio-form-control-asset-picker-preview-block');
        controlWidgetContainerEl.appendChild(videoEl);

        var noPreviewEl = document.createElement("span");
        this.noPreviewEl = noPreviewEl;
        noPreviewEl.innerHTML = "No Video Available";

        YAHOO.util.Dom.addClass(noPreviewEl, 'cstudio-form-control-asset-picker-no-preview-content');
        noPreviewEl.style.paddingLeft = "5px";
        videoEl.appendChild(noPreviewEl);

        var previewEl = document.createElement("video");
        this.previewEl = previewEl;
        //previewEl.setAttribute("autoplay", "0");
        //previewEl.setAttribute("autostart", "0");

        YAHOO.util.Dom.addClass(previewEl, 'cstudio-form-control-asset-picker-preview-content');

        videoEl.appendChild(previewEl);

        var zoomEl = document.createElement("a");
        this.zoomEl = zoomEl;

        YAHOO.util.Dom.addClass(zoomEl, 'cstudio-form-control-hover-btn cstudio-form-control-asset-picker-zoom-button fa fa-search-plus');

        if (this.inputEl.value == null || this.inputEl.value == "") {
            zoomEl.style.display = "none";
        } else {
            zoomEl.style.display = "inline-block";
        }

        videoEl.appendChild(zoomEl);

        var downloadEl = document.createElement("a");
        this.downloadEl = downloadEl;
        downloadEl.href = inputEl.value;
        downloadEl.target = "_new";

        YAHOO.util.Dom.addClass(downloadEl, 'cstudio-form-control-hover-btn cstudio-form-control-asset-picker-download-button fa fa-download');

        if (this.inputEl.value == null || this.inputEl.value == "") {
            downloadEl.style.display = "none";
        } else {
            downloadEl.style.display = "inline-block";
        }

        videoEl.appendChild(downloadEl);

        var addEl = document.createElement("input");
        this.addEl = addEl;
        addEl.type = "button";
        addEl.style.position = "relative";
        if (this.inputEl.value == null || this.inputEl.value == "") {
            addEl.value = CMgs.format(langBundle, "add");
        } else {
            addEl.value = CMgs.format(langBundle, "replace");
        }

        YAHOO.util.Dom.addClass(addEl, 'cstudio-button');
        controlWidgetContainerEl.appendChild(addEl);

        var delEl = document.createElement("input");
        this.delEl = delEl;
        delEl.type = "button";
        delEl.value = CMgs.format(langBundle, "delete");;
        delEl.style.position = "relative";
        delEl.disabled = true;
        YAHOO.util.Dom.addClass(delEl, 'cstudio-button');
        YAHOO.util.Dom.addClass(delEl, 'cstudio-button-disabled');

        controlWidgetContainerEl.appendChild(delEl);

        for(var i=0; i<config.properties.length; i++) {
            var prop = config.properties[i];

            if(prop.name == "videoManager") {
                if(prop.value && prop.value != "") {
                    //var datasourceName = prop.value;
                    //datasource = this.form.datasourceMap[datasourceName];
                    //this.datasource = datasource;

                    this.datasources = prop.value;
                }else{
                    addEl.disabled = true;
                    YAHOO.util.Dom.addClass(addEl, 'cstudio-button-disabled');
                }
            }

            if (prop.name == "height") {
                if (prop.value && prop.value != "") {
                    this.height = prop.value;
                }
            }

            if (prop.name == "width") {
                if (prop.value && prop.value != "") {
                    this.width = prop.value;
                }
            }

            if(prop.name == "readonly" && prop.value == "true"){
                this.readonly = true;
            }
        }


        var helpContainerEl = document.createElement("div");
        YAHOO.util.Dom.addClass(helpContainerEl, 'cstudio-form-field-help-container');
        controlWidgetContainerEl.appendChild(helpContainerEl);

        this.renderHelp(config, helpContainerEl);

        var descriptionEl = document.createElement("span");
        YAHOO.util.Dom.addClass(descriptionEl, 'description');
        YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
        descriptionEl.innerHTML = config.description;
        //descriptionEl.style.marginLeft = "341px";
        descriptionEl.style.position = "relative";

        containerEl.appendChild(titleEl);
        containerEl.appendChild(controlWidgetContainerEl);
        containerEl.appendChild(descriptionEl);

        if(this.readonly == true){
            addEl.disabled = true;
            delEl.disabled = true;
            YAHOO.util.Dom.addClass(addEl, 'cstudio-button-disabled');
            YAHOO.util.Dom.addClass(delEl, 'cstudio-button-disabled');
        }

        YAHOO.util.Event.addListener(videoEl, "click", function(evt, context) { context.form.setFocusedField(context);}, this, true);
        YAHOO.util.Event.addListener(addEl, "click", function(evt, context) { context.form.setFocusedField(context); this.addVideo();}, this, true);
        YAHOO.util.Event.addListener(delEl, "click", function(evt, context) { context.form.setFocusedField(context); this.deleteVideo();}, this, true);
        YAHOO.util.Event.addListener(zoomEl, "click", this.createDialog, this, true);
    },

    getValue: function() {
        return this.value;
    },

    setValue: function(value, attribute) {
        var CMgs = CStudioAuthoring.Messages;
        var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

        this.value = value;
        this.inputEl.value = value;
        this.remote = attribute == true ? true : false;

        this.external = value.indexOf("?crafterCMIS=true") !== -1 || value.indexOf('http') <= 0;

        if (value == null || value == '') {
            this.noPreviewEl.style.display = "inline";
        } else {
            if(this.external){
                this.previewEl.src = value;
            }else{
                this.previewEl.src = CStudioAuthoringContext.previewAppBaseUri + value;
            }

            this.previewEl.style.display = "block";
            this.previewEl.setAttribute("controls", "true");
            this.noPreviewEl.style.display = "none";
            this.urlEl.innerHTML = this.external ? value.replace("?crafterCMIS=true","") : value;

            this.zoomEl.style.display = "inline-block";
            this.downloadEl.style.display = "inline-block";
            this.downloadEl.href = this.external ? value.replace("?crafterCMIS=true","") : value;
            this.addEl.value = CMgs.format(langBundle, "replace");
            this.delEl.disabled = false;
            YAHOO.util.Dom.removeClass(this.delEl, 'cstudio-button-disabled');
        }

        this._onChange(null, this);
        this.edited = false;
    },

    getName: function() {
        return "video-picker";
    },

    getSupportedProperties: function() {
        return [
            { label: CMgs.format(langBundle, "datasource"), name: "videoManager", type: "datasource:video" },
            { label: CMgs.format(langBundle, "readonly"), name: "readonly", type: "boolean" }
        ];
    },

    getSupportedConstraints: function() {
        return [
            { label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
        ];
    }
});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-video-picker", CStudioForms.Controls.VideoPicker);