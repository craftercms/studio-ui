<!--
  ~ Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

<div id="studioBar" class="studio-view">
  <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="container-fluid navbar-items-wrapper">

      <ul class="nav navbar-nav">
        <li><div id="menuBundleButton"></div></li>
        <li id="acn-dropdown-wrapper" class="acn-dropdown-wrapper"></li>
        <li>
          <a id="navbar-site-name" class="site-name trim" href="/studio/site-dashboard"></a>
        </li>
        <li class="dropdown quick-create hide" dropdown>
          <button
            id="quick-create-dropdown"
            class="dropdown-toggle nav-link ng-binding"
            dropdown-toggle=""
            aria-haspopup="true"
            aria-expanded="true"
          >
            <span class="fa fa-plus-circle pointer quick-create-button-icon" data-title="quickCreate"></span>
          </button>
          <div id="quick-create-menu"></div>
        </li>
      </ul>

      <ul class="nav navbar-nav" id="acn-quick-content"></ul>

      <ul class="nav navbar-nav" id="activeContentActions"></ul>

      <div class="navbar-right-wrapper navbar-right">
        <div id="appsIconLauncher"></div>
        <div id="acn-status">
          <span class="nav-icon fa fa-cloud-upload f18" data-title="publishingStatus"></span>
        </div>
        <div id="acn-searchtext">
          <span value="" class="nav-icon fa fa-search f18" data-title="search"></span>
        </div>
        <div id="acn-persona"></div>
        <div id="acn-preview-tools"></div>
        <div id="acn-ice-tools"></div>
      </div>

    </div>
  </nav>
</div>

<div id="acn-wrapper" style="display: none !important;">
  <div id="curtain" class="curtain-style"></div>
  <div id="authoringContextNavHeader">
    <div id="acn-bar">
      <div id="acn-group">
        <div id="acn-wcm-logo">
          <a id="acn-wcm-logo-link" href="javascript:">
            <img
                    id="acn-wcm-logo-image"
                    class="acn-logo-image"
                    alt="Dashboard"
            />
          </a>
        </div>
        <div id="_acn-dropdown-wrapper" class="acn-dropdown-wrapper"></div>
        <div id="acn-active-content"></div>
        <div id="acn-admin-console" style="float: left"></div>
        <div id="contextual_nav_menu_items"></div>
      </div>
      <div id="acn-right">
        <div id="_acn-ice-tools" style="float: left"></div>
        <div id="_acn-preview-tools" style="float: left"></div>
        <div id="_acn-status"></div>
        <div id="_acn-search"></div>
        <div id="_acn-persona" style="float: left"></div>
        <div id="acn-logout">
          <a id="acn-logout-link" href="#">Log Out</a>
        </div>
        <div id="_contextual_nav_menu_items"></div>
      </div>
    </div>
  </div>
</div>
