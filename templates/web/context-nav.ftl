
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
                </ul>
 
                <ul class="nav navbar-nav" id="acn-quick-content"></ul>

                <ul class="nav navbar-nav" id="activeContentActions"></ul>

                <div class="navbar-right-wrapper">
                    <ul class="nav navbar-nav navbar-right">
                        <li>
                            <a id="homeUsers" class="nav-link ng-binding users-link hidden" href="/studio/#/users">
                                <span class="nav-icon fa fa-users"></span>
                                <span class="nav-label" data-translation="users">Users</span>
                            </a>
                        </li>
                        <li>
                            <a id="sitesRightNav" class="nav-link" href="/studio/#/sites">
                                <span class="nav-icon fa fa-sitemap"></span>
                                <span class="nav-label" data-translation="sites">Sites</span>
                            </a>
                        </li>
                        <li class="dropdown" dropdown>
                            <a id="help-dropdown" class="nav-link dropdown-toggle ng-binding" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">
                                <span class="nav-icon fa fa-life-ring"></span>
                                <span class="nav-label"><span data-translation="help">Help</span><span class="caret"></span></span>
                            </a>
                            <ul class="dropdown-menu" role="menu">
                                <li><a href="https://docs.craftercms.org/en/3.0/index.html" target="_blank" data-translation="documentation">Documentation</a></li>
                                <li><a href="/studio/#/about-us" data-translation="about">About</a></li>
                            </ul>
                        </li>
                        <li class="dropdown" dropdown="">
                            <a id="account-dropdown" class="dropdown-toggle ng-binding" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">&nbsp; <span class="caret"></span></a>
                            <ul class="dropdown-menu" role="menu">
                                <li class="user-display" style="padding: 0 20px 5px; margin-bottom: 5px; border-bottom: 1px solid #f2f2f2;">
                                    <div id="nav-user-name"></div>
                                    <div id="nav-user-email"></div>
                                </li>
                                <li><a href="/studio/#/settings" data-translation="settings">Settings</a></li>
                                <li><a id="acn-logout-link" data-translation="signOut">Sign out</a></li>
                            </ul>
                        </li>
                    </ul>

                    <div id="acn-separator" class="navbar-right">
                        <p class="ellipsis-icon">&#124;</p>
                    </div>
                    <div class="navbar-right">
                        <div id="acn-status" class="nav-link form-group">
                            <span value=""  class="nav-icon fa fa-cloud-upload f18" ></span>
                            <span class="nav-label" data-translation="publishingStatus">Publishing Status</span>
                        </div>
                    </div>
                    <div class="navbar-form navbar-right" role="search">
                        <div id="acn-searchtext" class="nav-link form-group">
                            <span value=""  class="nav-icon fa fa-search f18" ></span>
                            <span class="nav-label" data-translation="search">Search</span>
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

<div id="acn-wrapper" style="display: non e !important;">
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
