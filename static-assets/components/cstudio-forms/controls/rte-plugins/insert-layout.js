CStudioForms.Controls.RTE.InsertLayout = CStudioForms.Controls.RTE.InsertLayout || {
    createControl: function(n, cm, editor) {
        switch (n) {
            case 'insertLayout':
				var config = tinymce2.activeEditor.contextControl.rteConfig;
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
		                    	tinymce2.activeEditor.execCommand('mceInsertContent', false, this.layoutPrototype);
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

tinymce2.create('tinymce2.plugins.CStudioInsertLayoutPlugin', CStudioForms.Controls.RTE.InsertLayout);

// Register plugin with a short name
tinymce2.PluginManager.add('insertlayout', tinymce2.plugins.CStudioInsertLayoutPlugin);

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-rte-insert-layout", CStudioForms.Controls.RTE.InsertLayout);