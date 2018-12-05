CStudioForms.Datasources.VideoS3Repo = CStudioForms.Datasources.VideoS3Repo ||
    function(id, form, properties, constraints)  {
        this.id = id;
        this.form = form;
        this.properties = properties;
        this.constraints = constraints;

        for(var i=0; i<properties.length; i++) {
            if(properties[i].name === "path") {
                this.path = properties[i].value;
            }
            if(properties[i].name === "profileId") {
                this.profileId = properties[i].value;
            }
        }

        return this;
    };

YAHOO.extend(CStudioForms.Datasources.VideoS3Repo, CStudioForms.CStudioFormDatasource, {

    insertVideoAction: function(insertCb) {
        var _self = this;

        var browseCb = {
            success: function (searchId, selectedTOs) {
                for (var i = 0; i < selectedTOs.length; i++) {
                    var item = selectedTOs[i];
                    var uri = item.browserUri;
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
            failure: function () {
            }
        };

        CStudioAuthoring.Operations.openS3Browse(_self.profileId, _self.processPathsForMacros(_self.path), "select", true, browseCb, 'video');

    },

    getLabel: function() {
        return CMgs.format(langBundle, "videoS3Repository");
    },

    getInterface: function() {
        return "video";
    },

    getName: function() {
        return "video-S3-repo";
    },

    getSupportedProperties: function() {
        return [
            { label: CMgs.format(langBundle, "profileId"), name: "profileId", type: "string" },
            { label: CMgs.format(langBundle, "path"), name: "path", type: "string" },
        ];
    },

    getSupportedConstraints: function() {
        return [
        ];
    }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-video-S3-repo", CStudioForms.Datasources.VideoS3Repo);