CStudioForms.Datasources.VideoWebDAVRepo = CStudioForms.Datasources.VideoWebDAVRepo ||
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
        }

        return this;
    };

YAHOO.extend(CStudioForms.Datasources.VideoWebDAVRepo, CStudioForms.CStudioFormDatasource, {

    insertVideoAction: function(insertCb) {
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
                        var uri = item.browserUri;;
                        var fileName = item.internalName;
                        var fileExtension = fileName.split(".").pop();

                        var videoData = {
                            previewUrl : uri,
                            relativeUrl : uri,
                            fileExtension : fileExtension
                        };

                        insertCb.success(videoData);
                    }
                },
                failure: function() {
                }
            };

            CStudioAuthoring.Operations.openWebDAVBrowse(_self.processPathsForMacros(_self.repoPath), _self.profileId, baseUrl, "select", true, browseCb, 'video');

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
        return CMgs.format(langBundle, "videoWebDavRepository");
    },

    getInterface: function() {
        return "video";
    },

    getName: function() {
        return "video-WebDAV-repo";
    },

    getSupportedProperties: function() {
        return [
            { label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
            { label: CMgs.format(langBundle, "profileId"), name: "profileId", type: "string" }
        ];
    },

    getSupportedConstraints: function() {
        return [
        ];
    }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-video-WebDAV-repo", CStudioForms.Datasources.VideoWebDAVRepo);