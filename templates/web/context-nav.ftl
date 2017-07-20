
<div id="studioBar" class="studio-view">
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="container-fluid">

            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
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

                <ul class="nav navbar-nav navbar-right">
                    <li>
                        <a id="usersRightNav" class="nav-link ng-binding users-link hidden" href="/studio/#/users">
                            <span class="nav-icon fa fa-users"></span>
                            <span class="nav-label">Users</span>
                        </a>
                    </li>
                    <li>
                        <a id="sitesRightNav" class="nav-link" href="/studio/#/sites">
                            <span class="nav-icon fa fa-sitemap"></span>
                            <span class="nav-label">Sites</span>
                        </a>
                    </li>
                    <li class="dropdown" dropdown>
                        <a id="help-dropdown" class="nav-link dropdown-toggle ng-binding" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">
                            <span class="nav-icon fa fa-life-ring"></span>
                            <span class="nav-label">Help<span class="caret"></span></span>
                        </a>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="http://docs.craftercms.org/en/3.0/" target="_blank">Documentation</a></li>
                            <li><a href="/studio/#/about-us">About</a></li>
                        </ul>
                    </li>
                    <li class="dropdown" dropdown="">
                        <a id="account-dropdown" class="dropdown-toggle ng-binding" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">&nbsp; <span class="caret"></span></a>
                        <ul class="dropdown-menu" role="menu">
                            <li class="user-display" style="padding: 0 20px 5px; margin-bottom: 5px; border-bottom: 1px solid #f2f2f2;">
                                <div id="nav-user-email"></div>
                            </li>
                            <li><a href="/studio/#/settings">Settings</a></li>
                            <li><a id="acn-logout-link">Sign out</a></li>
                        </ul>
                    </li>
                </ul>

                <div id="acn-separator" class="navbar-right">
                    <p class="ellipsis-icon">&#124;</p>
                </div>
                <div class="navbar-right">
                    <div id="acn-status" class="nav-link form-group">
                        <span value=""  class="nav-icon fa fa-cloud-upload f18" ></span>
                        <span class="nav-label">Publishing Status</span>
                    </div>
                </div>
                <div class="navbar-form navbar-right" role="search">
                    <div id="acn-searchtext" class="nav-link form-group">
                        <span value=""  class="nav-icon fa fa-search f18" ></span>
                        <span class="nav-label">Search</span>
                    </div>
                </div>
                <div id="acn-persona" class="navbar-right"></div>
                <div id="acn-preview-tools" class="navbar-right"></div>
                <div id="acn-ice-tools" class="navbar-right"></div>

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
