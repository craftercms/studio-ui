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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template = CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template||  function(fieldName, containerEl, currentContenType)  {
	this.fieldName = fieldName;
	this.containerEl = containerEl;
    this.currentContenType = currentContenType;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template, CStudioAdminConsole.Tool.ContentTypes.PropertyType, {
	render: function(value, updateFn) {
		var _self = this;
		var containerEl = this.containerEl;
		var valueEl = document.createElement("input");
		YAHOO.util.Dom.addClass(valueEl, "content-type-property-sheet-property-value");		
		containerEl.appendChild(valueEl);
		valueEl.value = value;
		valueEl.fieldName = this.fieldName;
		this.updateFn = updateFn;

		// don't let the user type anything
		YAHOO.util.Event.on(valueEl, 'keydown', function(evt) { YAHOO.util.Event.stopEvent(evt); }, valueEl);

		YAHOO.util.Event.on(valueEl, 'focus', function(evt) { _self.showTemplateEdit(); }, valueEl);
		//YAHOO.util.Event.on(valueEl, 'blur', function(evt) { _self.hideTemplateEdit();  }, valueEl);
						
		if(updateFn) {
			var updateFieldFn = function(event, el) {
				
			};
						
			YAHOO.util.Event.on(valueEl, 'change', updateFieldFn, valueEl);
		}
		
		this.valueEl = valueEl;
	},
	
	getValue: function() {
		return this.valueEl.value;	
	},
	
	showTemplateEdit: function() {
		var _self = this;
		if(this.controlsContainerEl) {
			this.controlsContainerEl.style.display = "inline";
			this.valueEl.size
		}
		else {
			var controlsContainerEl = document.createElement("div");
			YAHOO.util.Dom.addClass(controlsContainerEl, "options");

			var editEl = document.createElement("div");
			YAHOO.util.Dom.addClass(editEl, "edit fa fa-pencil f18");
			
			var pickEl = document.createElement("div");
			YAHOO.util.Dom.addClass(pickEl, "pick fa fa-search f18");
			
			controlsContainerEl.appendChild(editEl);
			controlsContainerEl.appendChild(pickEl);			
			
			this.containerEl.appendChild(controlsContainerEl);
			
			this.controlsContainerEl = controlsContainerEl;
			
			editEl.onclick = function() {
				var contentType = _self.valueEl.value

				if(contentType == "") {
					CStudioAuthoring.Operations.createNewTemplate(null,function(templatePath) {
                            _self.valueEl.value = templatePath;
                            _self.value = templatePath;
                            _self.updateFn(null, _self.valueEl);
                        });
				}
				else {
					CStudioAuthoring.Operations.openTemplateEditor
						(contentType, "default", { success: function() {}, failure: function() {}}, _self.currentContenType.contentType, null);
				}
			}
			
			pickEl.onclick = function() {
				CStudioAuthoring.Operations.openBrowse("", "/templates/web", "1", "select", true, { 
					success: function(searchId, selectedTOs) {
						var item = selectedTOs[0];
						_self.valueEl.value = item.uri; 
						_self.value = item.uri;	 
						_self.updateFn(null, _self.valueEl);	 
					}, failure: function() {}}); 
			}
		}
	},
	
	hideTemplateEdit: function() {
		if(this.controlsContainerEl) {
			this.controlsContainerEl.style.display = "none";
		}
	}
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types-proptype-template", CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template);