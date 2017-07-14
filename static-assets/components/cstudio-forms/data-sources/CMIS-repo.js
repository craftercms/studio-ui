CStudioForms.Datasources.CMISRepo= CStudioForms.Datasources.CMISRepo ||
    function(id, form, properties, constraints)  {
        this.id = id;
        this.form = form;
        this.properties = properties;
        this.constraints = constraints;

        for(var i=0; i<properties.length; i++) {
            if(properties[i].name === "repoPath") {
                this.repoPath = properties[i].value;
            }
            if(properties[i].name === "repoId") {
                this.repoId = properties[i].value;
            }
        }

        return this;
    };

YAHOO.extend(CStudioForms.Datasources.CMISRepo, CStudioForms.CStudioFormDatasource, {

    add: function(control) {
        var _self = this;
        CStudioAuthoring.Operations.openCMISBrowse(_self.repoId, _self.repoPath, "select", true, {
            success: function(searchId, selectedTOs) {

                for(var i=0; i<selectedTOs.length; i++) {
                    var item = selectedTOs[i];
                    var fileName = item.name;
                    var fileExtension = fileName.split(".").pop();
                    control.insertItem(item.uri, item.uri, fileExtension);
                    control._renderItems();
                }
            },
            failure: function() {
            }
        });

    },

    edit: function(key) {
        alert("Edit");
    },

    getLabel: function() {
        return "CMIS Repo";
    },

    getInterface: function() {
        return "item";
    },

    getName: function() {
        return "CMIS-repo";
    },

    getSupportedProperties: function() {
        return [
            { label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
            { label: CMgs.format(langBundle, "repositoryId"), name: "repoId", type: "string" }
        ];
    },

    getSupportedConstraints: function() {
        return [
        ];
    }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-CMIS-repo", CStudioForms.Datasources.CMISRepo);