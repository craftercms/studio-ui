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

CStudioForms.Datasources.SalesforceCampaigns = CStudioForms.Datasources.SalesforceCampaigns ||
    function(id, form, properties, constraints)  {
	   	this.id = id;
	   	this.form = form;
	   	this.properties = properties;
	   	this.constraints = constraints;
		this.callbacks = [];
		var _self = this;
	

		var cb = { 
			success: function(config) {
				var values = eval("(" + config.responseText + ")");
				if(!values.length) {
					values = [ values.value ];
				}
			
				_self.list = values;
			
				var dataStruct = [];
				for(var i=0; i<values.length; i++){
					dataStruct[i] = { key: values[i].id, value: values[i].name };
				}
				
				for(var j=0; j<_self.callbacks.length; j++) {
					_self.callbacks[j].success(dataStruct);
				}
			},
			failure: function() {
			}
		};
	
		// CStudioAuthoring.Service.lookupConfigurtion(
		// 		CStudioAuthoringContext.site, 
		// 		"/api/salesforce/active-campaigns",
		// 		cb);
		
		YAHOO.util.Connect.asyncRequest('GET',
				"/api/1/services/salesforce/active-campaigns.json",
				cb);

        return this;
    }

YAHOO.extend(CStudioForms.Datasources.SalesforceCampaigns, CStudioForms.CStudioFormDatasource, {

    getLabel: function() {
        return CMgs.format(langBundle, "salesforceCampaigns");
    },

    getList: function(cb) {
		if(!this.list) {
			this.callbacks[this.callbacks.length] = cb;
		}
		else {
			cb.success(this.list);
		}
    },

    getInterface : function() {
        return "item";
    },

    /*
     * Datasource controllers don't have direct access to the properties controls, only to their properties and their values.
     * Because the property control (dropdown) and the dataType property share the property value, the dataType value must stay
     * as an array of objects where each object corresponds to each one of the options of the control. In order to know exactly
     * which of the options in the control is currently selected, we loop through all of the objects in the dataType value 
     * and check their selected value.
     */
    getDataType : function getDataType () {
        return "string";
    },

    getName: function() {
        return "salesforce-campaigns";
    },

    getSupportedProperties: function() {
        return [];
    },

    getSupportedConstraints: function() {
        return [
            { label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
        ];
    }

});


CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-salesforce-campaigns", CStudioForms.Datasources.SalesforceCampaigns);