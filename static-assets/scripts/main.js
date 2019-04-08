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

(function (angular) {
    'use strict';

    var app = angular.module('studio', [
        'ngCookies',
        'ui.router',
        'ui.bootstrap',
        'smart-table',
        'pascalprecht.translate',
        'angularMoment',
        'angularUtils.directives.dirPagination',
        'ngTagsInput',
        'ngPatternRestrict',
        'ngAnimate'
    ]);

    app.run([
        '$rootScope', '$state', '$stateParams', 'authService', 'sitesService', 'Constants', '$http', '$cookies', '$location',
        function ($rootScope, $state, $stateParams, authService, sitesService, Constants, $http, $cookies, $location) {

            $http.defaults.headers.common['X-XSRF-TOKEN'] = xsrfToken;

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.imagesDirectory = Constants.PATH_IMG;

            $rootScope.$on('$stateChangeStart', function (event, toState) {
                authService.validateSession().then(
                    function successCallback(response) {
                        if (toState.name.indexOf('login') !== -1) {
                            if (authService.getUser() && authService.getUser().authenticationType == Constants.HEADERS) {
                                $state.go('home.globalMenu');
                            }
                        }

                    }, function errorCallback(e) {
                        authService.removeUser();

                        if (toState.name.indexOf('login') === -1 && e.status !== 500) {
                            if (toState.name.indexOf('reset') === -1) {
                                event.preventDefault();
                                $state.go('login');
                            }
                        }
                    }
                );

                if(toState.name.indexOf('users') !== -1 ){
                    // console.log('on users page');

                    var user = authService.getUser();
                        var createSitePermissions = false;

                    if(user && user.username) {
                        sitesService.getPermissions('', '/', user.username || user)
                            .success(function (data) {
                                for(var i=0; i<data.permissions.length;i++){
                                    if(data.permissions[i]=='create-site'){
                                        createSitePermissions = true;
                                    }
                                }

                                if(!createSitePermissions){
                                    $state.go('home.globalMenu');
                                }
                            })
                    }

                }

            });

            sitesService.getLanguages($rootScope, true);
        }
    ]);

    app.config([
        '$stateProvider', '$urlRouterProvider', '$translateProvider',
        function ($stateProvider, $urlRouterProvider, $translateProvider) {
            $urlRouterProvider
                .otherwise('/globalMenu');

            $stateProvider
                .state('home', {
                    url: '/',
                    abstract: true,
                    templateUrl: '/studio/static-assets/ng-views/layout.html',
                    controller: 'AppCtrl'
                })
                .state('home.globalMenu', {
                    url: 'globalMenu',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/globalMenu.html',
                            controller: 'GlobalMenuCtrl'
                        }
                    }
                })
                .state('home.globalMenu.sites', {
                    url: '/sites',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/sites.html',
                            controller: 'SitesCtrl'
                        }
                    }
                })
                .state('home.globalMenu.users', {
                    url: '/users',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/admin-users.html',
                            controller: 'UsersCtrl'
                        }
                    }
                })
                .state('home.globalMenu.cluster', {
                    url: '/cluster',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/admin-cluster.html',
                            controller: 'clusterCtrl'
                        }
                    }
                })
                .state('home.cluster', {
                    url: 'cluster',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/admin-cluster.html',
                            controller: 'clusterCtrl'
                        }
                    }
                })
                .state('home.globalMenu.groups', {
                    url: '/groups',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/admin-groups.html',
                            controller: 'GroupsCtrl'
                        }
                    }
                })
                .state('home.globalMenu.audit', {
                    url: '/audit',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/audit.html',
                            controller: 'AuditCtrl'
                        }
                    }
                })
                .state('home.globalMenu.logging-levels', {
                    url: '/logging',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/logging.html',
                            controller: 'LoggingLevelsCtrl'
                        }
                    }
                })
                .state('home.globalMenu.log-console', {
                    url: '/log',
                    views: {
                        contentTab: {
                            templateUrl: '/studio/static-assets/ng-views/log-console.html',
                            controller: 'LogConsoleCtrl'
                        }
                    }
                })
                .state('home.sites', {
                    url: 'sites',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/sites.html',
                            controller: 'SitesCtrl'
                        }
                    }
                })
                .state('home.sites.create', {
                    url: '/create',
                    templateUrl: '/studio/static-assets/ng-views/create-site.html',
                     controller: 'SiteCtrl'
                })
                .state('home.sites.site', {
                    url: '/:siteId',
                    templateUrl: '/studio/static-assets/ng-views/site.html',
                    controller: 'SiteCtrl'
                })
                .state('home.settings', {
                    url: 'settings',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/settings.html',
                            controller: 'AppCtrl'
                        }
                    }
                })
                .state('home.about-us', {
                    url: 'about-us',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/about.html',
                            controller: 'AppCtrl'
                        }
                    }
                })
                .state('home.users', {
                    url: 'users',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/admin-users.html',
                            controller: 'UsersCtrl'
                        }
                    }
                })
                .state('home.groups', {
                    url: 'groups',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/admin-groups.html',
                            controller: 'GroupsCtrl'
                        }
                    }
                })
                .state('home.audit', {
                    url: 'audit',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/audit.html',
                            controller: 'AuditCtrl'
                        }
                    }
                })
                .state('home.publishing', {
                    url: 'publishing',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/publishing.html',
                            controller: 'PublishingCtrl'
                        }
                    }
                })
                .state('home.repositories', {
                    url: 'repositories',
                    views: {
                        content: {
                            templateUrl: '/studio/static-assets/ng-views/admin-repository.html',
                            controller: 'RepositoriesCtrl'
                        }
                    }
                })
                .state('login', {
                    url: '/login',
                    onEnter: [
                        '$rootScope', '$state', '$uibModal',
                        function ($rootScope, $state, $uibModal) {

                            $rootScope.loginModal = $uibModal.open({
                                templateUrl: '/studio/static-assets/ng-views/login.html',
                                controller: 'LoginCtrl',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'sm'
                            });

                            $rootScope.loginModal.result.finally(function () {
                                $rootScope.loginModal = null;
                                // $state.go('home.sites');
                            });

                        }
                    ],
                    onExit: [
                        '$rootScope',
                        function ($rootScope) {
                            if ($rootScope.loginModal) {
                                $rootScope.loginModal.close();
                            }
                        }
                    ]
                })
                .state('login.recover', {
                    url: '/recover',
                    onEnter: [
                        '$rootScope', '$state', '$uibModal',
                        function ($rootScope, $state, $uibModal) {

                            $rootScope.recoverModal = $uibModal.open({
                                templateUrl: '/studio/static-assets/ng-views/recover.html',
                                controller: 'RecoverCtrl',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'sm'
                            });

                            $rootScope.recoverModal.result.finally(function () {
                                $rootScope.recoverModal = null;
                                // $state.go('login');
                            });

                        }
                    ],
                    onExit: [
                        '$rootScope',
                        function ($rootScope) {
                            if ($rootScope.recoverModal) {
                                $rootScope.recoverModal.close();
                            }
                        }
                    ]
                })
                .state('home.reset', {
                    url: 'reset-password',
                    onEnter: [
                        '$rootScope', '$state', '$uibModal',
                        function ($rootScope, $state, $uibModal) {

                            $rootScope.resetModal = $uibModal.open({
                                templateUrl: '/studio/static-assets/ng-views/reset-password.html',
                                controller: 'ResetCtrl',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'sm'
                            });
                        }
                    ],
                    onExit: [
                        '$rootScope',
                        function ($rootScope) {
                            if ($rootScope.resetModal) {
                                $rootScope.resetModal.close();
                            }
                        }
                    ]
                })
                .state('logout', {
                    url: 'logout',
                    controller: 'AppCtrl'
                })
                .state('preview', {
                    url: '/preview?site&url',
                    cssClass: 'studio-preview',
                    templateUrl: '/studio/static-assets/ng-views/preview.html',
                    controller: 'PreviewCtrl'
                });

            $translateProvider.preferredLanguage('en');

            $translateProvider.useStaticFilesLoader({
                prefix: '/studio/static-assets/scripts/resources/locale-',
                suffix: '.json'
            });

        }
    ]);

    app.constant('Constants', {
        AUTH_SUCCESS: 'auth-success',
        PATH_IMG: '/images/',
        SERVICE: '/studio/api/1/services/api/1/',
        SERVICE2:'/studio/api/2/',
        STUDIO_PATH: '/studio',
        MONITORING_PATH: 'monitoring/',
        SHOW_LOADER: 'show-loader',
        BULK_ENVIRONMENT: 'Live',
        HEADERS: 'headers',
        AUTH_HEADERS: "AUTH_HEADERS"
    });

    app.service('authService', [
        '$rootScope', '$http', '$document', 'Constants', '$cookies',
        function ($rootScope, $http, $document, Constants, $cookies) {

            var user = null;
            var script = $document[0].getElementById('user');

            if (script) {
                script = angular.element(script);
                user = JSON.parse(script.html());
            }

            if(!user || user.username == ""){
                if($cookies['userSession']){
                    user = JSON.parse($cookies[['userSession']]);
                }else{
                    user = null;
                }
            }

            this.isAuthenticated = function () {
                return !!user;
            };

            this.login = function(data) {
                return $http.post(security('login'), data).then(function (data) {
                    if(data.status == 200){
                        user = data.data;
                        $rootScope.$broadcast(Constants.AUTH_SUCCESS, user);
                        $cookies['userSession'] = JSON.stringify(user);
                    }
                    return data.data;
                });
            };

            /*this.logout = function (info) {
                $http({
                    method: info.method,
                    url: info.url
                });
                user = null;

                $cookies['userSession'] = null;
            };*/

            this.logout = function () {
                $http.post(security('logout'), null);
                user = null;

                $cookies['userSession'] = null;
            };

            this.getSSOLogoutInfo = function () {
                return $http.get(userActions("/me/logout/sso/url"));
            };

            this.getUser = function () {
                return user;
            };

            this.getCurrentUserData = function(action) {
                if(this.getUser()){
                    return $http.get(userActions('/' + action));
                }
            }

            this.removeUser = function() {
                $cookies['userSession'] = null;
            };

            this.getStudioInfo = function () {
                return $http.get(api2('version', Constants.MONITORING_PATH));
            };

            this.forgotPassword = function (username) {
                return $http.get(api('forgot-password'), {
                    params: { username : username }
                });
            };

            this.recoverPassword = function (data) {
                return $http.post(api('reset-password'), data);
            };

            this.setPassword = function (data) {
                return $http.post(api('set-password'), data);
            };

            this.changePassword = function (data) {
                return $http.post(api('change-password'), data);
            };

            this.validateToken = function (data){
                return $http.get(api('validate-token'), {
                    params: { token: data.token }
                });
            };

            this.validateSession = function() {
                return $http.get(security('validate-session'));
            };

            this.getLoginLogo = function() {
                return $http.get(api('get-ui-resource-override', true), {
                    params: { resource : 'logo.jpg' }
                })
            };

            this.getLoginUrl = function() {
                return api('get-ui-resource-override', true) + '?resource=logo.jpg';
            };

            function api(action, server, monitor) {
                var api = "user/";

                if(server){
                    api = "server/";
                }

                if(monitor){
                    api = "monitor/";
                }

                return Constants.SERVICE + api + action + '.json';
            }

            function api2(action, path) {
                return Constants.SERVICE2 + path + action;
            }

            function security(action){
                var api = "security/";
                return Constants.SERVICE + api + action + '.json';
            }

            function userActions(action) {
                if(action){
                    return Constants.SERVICE2 + 'users' + action;
                }else{
                    return Constants.SERVICE2 + 'users';
                }

            }

            return this;

        }
    ]);

    app.service('sitesService', [
        '$rootScope', '$http', 'Constants', '$cookies', '$timeout', '$window', '$translate',
        function ($rootScope, $http, Constants, $cookies, $timeout, $window, $translate) {

            var me = this;

            this.getSites = function(params) {
                return $http.get(api('get-per-user'), {
                    params: params
                });
            };

            this.getSite = function(id) {
                return $http.get(json('get-site'), {
                    params: { siteId: id }
                });
            };

            this.getSitesPerUser = function(id, params) {
                return $http.get(userActions(id + '/sites'), {
                    params: params
                });
            }

            this.setCookie = function(cookieGenName, value, maxAge) {
                //$cookies[cookieName] = site.siteId;
                var domainVal = (document.location.hostname.indexOf(".") > -1) ? "domain=" + document.location.hostname : "";
                if (maxAge != null) {
                    document.cookie = [cookieGenName, "=", value, "; path=/; ", domainVal, "; max-age=", maxAge].join("");
                } else {
                    document.cookie = [cookieGenName, "=", value, "; path=/; ", domainVal].join("");
                }
            }

            this.editSite = function (site) {
                me.setCookie('crafterSite',site.siteId);
                $timeout(function () {

                    // For future in-app iframe
                    // $state.go('preview', { site: site.siteId, url: site.cstudioURL });

                    $window.location.href = '/studio/preview/#/?page=/&site=' + site.siteId;

                }, 0, false);
            };

            this.goToDashboard = function (site) {

                me.setCookie('crafterSite',site.siteId);
                $timeout(function () {
                    $window.location.href = '/studio/site-dashboard';
                }, 0, false);
            };

            this.create = function (site) {
                return $http.post(api('create'),site);
            };

            this.exists = function (site) {
                return $http.get(api('exists'), {
                    params: { site: site.site}
                });
            };

            this.removeSite = function(site) {
                return $http.post(api('delete-site'), {
                    siteId: site.siteId
                });
            };

            this.getAvailableBlueprints = function() {
                return $http.get(sitesApi('available_blueprints'));
            };

            this.getPermissions = function(siteId, path, user){
                return $http.get(security('get-user-permissions'), {
                    params: { site: siteId,  path: path, user: user}
                });
            };

            this.getAvailableLanguages = function(){
                return $http.get(server('get-available-languages'));
            };

            this.getDocumentCookie = function(name) {
                var value = "; " + document.cookie;
                var parts = value.split("; " + name + "=");
                if (parts.length == 2) return parts.pop().split(";").shift();
            };

            this.getLanguages = function(scope, setLang) {
                var me = this;
                this.getAvailableLanguages()
                    .success(function (data) {
                        var cookieLang = me.getDocumentCookie('crafterStudioLanguage');

                        if(cookieLang){
                            for(var i=0; i<data.length; i++){
                                if(data[i].id == cookieLang){
                                    scope.langSelect = data[i].id;
                                    scope.langSelected = data[i].id;
                                }
                            }
                        }else{
                            scope.langSelect = data[0].id;
                            scope.langSelected = data[0].id;
                        }
                        scope.languagesAvailable = data;

                        if(setLang){
                            $translate.use(cookieLang);
                        }
                    })
                    .error(function () {
                        scope.languagesAvailable = [];
                    });


            };

            this.showLoaderProperty = function() {
                var showLoader = false;

                return {
                    getProperty: function () {
                        return showLoader;
                    },
                    setProperty: function(value) {
                        showLoader = value;
                        $rootScope.$broadcast(Constants.SHOW_LOADER, value);
                    }
                };
            };

            this.getGlobalMenu = function(){
                return $http.get(uiApi('global_menu'));
            };

            function api(action) {
                return Constants.SERVICE + 'site/' + action + '.json';
            }

            function json(action) {
                return Constants.SERVICE + 'user/' + action + '.json';
            }

            function security(action) {
                return Constants.SERVICE + 'security/' + action + '.json';
            }

            function server(action) {
                return Constants.SERVICE + 'server/' + action + '.json';
            }

            function uiApi(action) {
                return Constants.SERVICE2+ 'ui/views/' + action + '.json';
            }

            function sitesApi(action) {
                return Constants.SERVICE2+ 'sites/' + action + '.json';
            }

            function userActions(action, params) {
                if(params){
                    return Constants.SERVICE2 + 'users/' + action + params;
                }else {
                    return Constants.SERVICE2 + 'users/' + action;
                }
            }

            return this;

        }
    ]);

    app.controller('AppCtrl', [
        '$rootScope', '$scope', '$state', 'authService', 'Constants', 'sitesService', '$cookies', '$uibModal', '$translate', '$timeout', '$location',
        function ($rootScope, $scope, $state, authService, Constants, sitesService, $cookies, $uibModal, $translate, $timeout, $location) {

            $scope.langSelected = '';
            $scope.modalInstance = '';
            $scope.authenticated = authService.isAuthenticated();
            $scope.helpUrl = 'https://docs.craftercms.org/en/3.1/index.html';
            $scope.isIframeClass = $location.search().iframe ? 'iframe' : '';
            $rootScope.isFooter = true;
            $scope.showLogoutLink = false;
            $scope.logoutInfo = {};

            if($location.$$search.iframe){
                $rootScope.isFooter = false;
            }

            if(authService.getUser()){
                authService.getCurrentUserData('me').then(
                    function successCallback(response) {
                        $scope.externallyManaged = response.data.authenticatedUser.externallyManaged;
                        $scope.showLogoutLink = response.data.authenticatedUser.authenticationType == Constants.AUTH_HEADERS ? false : true;
                        if(!$scope.showLogoutLink) {
                            authService.getSSOLogoutInfo()
                                .success(function (data) {
                                    var result = data.logoutUrl ? true : false;
                                    if (result) {
                                        $scope.showLogoutLink = true;
                                        $scope.logoutInfo.url = data.logoutUrl;
                                    }
                                })
                        }
                    }, function errorCallback(response) {
                    }
                );
            }

            function logout() {
                if($scope.showLogoutLink){
                    authService.logout();
                    if($scope.logoutInfo.url){
                        $window.location.href = $scope.logoutInfo.url;
                    }else {
                        $state.go('login');
                    }
                }

            }

            function mouseOverTopMenu(evt) {
                var elt = $(evt.target).find('.nav-label');
                $timeout(function () {
                    if ($("#"+elt.parent().get(0).id+':hover').length != 0) {
                        elt.addClass('nav-label-hover');
                        elt.removeClass('nav-label');
                    }
                }, 1000, false);
            }

            function mouseLeaveTopMenu(evt) {
                var elt = $(evt.target).find('.nav-label-hover');
                elt.addClass('nav-label');
                elt.removeClass('nav-label-hover');
            }


            function changePassword() {
                $scope.data.username = $scope.user.username;

                if($scope.data.new == $scope.data.confirmation){
                    authService.changePassword($scope.data)
                        .then(function (data) {
                            $scope.error = $scope.message = null;

                            if (data.type === 'error') {
                                $scope.error = data.message;
                            } else if (data.error) {
                                $scope.error = data.error;
                            } else {
                                $scope.message = data.message;

                                $rootScope.modalInstance = $uibModal.open({
                                    templateUrl: 'passwordUpdated.html',
                                    windowClass: 'centered-dialog',
                                    controller: 'AppCtrl',
                                    backdrop: 'static',
                                    backdropClass: 'hidden',
                                    keyboard: false,
                                    size: 'sm'
                                });
                                $timeout(function () {
                                    $rootScope.modalInstance.close();
                                    $scope.data = {};
                                    logout();
                                }, 1500, false);

                            }
                        }, function(error){
                            $scope.error = error.data.message;
                        });
                }else{
                    $scope.error = "Passwords don't match.";
                }
            }

            $scope.languagesAvailable = [];

            sitesService.getLanguages($scope);

            $scope.selectAction = function(optSelected) {
                $scope.langSelected = optSelected;
                $translate.use($scope.langSelected);
            };

            $scope.setLangCookie = function() {
                $translate.use($scope.langSelected);
                // set max-age of language cookie to one year
                sitesService.setCookie('crafterStudioLanguage', $scope.langSelected, 31536000);

                $rootScope.modalInstance = $uibModal.open({
                    templateUrl: 'settingLanguajeConfirmation.html',
                    windowClass: 'centered-dialog',
                    controller: 'AppCtrl',
                    backdrop: 'static',
                    backdropClass: 'hidden',
                    keyboard: false,
                    size: 'sm'
                });
                $timeout(function () {
                    $rootScope.modalInstance.close();
                }, 1500, false);

            };

            $scope.cancel = function () {
                $rootScope.modalInstance.close();
            };

            $scope.loadHomeState = function() {
                var currentState = $state.current.name,
                    homeState = 'home.globalMenu';

                // If current state = home, reload controller
                if( currentState.indexOf(homeState) !== -1 ){
                    $state.go('home.globalMenu',{},{reload:true});
                }else{
                    $state.go('home.globalMenu');
                }

            }

            $scope.user = authService.getUser();

            if($scope.user && $scope.user.username) {
                sitesService.getPermissions('', '/', $scope.user.username || $scope.user)
                    .success(function (data) {
                        for(var i=0; i<data.permissions.length;i++){
                            if(data.permissions[i]=='create-site'){
                                $scope.createSites = true;
                            }
                        }
                    })
            }

            $scope.data = { email: ($scope.user || { 'email': '' }).email };
            $scope.error = null;

            $scope.logout = logout;
            $scope.changePassword = changePassword;
            $scope.mouseOverTopMenu = mouseOverTopMenu;
            $scope.mouseLeaveTopMenu = mouseLeaveTopMenu;

            $scope.$on(Constants.AUTH_SUCCESS, function ($event, user) {
                $scope.user = user;
                $scope.data.email = $scope.user.email;
            });

            authService.getLoginLogo().then(
                function successCallback(response) {
                    $scope.crafterLogo = authService.getLoginUrl();
                }, function errorCallback(response) {
                    $scope.crafterLogo = "/studio/static-assets/images/crafter_studio_360.png";
                }
            );

            if(authService.getUser()) {
                authService.getStudioInfo().then(
                    function successCallback(response) {
                        $scope.aboutStudio = response.data.version;
                        $scope.versionNumber = response.data.version.packageVersion + "-" + response.data.version.packageBuild.substring(0, 6);
                    }, function errorCallback(response) {
                    }
                );
            }

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
                $scope.ieWarning = true;
            }

            $scope.reLogin = function() {
                
                var data =  {
                    "username": $scope.user.username,
                    "password": $scope.user.reLoginPass
                }

                authService.login(data)
                    .then(function success(data) {
                        window.reLoginModalOn = false; 
                        $scope.reLoginModal.close();  
                        setTimeout(function () {
                            authLoop();
                        }, $scope.authDelay);

                    }, function error(response){
                        $scope.reLoginError = {};

                        if(response.status == 401){
                            $scope.reLoginError.message = $translate.instant('dashboard.login.USER_PASSWORD_INVALID');
                        }else{
                            $scope.reLoginError.message = $translate.instant('dashboard.login.LOGIN_ERROR');
                        }

                    });
            };

            $scope.reLoginSignOut = function() {
                if(window.reLoginModalOn){
                    $scope.reLoginModal.close();
                    window.reLoginModalOn = false;
                }
                $scope.logout();
            };

            function showReLoginModal() {
                var modal = $uibModal.open({
                    templateUrl: 'reLoginModal.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm',
                    scope: $scope,
                    windowClass: 'relogin-modal'
                });

                return modal;
            }

            function authLoop() {
                $scope.authDelay = 60000;
                $scope.reLoginError = null;
                var isInIframe = (window.location != window.parent.location) ? true : false;

                if( !window.reLoginModalOn && !isInIframe && "login" !== $state.current.name ) {
                    window.reLoginModalOn = true;

                    authService.validateSession().then(
                        function successCallback(response) {
                            if (response.status == 200 && response.data.message == "OK") {
                                window.reLoginModalOn = false;                                
                                setTimeout(function () {
                                    authLoop();
                                }, $scope.authDelay);

                            }else{
                                if(authService.getUser().authenticationType == Constants.HEADERS){
                                    $state.go('login');
                                }else{
                                    $scope.reLoginModal = showReLoginModal();
                                }
                            }


                        }, function errorCallback(response) {
                            if (response.status == 401 || response.status == 301 ||
                                response.status == 302 || response.status == 0) {
                                if(authService.getUser().authenticationType == Constants.HEADERS){
                                    $state.go('login');
                                }else{
                                    $scope.reLoginModal = showReLoginModal();
                                }

                            } else {
                                window.reLoginModalOn = false;     
                                setTimeout(function () {
                                    authLoop();
                                }, $scope.authDelay);
                            }
                        }
                    );
                }
            }

            if(authService.getUser()) {
                authLoop();
            }

            $scope.spinnerOverlay = function() {
                return $uibModal.open({
                    templateUrl: 'spinnerModal.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm',
                    windowClass: 'spinner-modal centered-dialog',
                });
            }
        }
    ]);

    app.controller('GlobalMenuCtrl', [
        '$scope', '$state', '$location', 'sitesService',

        function ($scope, $state, $location, sitesService) {


            $scope.entities;
            $scope.changeTab = function(tab, route) {
                $scope.view_tab = tab;
                $state.go(route ? route : ' ');
            }

            sitesService.getGlobalMenu()
                .success(function (data) {
                    $scope.entities = data.menuItems;
                    //$scope.entities = [{"id":"home.globalMenu.sites","label":"Sites","icon":"fa-sitemap"}];

                    if($scope.entities.length > 1){
                        $scope.entities.forEach(function(entry, i) {
                            entry.tabName = 'tab'+ entry.label.replace(/ /g,'').toLocaleLowerCase();
                            if (i<1){
                                $scope.view_tab = entry.tabName;
                                $state.go(entry.id);
                            }
                        });
                    }else{
                        if($scope.entities.length > 0) {
                            $state.go(data.menuItems[0].id.replace("globalMenu.", ""));
                        }
                    }


                })
                .error(function (er) {
                    console.log(er);
                });
        }

    ]);

    app.controller('SitesCtrl', [
        '$scope', '$state', '$location', 'sitesService', 'authService', '$uibModal', '$cookies', '$timeout', 'Constants',

        function ($scope, $state, $location, sitesService, authService, $uibModal, $cookies, $timeout, Constants) {

            $scope.sites = null;

            $scope.editSite = sitesService.editSite;

            $scope.goToDashboard = sitesService.goToDashboard;

            $scope.createSites = false;

            $scope.user = authService.getUser();

            $scope.siteValidation = $location.$$search.siteValidation;

            $scope.showLoader = sitesService.showLoaderProperty().getProperty();

            $scope.$on(Constants.SHOW_LOADER, function ($event, showLoader) {
                $scope.showLoader = showLoader;
            });

            $scope.sitesPag = {
                sitesPerPage: $cookies.get("crafterStudioSitesPagination") ? parseInt($cookies.get("crafterStudioSitesPagination"), 10) : 15
            }

            $scope.totalSites = 0;
            $scope.defaultDelay = 500;

            $scope.pageChanged = function(newPage) {
                getResultsPage(newPage);
                sitesService.setCookie('crafterStudioSitesPagination', $scope.sitesPag.sitesPerPage);
            };

            function getSites (params) {
                sitesService.getSitesPerUser('me',params)
                    .success(function (data) {
                        $scope.totalSites = data.total ? data.total : null;
                        $scope.sites = data.sites;
                        isRemove();
                        createSitePermission();
                    })
                    .error(function () {
                        $scope.sites = null;
                    });
            }

            $scope.pagination = {
                current: 1
            };

            function getResultsPage(pageNumber) {

                if(authService.getUser()){
                    var params = {};

                    if($scope.totalSites && $scope.totalSites > 0) {
                        var offset = (pageNumber - 1) * $scope.sitesPag.sitesPerPage,
                            limit = offset + $scope.sitesPag.sitesPerPage;
                        params.offset = offset;
                        params.limit = $scope.sitesPag.sitesPerPage;
                    }else{
                        params.offset = 0;
                        params.limit = $scope.sitesPag.sitesPerPage;
                    }

                    getSites(params);
                }

            }

            getResultsPage(1);

            $scope.removeSiteSites = function (site){

                var modalInstance = $uibModal.open({
                    templateUrl: 'removeConfirmation.html',
                    controller: 'RemoveSiteCtrl',
                    backdrop: 'static',
                    keyboard: true,
                    windowClass: "studioMedium",
                    resolve: {
                        siteToRemove: function () {
                            return site;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    getResultsPage(1);
                });

            }

            function addingRemoveProperty(siteId){
                for(var j=0; j<$scope.sites.length;j++){
                    if($scope.sites[j].siteId == siteId){
                        $scope.sites[j].remove = true;
                    }
                }
            }

            function removePermissionPerSite(siteId){
                sitesService.getPermissions(siteId, '/', $scope.user.username || $scope.user)
                    .success(function (data) {
                        for(var i=0; i<data.permissions.length;i++){
                            if(data.permissions[i]=='delete'){
                                addingRemoveProperty(siteId);
                            }
                        }
                    })
                    .error(function () {
                    });
            }

            function isRemove(){
                for(var j=0; j<$scope.sites.length;j++){
                    removePermissionPerSite($scope.sites[j].siteId);
                }
            }

            function createSitePermission(){
                sitesService.getPermissions('', '/', $scope.user.username || $scope.user)
                    .success(function (data) {
                        for(var i=0; i<data.permissions.length;i++){
                            if(data.permissions[i]=='create-site'){
                                $scope.createSites = true;
                            }
                        }
                    })
                    .error(function () {
                    });
            }

            $scope.createSitesDialog = function() {
                $scope.adminModal = $uibModal.open({
                    templateUrl: '/studio/static-assets/ng-views/create-site.html?version='+ UIBuildId,
                    backdrop: 'static',
                    keyboard: true,
                    controller: 'SiteCtrl',
                    scope: $scope,
                    size: 'lg'
                });

                $scope.bpSelectorOpen = false;

                $scope.toggleOpen = function() {
                    $scope.bpSelectorOpen = !$scope.bpSelectorOpen;
                }; 

                $scope.trySubmit = function(e){
                    // Internet Explorer 6-11
                    var isIE = /*@cc_on!@*/false || !!document.documentMode;
                
                    // Edge 20+
                    var isEdge = !isIE && !!window.StyleMedia;
    
                    if(isIE || isEdge) {
                        
                        if(e.keyCode == 13){
                            if($scope.bpSelectorOpen){
                                $scope.bpSelectorOpen = false;
                            }else{
                                $timeout(function(){
                                    $("form[name='createNameForm'] button[type='submit']").click();
                                });
                            }
                        }

                    }
                };
            }

            if($scope.siteValidation){
                $scope.adminModal = $uibModal.open({
                    templateUrl: 'invalidSite.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm',
                    controller: 'ErrorSiteCtrl',
                    scope: $scope
                });
            }


        }

    ]);

    app.controller('RemoveSiteCtrl', [
        '$scope', '$state', 'sitesService', '$modalInstance', 'siteToRemove',
        function ($scope, $state, sitesService, $modalInstance, siteToRemove) {

            $scope.siteToRemove = siteToRemove.siteId;
            $scope.confirmationSubmitDisabled = false;

            function removeSiteSitesModal (site){

                sitesService.removeSite(site)
                 .success(function (data) {
                 $modalInstance.close();
                 sitesService.showLoaderProperty().setProperty(false);
                 })
                 .error(function () {
                 //$scope.sites = null;
                 });

            }

            $scope.ok = function () {
                sitesService.showLoaderProperty().setProperty(true);
                $scope.confirmationSubmitDisabled = true;
                removeSiteSitesModal(siteToRemove);
            };

            $scope.cancel = function () {
                $scope.confirmationSubmitDisabled = false;
                $modalInstance.dismiss('cancel');
            };

        }

    ]);

    app.controller('ErrorSiteCtrl', [
        '$scope', '$state', 'sitesService', '$modalInstance',
        function ($scope, $state, sitesService, $modalInstance) {

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }

    ]);

    app.controller('ErrorCreateSiteCtrl', [
        '$scope', '$state', 'sitesService', '$modalInstance', 'errorToShow',
        function ($scope, $state, sitesService, $modalInstance, errorToShow) {

            $scope.error = errorToShow;

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }

    ]);

    app.controller('SiteCtrl', [
        '$scope', '$state', 'sitesService', '$timeout', '$window', '$uibModal', '$translate',
        function ($scope, $state, sitesService,$timeout, $window, $uibModal, $translate) {

            // View models
            $scope.site = {};
            $scope.blueprints = [];
            $scope.isValid = false;
            $scope.isCollapsed = true;
            $scope.isPushChecked = false;
            $scope.isRemoteGit = false;

            function getBlueprints() {
                sitesService.getAvailableBlueprints().success(function (data) {
                    $scope.blueprints = data;
                    $scope.site = { siteId: '', siteName: '', description: '', blueprint: $scope.blueprints[0], search : "ElasticSearch"};
                }).error(function () {
                    $scope.blueprints = [];
                });
            };

            getBlueprints();

            // View methods
            $scope.percent = percent;
            $scope.select = select;
            $scope.create = create;
            $scope.setSiteId = setSiteId;
            $scope.isValidSite = isValidSite;

            $scope.$watch('site', getSite);

            function setSiteId() {
                if ($scope.site.siteName != undefined){
                    $scope.site.siteId = $scope.site.siteName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                }else{
                    $scope.site.siteId = '';
                }
                isValidSite();
            }

            function percent(data) {
                (!data) && (data = {});
                return Math.ceil((data.used * 100) / (data.total));
            }

            function select($event) {
                $event.target.select();
            }

            function getSite() {

                var siteId = $state.params.siteId;

                if (!$scope.sites) {
                    return;
                }

                for (var i = 0,
                         sites = $scope.sites,
                         site = sites[i],
                         l = sites.length;
                     i < l;
                     site = sites[++i]) {
                    if ((site.siteId + '') === (siteId + '')) {
                        $scope.site = site;
                        break;
                    }

                }
            }

            function isValidSite() {
                if($scope.site.siteId) {
                    $scope.site.siteId = $scope.site.siteId.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
                    sitesService.exists({
                        site: $scope.site.siteId
                    }).success(function (data) {
                        $scope.isValid = data.exists;

                    });
                }
            }

            function create() {
                $scope.modalInstance = null;
                $scope.createModalInstance = null;
                $scope.error = "";
                $scope.adminModal.close();

                $scope.createModalInstance = $uibModal.open({
                    templateUrl: 'creatingSiteConfirmation.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });

                var params = {site_id: $scope.site.siteId, description: $scope.site.description};

                //$scope.site.isRemoteGit
                if($scope.site.isRemoteGit){
                    if($scope.site.sandbox_branch){
                        params.sandbox_branch = $scope.site.sandbox_branch;
                    }
                    params.use_remote = $scope.site.isRemoteGit;
                    params.remote_name = $scope.site.name;
                    params.remote_url = $scope.site.url;
                    if($scope.site.remote_branch){
                        params.remote_branch = $scope.site.remote_branch;
                    }
                    params.single_branch = false;
                    params.authentication_type = !$scope.site.authentication ? "none" : $scope.site.authentication;
                    if($scope.site.authentication == "basic"){
                        params.remote_username = $scope.site.username;
                        params.remote_password = $scope.site.password;
                    }
                    if($scope.site.authentication == "token"){
                        if($scope.site.username){
                            params.remote_username = $scope.site.username;
                        }
                        params.remote_token = $scope.site.token;
                    }
                    if($scope.site.authentication == "key"){
                        params.remote_private_key = $scope.site.key;
                    }
                }else{
                    params.blueprint = $scope.site.blueprint;
                    if($scope.site.push_site){
                        if($scope.site.push_sandbox_branch){
                            params.sandbox_branch = $scope.site.push_sandbox_branch;
                        }
                        params.use_remote = $scope.site.push_site;
                        params.remote_name = $scope.site.push_name;
                        params.remote_url = $scope.site.push_url;
                        if($scope.site.push_remote_branch){
                            params.remote_branch = $scope.site.push_remote_branch;
                        }
                        params.single_branch = false;
                        params.authentication_type = !$scope.site.push_authentication ? "none" : $scope.site.push_authentication;
                        if($scope.site.push_authentication == "basic"){
                            params.remote_username = $scope.site.push_username;
                            params.remote_password = $scope.site.push_password;
                        }
                        if($scope.site.push_authentication == "token"){
                            if($scope.site.username){
                                params.remote_username = $scope.site.push_username;
                            }
                            params.remote_token = $scope.site.push_token;
                        }
                        if($scope.site.push_authentication == "key"){
                            params.remote_private_key = $scope.site.push_key;
                        }
                    }

                }
                params.create_option = $scope.site.push_site ? "push" : "clone";

                sitesService.create(params)
                    .success(function (data) {
                        $timeout(function () {
                            sitesService.editSite($scope.site);
                            $scope.createModalInstance.close();
                        }, 0, false);
                    })
                    .error(function (data, error) {

                        if(error == 401){
                            $state.go("login");
                            $scope.createModalInstance.close();
                        }else{
                            $scope.createModalInstance.close();
                            $scope.error = data.message;
                            $scope.modalInstance = $uibModal.open({
                                templateUrl: "createSiteError.html",
                                backdrop: "static",
                                keyboard: false,
                                size: "md",
                                controller: "ErrorCreateSiteCtrl",
                                resolve: {
                                    errorToShow: function () {
                                        return $scope.error;
                                    }
                                }
                            });
                        }
                    });
            }

            //New Create Site

            //Model
            $scope.previousStep = [];
            $scope.currentStep = 1;
            $scope.steps = [
                {
                    step: 1,
                    name: $translate.instant('dashboard.sites.create.CHOOSE_BLUEPRINT'),
                    template: "createSitesBlueprint"
                },
                {
                    step: 2,
                    name: $translate.instant('dashboard.sites.create.BASIC_INFORMATION') ,
                    template: "createSitesBasicInfo"
                },
                {
                    step: 3,
                    name: $translate.instant('dashboard.sites.create.BASIC_DEVELOPER_INFORMATION'),
                    template: "createSitesBasicDevInfo"
                },
                {
                    step: 4,
                    name: $translate.instant('dashboard.sites.create.ADITIONAL_DEVELOPER_OPTIONS'),
                    template: "createSitesAditionalDevOptions"
                },
                {
                    step: 5,
                    name: $translate.instant('dashboard.sites.create.REVIEW_CREATE'),
                    template: "createSitesReviewCreate"
                }
            ];

            //Functions
            $scope.gotoStep = function(newStep, isPreviosBtn) {
                for(var i=0; i <= $scope.previousStep.length ; i++ ){
                    if($scope.previousStep[i] >= newStep){
                        $scope.previousStep.splice(i, 1);
                        i = -1;
                    }
                }
                if(!isPreviosBtn){
                    $scope.previousStep.push($scope.currentStep);
                }
                $scope.currentStep = newStep;
                if(newStep == 2){
                    $timeout(function () {
                        $('#siteId')[0].focus();
                    });
                }
            }

            $scope.getStepTemplate = function(){
                for (var i = 0; i < $scope.steps.length; i++) {
                    if ($scope.currentStep == $scope.steps[i].step) {
                        return $scope.steps[i].template;
                    }
                }
            }

            $scope.gotoPreviousStep = function(){
                var previousStep = $scope.previousStep.slice(-1);
                $scope.previousStep.pop();
                $scope.gotoStep(previousStep, true);
            }

            $scope.removeHide = function() {

                $timeout(function () {
                    $('#wizard-content-container').removeClass('hide');
                }, 300, false);

            }

            $scope.flexSilderInit = function(flexslider, carousel) {
                $timeout(function () {
                    $('#'+flexslider).flexslider({
                        animation: "slide",
                        controlNav: true
                    });
                });
            }

            // END NEW Create Site

        }
    ]);

    app.controller('LoginCtrl', [
        '$rootScope', '$scope', '$state', 'authService', '$timeout', '$cookies', 'sitesService', '$translate',
        function ($rootScope, $scope, $state, authService, $timeout, $cookies, sitesService, $translate) {

            var credentials = {};
            $scope.langSelected = '';
            $rootScope.isFooter = false;

            function login() {

                authService.login(credentials)
                    .then(function success(data) {
                        if (data.type === 'failure') {
                            $scope.error = data;
                        }  else if (data.error) {
                            $scope.error = data.error;
                        } else {
                            hideModalForm();
                            $state.go('home.globalMenu');
                            // set max-age of language cookie to one year
                            sitesService.setCookie('crafterStudioLanguage', $scope.langSelected, 31536000);
                        }
                    }, function error(response){
                        $scope.error = {};

                        if(response.status == 401){
                            $scope.error.message = $translate.instant('dashboard.login.USER_PASSWORD_INVALID');
                        }else{
                            $scope.error.message = $translate.instant('dashboard.login.LOGIN_ERROR');
                        }

                    });

            }

            function getModalEl() {
                return document.getElementById('loginView').parentNode.parentNode.parentNode;
            }

            function getModalBackdrop() {
                return document.getElementsByClassName('modal-backdrop')[0];
            }

            function showModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).addClass('in');
            }

            function hideModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).removeClass('in');
            }

            function hideModalForm() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).css('opacity', 0);
            }

            function removeHiddenClass(){
                var modalBackdrop = getModalBackdrop();
                angular.element(modalBackdrop).removeClass('hidden');
            }

            $scope.error = null;
            $scope.credentials = credentials;

            $scope.login = login;

            $scope.$on('$stateChangeSuccess', function() {
                if ($state.current.name === 'login') {
                    showModal();
                } else if ($state.current.name === 'login.recover') {
                    hideModal();
                }
            });

            $scope.$on('$viewContentLoaded', function() {
                if ($state.current.name === 'login.recover') {
                    $timeout(hideModal, 50);
                }
                removeHiddenClass();
                //console.log(angular.element(document.querySelector('#language')));
            });

            $scope.languagesAvailable = [];

            sitesService.getLanguages($scope);

            authService.getLoginLogo().then(
                function successCallback(response) {
                    $scope.crafterLogo = authService.getLoginUrl();
                }, function errorCallback(response) {
                    $scope.crafterLogo = "/studio/static-assets/images/crafter_studio_360.png";
                }
            );

            $scope.selectAction = function(optSelected) {
                $scope.langSelected = optSelected;
                $translate.use($scope.langSelected);

            };

        }
    ]);

    app.controller('RecoverCtrl', [
        '$scope', '$state', 'authService', '$translate',
        function ($scope, $state, authService, $translate) {

            var credentials = $scope.credentials = {};

            $scope.forgotPassword = function recover() {

                //disable submit button and add spinner
                $scope.recoverProcessing = true;

                authService.forgotPassword(credentials.username).success(function(data) {
                    if(data.message === 'OK') {
                        $scope.successMessage = $translate.instant('dashboard.login.EMAIL_CONFIRMATION');
                        $scope.recoverSuccess = true;
                    }

                    $scope.recoverProcessing = false;
                }).error(function(error, status) {
                    if(status == 500) {
                        var errorMessage = error.message + " - " + $translate.instant('dashboard.login.RECOVER_ERROR');
                        $scope.error = errorMessage;
                    }else{
                        $scope.error = error.message;
                    }

                    $scope.recoverProcessing = false;
                });
            };

        }
    ]);

    app.controller('ResetCtrl', [
        '$scope', '$state', '$location', 'authService', '$timeout', '$translate',
        function ($scope, $state, $location, authService, $timeout, $translate) {

            var successDelay = 2500;
            $scope.user = {};
            $scope.passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

            authService.getLoginLogo().then(
                function successCallback(response) {
                    $scope.crafterLogo = authService.getLoginUrl();
                }, function errorCallback(response) {
                    $scope.crafterLogo = "/studio/static-assets/images/crafter_studio_360.png";
                }
            );

            authService.validateToken({
                'token': $location.search().token,
            }).then(function(data){
                $scope.validToken = true;

                $scope.setPassword = function() {
                    authService.setPassword({
                        'token': $location.search().token,
                        'new': $scope.user.password
                    }).success(function(data) {
                        $scope.successMessage = $translate.instant('dashboard.login.PASSWORD_UPDATED');

                        $timeout(function() {
                            $state.go('login');
                        }, successDelay);
                    }).error(function(error){
                        $scope.error = error.status;
                    });
                };
            },function(error){
                $scope.validToken = false;
                //console.log(error.message);
            });

        }
    ]);

    app.controller('PreviewCtrl', [
        '$scope', '$state', '$window', '$sce',
        function ($scope, $state, $window, $sce) {

            function getIFrame(getContentWindow) {
                var el = $window.document.getElementById('studioIFrame');
                return (getContentWindow) ? el.contentWindow : el;
            }

            function sendMessage() {

                var message = data.message;
                var popup = getIFrame(true);

                popup.postMessage(message, url);

            }

            function receiveMessage(event) {

                // checking this here is not secure anyway and origin needs to be dynamic, not hardcoded
                //if (event.origin !== 'http://HOST:PORT') {
                //    return;
                //}

                //var frame = event.source;
                //var message = event.data;

                $scope.$apply(function () {
                    $scope.status = event.data;
                });

            }

            function reloadIFrame() {
                getIFrame(true).location.reload();
            }

            var data = {};
            var url = $state.params.url;

            $scope.data = data;
            $scope.url = $sce.trustAsResourceUrl(url);
            $scope.status = '';

            $scope.sendMessage = sendMessage;
            $scope.reloadIFrame = reloadIFrame;

            $window.addEventListener('message', receiveMessage, false);

        }
    ]);

    app.directive("compareTo", function() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    });

    app.directive('onlyDigits', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ctrl) {
                function inputValue(val) {
                    if (val) {
                        if(!val.replace){
                            val = val.toString();
                        }
                        var digits = val.replace(/[^0-9]/g, '');

                        if (digits !== val) {
                            ctrl.$setViewValue(digits);
                            ctrl.$render();
                        }
                        return parseInt(digits,10);
                    }
                    return undefined;
                }
                ctrl.$parsers.push(inputValue);
            }
        };
    });

    app.directive('focusMe', function ($timeout) {
        return {
            link: function (scope, element, attr) {
                attr.$observe('focusMe', function (value) {
                    if (value === "true") {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    });

    app.filter('nospace', function () {
        return function (value) {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    });

})(angular);
