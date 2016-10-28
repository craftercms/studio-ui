CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/plugin-manager/plugin.css");
CStudioAdminConsole.Tool.PluginManager = CStudioAdminConsole.Tool.PluginManager ||  function(config, el)  {
	this.containerEl = el;
	this.config = config;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.PluginManager, CStudioAdminConsole.Tool, {
	renderWorkarea: function() {
		var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		workareaEl.innerHTML = "<h1>Plugins</h1>";
	}
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-plugin-manager",CStudioAdminConsole.Tool.PluginManager);