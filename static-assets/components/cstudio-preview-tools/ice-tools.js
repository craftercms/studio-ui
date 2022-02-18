/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioAuthoring.Utils.addJavascript('/static-assets/modules/editors/tinymce/v2/tiny_mce/tiny_mce.js');
CStudioAuthoring.Utils.addJavascript('/static-assets/components/cstudio-forms/forms-engine.js');
/**
 * In-Context Editing (ICE)
 */
CStudioAuthoring.IceTools = CStudioAuthoring.IceTools || {
  IceToolsOffEvent: new YAHOO.util.CustomEvent('cstudio-ice-tools-off', CStudioAuthoring),
  IceToolsOnEvent: new YAHOO.util.CustomEvent('cstudio-ice-tools-on', CStudioAuthoring),

  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    var iceOn;

    if (this.initialized == false) {
      iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean

      if (iceOn) {
        this.IceToolsOnEvent.fire();
      }

      this.initialized = true;
    }
  },

  turnEditOn: function () {
    /*if(!!(sessionStorage.getItem('pto-on') == false)) {   // cast string value to a boolean
			CStudioAuthoring.PreviewTools.turnToolsOn();
		}*/
    sessionStorage.setItem('ice-on', 'on');
    this.IceToolsOnEvent.fire();
  },

  turnEditOff: function () {
    sessionStorage.setItem('ice-on', '');
    this.IceToolsOffEvent.fire();
  }
};

CStudioAuthoring.Module.moduleLoaded('ice-tools', CStudioAuthoring.IceTools);
CStudioAuthoring.Module.moduleLoaded('ice-tools-controller', CStudioAuthoring.IceTools);
