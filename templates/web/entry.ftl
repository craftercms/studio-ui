<#include "/templates/system/common/versionInfo.ftl" />
<!doctype html>
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

<html class="no-js" ng-app="studio">
<head>
  <meta charset="utf-8">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui">
  <title>${contentModel['common-title']!'Crafter CMS'}</title>
  <#-- Place favicon.ico and apple-touch-icon.png in the root directory -->

  <#if userEmail??>
    <script type="application/json" id="user">
    {"firstName":"${userFirstName!""}","lastName":"${userLastName!""}","email":"${userEmail!""}","authenticationType":"${authenticationType!""}","username":"${username!""}" }
    </script>
  </#if>

  <script>var CStudioAuthoring = { cookieDomain: "${cookieDomain}" };</script>

  <script>
    window.UIBuildId = "${UIBuildId!.now?string('Mddyyyy')}";
    const passwordRequirementsRegex = "${passwordRequirementsRegex?js_string}";
    document.documentElement.setAttribute('lang', (
      localStorage.getItem('${username!""}_crafterStudioLanguage') ||
      localStorage.getItem('crafterStudioLanguage') ||
      'en'
    ));
  </script>

  <#include "/templates/web/common/js-next-scripts.ftl" />

  <link rel="stylesheet" href="/studio/static-assets/styles/main.css?version=${UIBuildId!.now?string('Mddyyyy')}">
  <link rel="stylesheet" href="/studio/static-assets/libs/ng-tags-input/ng-tags-input.min.css?version=${UIBuildId!.now?string('Mddyyyy')}">
  <link rel="stylesheet" href="/studio/static-assets/libs/flexslider/flexslider.css?version=${UIBuildId!.now?string('Mddyyyy')}">
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/font-awesome.min.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href=/studio/static-assets/libs/datetimepicker/jquery.datetimepicker.css?version=${UIBuildId!.now?string('Mddyyyy')}" />

  <script src="/studio/static-assets/js/modernizr.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/jquery/dist/jquery.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/jquery/jquery.easing-1.4.1.min.js"></script>
  <script src="/studio/static-assets/libs/flexslider/jquery.flexslider.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/datetimepicker/jquery.datetimepicker.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/notify/notify.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular/angular-1.5.0.min.js"></script>
  <script src="/studio/static-assets/libs/angular/angular-sanitize-1.5.0.min.js"></script>
  <script src="/studio/static-assets/libs/angular-translate/angular-translate.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-translate-handler-log/angular-translate-handler-log.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-ui-router/release/angular-ui-router.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/bootstrap/js/bootstrap.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-cookies/angular-cookies.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-ui-utils/ui-utils.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/Smart-Table/dist/smart-table.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/ng-tags-input/ng-tags-input.min.js"></script>
  <script src="/studio/static-assets/libs/angular-animate/angular-animate.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/ng-pattern-restrict/ng-pattern-restrict.min.js"></script>
  <script src="/studio/static-assets/scripts/dirPagination.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/angular-moment/angular-moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/ace/ace.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/main.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/admin.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico?version=${UIBuildId!.now?string('Mddyyyy')}">
</head>
<body class="{{$state.current.cssClass}} user-dashboard">

<ui-view class="general-view"></ui-view>

<section class="craftercms-entitlement" ng-show="isFooter">
  <img class="craftercms-entitlement-logo" alt="Crafter CMS" src="/studio/static-assets/images/logo.svg" />
  <p class="craftercms-entitlement-copy">${applicationContext.get("crafter.entitlementValidator").getDescription()}</p>
</section>

</body>
</html>
