<#assign site = envConfig.site />
<!--
  ~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License version 3 as published by
  ~ the Free Software Foundation.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU General Public License for more details.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

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
    authenticationType: "${envConfig.authenticationType!'UNSET'}",
    collabSandbox: '',
    baseUri: '/studio',
    authoringAppBaseUri: window.location.origin + '/studio',
    formServerUri: window.location.origin,
    previewAppBaseUri: window.location.origin,
    contextMenuOffsetPage: false,
    brandedLogoUri: '/api/1/services/api/1/content/get-content-at-path.bin?path=/configuration/app-logo.png',
    homeUri: "/site-dashboard?site=${envConfig.site!'UNSET'}",
		navContext: "default",
		cookieDomain: "${cookieDomain!'UNSET'}",
		openSiteDropdown: ${envConfig.openSiteDropdown!"false"},
    isPreview: false,
    liveAppBaseUri: '',
    graphQLBaseURI: window.location.origin + '/api/1/site/graphql',
    xsrfHeaderName: "${_csrf.headerName}",
		xsrfParameterName: "${_csrf.parameterName}",
		passwordRequirementsRegex: "${envConfig.passwordRequirementsRegex?js_string}"
  };

  if (CStudioAuthoringContext.role === '') {
    document.location = CStudioAuthoringContext.baseUri;
  }

  var lang = (
          localStorage.getItem(CStudioAuthoringContext.user + '_crafterStudioLanguage') ||
          localStorage.getItem('crafterStudioLanguage') ||
          'en'
  );

  $('html').attr('lang', lang);
  CStudioAuthoringContext.lang = lang;

	$(function() {
		var isChromium = window.chrome,
			vendorName = window.navigator.vendor,
			isOpera = window.navigator.userAgent.indexOf("OPR") > -1,
            isIEedge = window.navigator.userAgent.indexOf('Edge') > -1;

    if (isChromium !== null && isChromium !== undefined && vendorName === 'Google Inc.' && isOpera == false && isIEedge == false) {
      isChromium = true;
    } else {
      isChromium = false;
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    if (!(isChromium || isFirefox)) {
      $('body').addClass('iewarning');
      $('body').prepend('<div class=\'ccms-iewarning\'>Your browser is currently not supported, ' +
              'please use <a style=\'color: #24ddff;\' target=\'_blank\' href=\'https://www.google.com/chrome/browser/desktop/index.html\'>Chrome</a> or <a style=\'color: #24ddff;\' target=\'_blank\' href=\'https://www.mozilla.org/en-US/firefox/new/?scene=2\'>Firefox</a>.</div>');
    }
  });
</script>
