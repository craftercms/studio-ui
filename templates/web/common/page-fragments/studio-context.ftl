<#assign site = envConfig.site />
<script>

	/**
	 * contextual variables 
	 * note: these are all fixed at the moment but will be dynamic
	 */
	CStudioAuthoringContext = {
		user: "${envConfig.user!'UNSET'}",
		role: "${envConfig.role!'UNSET'}",
		site: "${envConfig.site!'UNSET'}",
		siteId: "${envConfig.site!'UNSET'}",
		collabSandbox: "",
		baseUri: "/studio",
		authoringAppBaseUri: "${envConfig.authoringServerUrl!'/studio'}",
		formServerUri: "${envConfig.formServerUrl!'UNSET'}",
		previewAppBaseUri: "${envConfig.previewServerUrl!'UNSET'}", 
		contextMenuOffsetPage: false,
		brandedLogoUri: "/api/1/services/api/1/content/get-content-at-path.bin?path=/configuration/app-logo.png",
		homeUri: "/site-dashboard?site=${envConfig.site!'UNSET'}",
		navContext: "default",
		cookieDomain: "${cookieDomain!'UNSET'}",
		openSiteDropdown: ${envConfig.openSiteDropdown!"false"},
		isPreview: false,
		liveAppBaseUri:"",
		lang: "${envConfig.language!'UNSET'}"
	};

   	if(CStudioAuthoringContext.role === "") {
   		document.location = CStudioAuthoringContext.baseUri;
   	}


	$(function() {
		var localhost = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
		function detectIE() {
			var ua = window.navigator.userAgent;
			var trident = ua.indexOf('Trident/');
			if (trident > 0) {
				// IE 11 => return version number
				var rv = ua.indexOf('rv:');
				return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			}

			var edge = ua.indexOf('Edge/');
			if (edge > 0) {
				// Edge (IE 12+) => return version number
				return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
			}

			// other browser
			return false;
		}

		if(localhost && detectIE()){
			$("body").addClass("iewarning")
			$("body").prepend("<div class='ccms-iewarning'>Internet Explorer 11+ and Edge are known to have issues when your host name is \"localhost\"." + 
			" Please consider using <a style='color: #24ddff;' target=\"_blank\" href=\"https://www.google.com/chrome/browser/desktop/index.html\">Google Chrome</a> instead.</div>")
		}
	});
</script>
