CStudioForms.Datasources.CMISRepo= CStudioForms.Datasources.CMISRepo ||
function(id, form, properties, constraints)  {
   	this.id = id;
   	this.form = form;
   	this.properties = properties;
   	this.constraints = constraints;
   	
   	for(var i=0; i<properties.length; i++) {
   		if(properties[i].name == "repoPath") {
 			this.repoPath = properties[i].value;
   		}
   	} 
	
	return this;
}

YAHOO.extend(CStudioForms.Datasources.CMISRepo, CStudioForms.CStudioFormDatasource, {

    add: function(control) {
        var _self = this;
        CStudioAuthoring.Operations.openBrowse("", _self.processPathsForMacros(_self.repoPath), "-1", "select", true, {
            success: function(searchId, selectedTOs) {

                for(var i=0; i<selectedTOs.length; i++) {
                    var item = selectedTOs[i];
                    var fileName = item.name;
                    var fileExtension = fileName.split('.').pop();
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
			{ label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" }
		];
	},

	getSupportedConstraints: function() {
		return [
		];
	}

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-CMIS-repo", CStudioForms.Datasources.CMISRepo);