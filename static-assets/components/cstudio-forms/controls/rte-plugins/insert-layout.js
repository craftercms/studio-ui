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

CStudioForms.Controls.RTE.InsertLayout = CStudioForms.Controls.RTE.InsertLayout || {
    createControl: function(n, cm, editor) {
        switch (n) {
            case 'insertLayout':
				var config = tinyMCE.activeEditor.contextControl.rteConfig;
				var layouts = config.rteLayouts.layout;
				
				if(!layouts) {
					layouts = [];
				}
				
				if(!layouts.length) {
					layouts = [layouts];
				}

				if(layouts.length > 0) {	
					var c = cm.createMenuButton('insertLayout', {
	                	title : 'Insert Layout',
	                    //image : 'img/example.gif',
	                    style: "mce_insertLayout",
//	                    icons : false
	                });
	                
	                c.layouts = layouts;
	
	 				c.onRenderMenu.add(function(c, m) {
						for(var i=0; i<layouts.length; i++) {
							var layout = layouts[i];
                            var prototype = layout.prototype;
                           
                            
                            var onClickFn = function() {
		                    	tinyMCE.activeEditor.execCommand('mceInsertContent', false, this.layoutPrototype);
                                cm.editor.contextControl.save();
		                   	};
		                   	
		                   	var layoutItem = {title : layout.name, onclick : onClickFn, layoutPrototype: prototype}
 
 		                	m.add(layoutItem);
				        };
					});

			        return c;
				}
				else {
					// no layouts to render
				}
			};
	
	        return null;
    }
}

tinymce.create('tinymce.plugins.CStudioInsertLayoutPlugin', CStudioForms.Controls.RTE.InsertLayout);

// Register plugin with a short name
tinymce.PluginManager.add('insertlayout', tinymce.plugins.CStudioInsertLayoutPlugin);

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-rte-insert-layout", CStudioForms.Controls.RTE.InsertLayout);