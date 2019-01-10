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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable = CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable ||  function(fieldName, containerEl)  {
		this.fieldName = fieldName;
		this.containerEl = containerEl;
		return this;
	}

YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable, CStudioAdminConsole.Tool.ContentTypes.PropertyType, {
	render: function(value, updateFn, fName) {
		var containerEl = this.containerEl;
		var valueEl = document.createElement("input");
		YAHOO.util.Dom.addClass(valueEl, "property-input-"+fName);
		containerEl.appendChild(valueEl);
		valueEl.value = value;
		valueEl.fieldName = this.fieldName;

		if(updateFn) {
			var updateFieldFn = function(event, el) {
				updateFn(event, el);
				if(YDom.hasClass(this,"property-input-title") && !(YDom.hasClass(this,"no-update"))){
					var idDatasource = YDom.getElementsByClassName("property-input-name")[0] ? YDom.getElementsByClassName("property-input-name")[0] : YDom.getElementsByClassName("property-input-id")[0];
					if(idDatasource){
						idDatasource.value = this.value.replace(/[^A-Za-z0-9-_]/g,"");
						idDatasource.value = idDatasource.value.substr(0, 1).toLowerCase() + idDatasource.value.substr(1);

						updateFn(event, idDatasource);
					}
				}
				CStudioAdminConsole.Tool.ContentTypes.visualization.render();
			};

			var checkVarState = function(event, el) {
				var titleEl = YDom.getElementsByClassName("property-input-title");
				YAHOO.util.Dom.addClass(titleEl, 'no-update');

				if(this.value == ""){
					YAHOO.util.Dom.removeClass(titleEl, 'no-update');
				}
			}

			YAHOO.util.Event.on(valueEl, 'keyup', updateFieldFn, valueEl);

			if( (fName == "id" || fName == "name") && value !== "" ) {
				var titleEl = YDom.getElementsByClassName("property-input-title");
				YAHOO.util.Dom.addClass(titleEl, 'no-update');
				YAHOO.util.Event.on(valueEl, 'keyup', checkVarState);
			}else if( fName == "id" && value == ""){
				YAHOO.util.Event.on(valueEl, 'keyup', checkVarState);
			}
		}

		this.valueEl = valueEl;
	},

	getValue: function() {
		return this.valueEl.value;
	}
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types-proptype-variable", CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable);