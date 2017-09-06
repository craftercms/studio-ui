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
		var isChromium = window.chrome,
			vendorName = window.navigator.vendor,
			isOpera = window.navigator.userAgent.indexOf("OPR") > -1,
			isIEedge = window.navigator.userAgent.indexOf("Edge") > -1;

		if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
			isChromium = true;
		} else { 
			isChromium = false;
			var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		}

		if(!(isChromium || isFirefox)){
			$("body").addClass("iewarning")
			$("body").prepend("<div class='ccms-iewarning'>Your browser is currently not supported, " + 
			"please use <a style='color: #24ddff;' target='_blank' href='https://www.google.com/chrome/browser/desktop/index.html'>Chrome</a> or <a style='color: #24ddff;' target='_blank' href='https://www.mozilla.org/en-US/firefox/new/?scene=2'>Firefox</a>.</div>");
		}
	});
</script>
