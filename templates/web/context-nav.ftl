
<!--
  ~ Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License as published by
  ~ the Free Software Foundation, either version 3 of the License, or
  ~ (at your option) any later version.
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
        <div class="container-fluid">

            <div class="navbar-header">
                <a class="navbar-brand" href="/studio/site-dashboard">
                    <img id="cstudio-logo" src="" alt="Crafter Studio">
                </a>
            </div>

            <div class="collapse navbar-collapse">
                <ul class="nav navbar-nav">
                    <li id="acn-dropdown-wrapper" class="acn-dropdown-wrapper"></li>
                    <li>
                        <a id="navbar-site-name" href="/studio/site-dashboard"></a>
                    </li>
                    <li class="dropdown quick-create hide" dropdown>
                        <a id="quick-create-dropdown" class="dropdown-toggle nav-link ng-binding" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">
                            <span class="nav-icon fa fa-plus-circle pointer" data-title="quickCreate"></span>
                        </a>
                        <ul id="quick-create" class="dropdown-menu" role="menu">
                            <li class="title" style=""><span data-translation="quickCreate">Quick Create</span></li>
                        </ul>
                    </li>
                </ul>

                <ul class="nav navbar-nav" id="acn-quick-content"></ul>

                <ul class="nav navbar-nav" id="activeContentActions"></ul>

                <div class="navbar-right-wrapper navbar-right">
                    <div id="toolbarGlobalNav">

                    </div>

                    <div id="acn-separator" class="navbar-right">
                        <p class="ellipsis-icon">&#124;</p>
                    </div>

                    <div class="acn-status-container navbar-right">
                        <div id="acn-status" class="nav-link form-group">
                            <span value=""  class="nav-icon fa fa-cloud-upload f18" data-title="publishingStatus" ></span>
                        </div>
                    </div>
                    <div class="navbar-form navbar-right" role="search">
                        <div id="acn-searchtext" class="nav-link form-group">
                            <span value=""  class="nav-icon fa fa-search f18" data-title="search" ></span>
                        </div>
                    </div>
                    <div id="acn-persona" class="navbar-right"></div>
                    <div id="acn-preview-tools" class="navbar-right"></div>
                    <div id="acn-ice-tools" class="navbar-right"></div>
                </div>

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
                        <img id="acn-wcm-logo-image"
                             class="acn-logo-image"
                             alt="Dashboard"/>
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
