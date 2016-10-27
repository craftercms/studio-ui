CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/marketplace/plugin.css");
CStudioAdminConsole.Tool.MarketPlace = CStudioAdminConsole.Tool.MarketPlace ||  function(config, el)  {
	this.containerEl = el;
	this.config = config;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.MarketPlace, CStudioAdminConsole.Tool, {
	renderWorkarea: function() {
		var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		workareaEl.innerHTML = "<iframe style='width:100%; height:2000px; margin-left:150px;' src='http://marketplacecraftersoftwarecom.live.craftercloud.io' />";
	}
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-marketplace",CStudioAdminConsole.Tool.MarketPlace);