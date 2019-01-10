/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * contextual nav
 */
CStudioAuthoring.ContextualNav = CStudioAuthoring.ContextualNav || {

	initialized: false,

	/**
	 * call out to the authoring environment for the nav content and overlay it
	 * on success.
	 */
	hookNavOverlayFromAuthoring: function() {
		if(!this.initialized) {
			this.initialized = true;
			this.updateContextualNavOverlay()
		}
	},

	/**
	 * Add the contextual navigation overlay / authoring support over 
	 * top of the existing page
	 * @param content to overlay
	 */
	updateContextualNavOverlay: function(context) {
		var me = this;

		context = (context) ? context : CStudioAuthoringContext.navContext;
		CStudioAuthoring.Service.retrieveContextualNavContent(context, {
			success: function(navContent) {
				CStudioAuthoring.ContextualNav.addNavContent(navContent);
				YAHOO.util.Event.onAvailable("authoringContextNavHeader", function() {
                    document.domain = CStudioAuthoringContext.cookieDomain;
					CStudioAuthoring.Events.contextNavReady.fire();
					me.getNavBarContent()
				}, this);
			},
			failure: function() {
				YAHOO.log("Failed to hook context nav", "error", "authoring nav callback");
			}
		});
	},	

	/**
	 * add the contextual nav to the page - first time call
	 */
	addNavContent: function(navHtmlContent) {

		var bar = document.createElement("div");

		bar.id = "controls-overlay";
		bar.innerHTML = navHtmlContent;

		CStudioAuthoring.Service.retrieveContextNavConfiguration("default", {
			success: function(config) {
				var me = this;
				var $ = jQuery || function(fn) { fn() };
				$(function () {
					document.body.appendChild(bar);

					CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, "/",
						{
							success: function(data){
								var globalAdmin = false;
								for(var i=0; i<data.permissions.length;i++){
									if(data.permissions[i] === "create-site"){
										globalAdmin = true;
									}
								}
								if(globalAdmin){
									$("#studioBar .navbar-right .users-link").removeClass("hidden");
								}
							}
						});

					me.context.buildModules(config, bar);
				});

                CStudioAuthoring.Operations.createNavBarDropDown("help");

			},
			failure: function() {},
			context: this
		});
	},

	getNavBarContent: function() {
		var callback = {
			success: function(results) {
                document.getElementById('nav-user-name').innerHTML = results.first_name + " " + results.last_name;
				document.getElementById('nav-user-email').innerHTML = results.email;
				document.getElementById('account-dropdown').childNodes[0].nodeValue = results.username;
			},
			failure: function(response) {

			}
		};

		CStudioAuthoring.Service.getUserInfo(callback);
		document.getElementById('account-dropdown').childNodes[0].nodeValue = CStudioAuthoringContext.user;
	},

    /**
     * given a dropdown configuration, build the nav
     */
    buildModules: function(navConfig, barEl) {

		var c = navConfig;
		if (c.left && c.left.menuItem && c.left.menuItem.item) {
			this.showLeftModules(c.left.menuItem.item, barEl);
		}
		if (c.right && c.right.menuItem && c.right.menuItem.item) {
			this.showRightModules(c.right.menuItem.item, barEl);
		}

		if(navConfig.modules.module.length) {
			for(var i=0; i<navConfig.modules.module.length; i++) {
				var module = navConfig.modules.module[i];
				 
				var cb = {
					moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
						try {
						    moduleClass.initialize(moduleConfig);
						} catch (e) {
						    // in preview, this function undefined raises error -- unlike dashboard.
						    // I agree, not a good solution!
						}
					}
				};
				
                CStudioAuthoring.Module.requireModule(
                    module.moduleName,
                    '/static-assets/components/cstudio-contextual-nav/' + module.moduleName + ".js",
                    0,
                    cb
                );
			}
		}
    },

	/**
     * Hides/Disables first all the modules, so then when looping configuration, they are shown again
	 * 
     */
	preProcessModules: function(modulesMap, $barEl, onItem) { 
		for (var key in modulesMap) {
			if (modulesMap.hasOwnProperty(key)) {
				$barEl.find(modulesMap[key]).addClass('hidden');
				onItem(key, modulesMap[key]);
			}
		};
	},

	/**
     * Shown left context nav modules based on configuration
     */
	showLeftModules: function(modules, barEl) {
		var modulesMap = CStudioAuthoring.ContextualNav.LeftModulesMap;
		this.showModules(modulesMap, modules, barEl);
	},

	/**
     * Shown right context nav modules based on configuration
     */
	showRightModules: function(modules, barEl) {
		var modulesMap = CStudioAuthoring.ContextualNav.RightModulesMap;
		this.showModules(modulesMap, modules, barEl);
        this.showLabelsRightModules();
	},

    /**
     * Shown right context nav labels
     */
    showLabelsRightModules: function() {
        $( "#studioBar" ).delegate( ".nav-link", "mouseenter mouseleave", function(event) {
            if( event.type === "mouseover"  || event.type === "mouseenter" ){
                var elt = $( this).find(".nav-label");
                setTimeout(function () {
                    if ($("#"+elt.parent().get(0).id+':hover').length != 0) {
                        elt.addClass('nav-label-hover');
                        elt.removeClass('nav-label');
                    }
                }, 1000, false);
            }
            else{
                var elt = $(this).find(".nav-label-hover");
                elt.addClass( "nav-label" );
                elt.removeClass( "nav-label-hover" );
            }
        });

    },

	/**
     * Generic show modules stuff
     */
	showModules: function(modulesMap, modules, barEl) {
		var PREVIEW_CONTAINERS = '.studio-preview, .site-dashboard';
		var DISABLED = 'disabled-wcm-dropdown';
		
		var $barEl = $(barEl);

		this.preProcessModules(modulesMap, $barEl, function(key) {
			if (key === 'wcm_dropdown') {
				$(PREVIEW_CONTAINERS).addClass(DISABLED);
			}
		});

		for (var i = 0; i < modules.length; i++) {
			var name = modules[i].modulehook;
			$barEl.find(modulesMap[name]).removeClass('hidden');
			
			if (name === 'wcm_dropdown') {
				$(PREVIEW_CONTAINERS).removeClass(DISABLED);
			}

		};
	}
};

CStudioAuthoring.ContextualNav.LeftModulesMap = {
	'wcm_logo': '.navbar-brand',
	'wcm_dropdown': '#acn-dropdown-wrapper',
	'wcm_content': '#activeContentActions',
	'admin_console': '#acn-admin-console'
};

CStudioAuthoring.ContextualNav.RightModulesMap = {
	'ice_tools': '#acn-ice-tools',
	'preview_tools': '#acn-preview-tools',
	'targeting': '#acn-persona',
	'search': '[role="search"]',
    'status': '#acn-status',
	'logout': '#acn-logout-link'
};

CStudioAuthoring.Events.contextNavLoaded.fire();
