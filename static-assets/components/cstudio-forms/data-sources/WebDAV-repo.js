CStudioForms.Datasources.WebDAVRepo = CStudioForms.Datasources.WebDAVRepo ||
    function(id, form, properties, constraints)  {
        this.id = id;
        this.form = form;
        this.properties = properties;
        this.constraints = constraints;

        for(var i=0; i<properties.length; i++) {
            if(properties[i].name === "repoPath") {
                this.repoPath = properties[i].value;
            }
            if(properties[i].name === "profileId") {
                this.profileId = properties[i].value;
            }
            if(properties[i].name === "studioPath") {
                this.studioPath = properties[i].value;
            }
        }

        return this;
    };

YAHOO.extend(CStudioForms.Datasources.WebDAVRepo, CStudioForms.CStudioFormDatasource, {

    add: function(control, multiple) {
        var _self = this,
            baseUrl;

        var cb = function(profiles){
            var profiles = profiles.profile

            if(Array.isArray(profiles)){
                baseUrl = profiles.find(x => x.id === _self.profileId).baseUrl;
            }else{
                if(profiles.id === _self.profileId){
                    baseUrl = profiles.baseUrl;
                }
            }

            var browseCb = {
                success: function(searchId, selectedTOs) {
                    for(var i=0; i<selectedTOs.length; i++) {
                        var item = selectedTOs[i];
                        var uri = item.browserUri;
                        var fileName = item.internalName;
                        var fileExtension = fileName.split(".").pop();

                        control.insertItem(uri, uri, fileExtension);
                        control._renderItems();
                    }
                },
                failure: function() {
                }
            };

            if( multiple ){
                var addContainerEl = null;

                if(!control.addContainerEl){
                    addContainerEl = document.createElement("div")
                    addContainerEl.create = document.createElement("div");
                    addContainerEl.browse = document.createElement("div");

                    addContainerEl.appendChild(addContainerEl.create);
                    addContainerEl.appendChild(addContainerEl.browse);
                    control.containerEl.appendChild(addContainerEl);


                    YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
                    YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');
                    YAHOO.util.Dom.addClass(addContainerEl.browse, 'cstudio-form-controls-browse-element');

                    control.addContainerEl = addContainerEl;
                    addContainerEl.style.left = control.addButtonEl.offsetLeft + "px";
                    addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + "px";
                }

                // var datasourceDef = this.form.definition.datasources,
                var newElTitle = 'WebDAV';  //TODO: check how to get DS title

                // for(var x = 0; x < datasourceDef.length; x++){
                //     if (datasourceDef[x].id == this.id){
                //         newElTitle = datasourceDef[x].title;
                //     }
                // }

                var createEl = document.createElement("div");
                YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
                createEl.innerHTML = "Browse - " + newElTitle;
                control.addContainerEl.create.appendChild(createEl);

                var addContainerEl = control.addContainerEl;			
                YAHOO.util.Event.on(createEl, 'click', function() {
                    control.addContainerEl = null;
                    control.containerEl.removeChild(addContainerEl);
                    CStudioAuthoring.Operations.openWebDAVBrowse(_self.repoPath, _self.studioPath, _self.profileId, baseUrl, "select", true, browseCb);
                }, createEl);
            }else{
                CStudioAuthoring.Operations.openWebDAVBrowse(_self.repoPath, _self.studioPath, _self.profileId, baseUrl, "select", true, browseCb);
            }            
        }

        _self.getConfig(cb);

    },

    getConfig: function(callback){
        CStudioAuthoring.Service.getConfiguration(
            CStudioAuthoringContext.site,
            "/webdav/webdav.xml",
            {
                success: function(config) {
                    callback(config);
                }
            });
    },

    getLabel: function() {
        return CMgs.format(langBundle, "WebDAV Repository");
    },

    getInterface: function() {
        return "item";
    },

    getName: function() {
        return "WebDAV-repo";
    },

    getSupportedProperties: function() {
        return [
            { label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
            { label: CMgs.format(langBundle, "profileId"), name: "profileId", type: "string" },
            { label: CMgs.format(langBundle, "studioPath"), name: "studioPath", type: "string" },
        ];
    },

    getSupportedConstraints: function() {
        return [
        ];
    }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-WebDAV-repo", CStudioForms.Datasources.WebDAVRepo);