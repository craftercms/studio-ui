(function (angular) {
    'use strict';

    var app = angular.module('studio', [
        'ngCookies',
        'ui.router',
        'ui.bootstrap',
        'smart-table',
        'ngFileUpload',
        'pascalprecht.translate',
        'angularUtils.directives.dirPagination',
        'ngTagsInput'
    ]);

    app.run([
        '$rootScope', '$state', '$stateParams', 'authService', 'sitesService', 'Constants',
        function ($rootScope, $state, $stateParams, authService, sitesService, Constants) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.imagesDirectory = Constants.PATH_IMG;

            $rootScope.$on('$stateChangeStart', function (event, toState) {

                if (toState.name.indexOf('login') === -1 && !authService.isAuthenticated()) {

                    if (toState.name.indexOf('reset') === -1) {
                        event.preventDefault();
                        $state.go('login');
                    }
                }

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
                                    $state.go('home.sites');
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
                .otherwise('/sites');

            $stateProvider
                .state('home', {
                    url: '/',
                    abstract: true,
                    templateUrl: '/studio/static-assets/ng-views/layout.html',
                    controller: 'AppCtrl'
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
                .state('login', {
                    url: '/login',
                    onEnter: [
                        '$rootScope', '$state', '$modal',
                        function ($rootScope, $state, $modal) {

                            $rootScope.loginModal = $modal.open({
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
                        '$rootScope', '$state', '$modal',
                        function ($rootScope, $state, $modal) {

                            $rootScope.recoverModal = $modal.open({
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
                        '$rootScope', '$state', '$modal',
                        function ($rootScope, $state, $modal) {

                            $rootScope.resetModal = $modal.open({
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
        SERVICE: '/studio/api/1/services/api/1/'
    });

    app.service('authService', [
        '$rootScope', '$http', '$document', 'Constants',
        function ($rootScope, $http, $document, Constants) {

            var user = null;
            var script = $document[0].getElementById('user');

            if (script) {
                script = angular.element(script);
                user = JSON.parse(script.html());
            }

            this.isAuthenticated = function () {
                return !!user;
            };

            this.login = function (data) {
                return $http({
                    data: data,
                    method: 'POST',
                    url: api('login'),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj) {
                            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                        }
                        return str.join('&');
                    }
                }).then(function (data) {
                    if (data.data.type === 'success') {

                        user = data.data.user;
                        $rootScope.$broadcast(Constants.AUTH_SUCCESS, user);

                    }
                    return data.data;
                });
            };

            this.logout = function () {
                $http.post(api('logout'), null);
                user = null;
            };

            this.getUser = function () {
                return user;
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
                return $http.post(api('validate-token'), data);
            };

            this.getLoginLogo = function() {
                return $http.get(api('get-ui-resource-override', true), {
                    params: { resource : 'logo.jpg' }
                })
            };

            this.getLoginUrl = function() {
                return api('get-ui-resource-override', true) + '?resource=logo.jpg';
            };

            function api(action, server) {
                var api = "user/";

                if(server){
                    api = "server/";
                }

                return Constants.SERVICE + api + action + '.json';
            }

            return this;

        }
    ]);

    app.service('sitesService', [
        '$http', 'Constants', '$cookies', '$timeout', '$window', '$translate',
        function ($http, Constants, $cookies, $timeout, $window, $translate) {

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

            this.setCookie = function(cookieGenName, value){
                //$cookies[cookieName] = site.siteId;
                var domainVal;
                domainVal = (document.location.hostname.indexOf(".") > -1) ? "domain=" + document.location.hostname : "";
                document.cookie =
                    [cookieGenName, "=", value, "; path=/; " + domainVal].join("");
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
                return $http.get(api('get-available-blueprints'));
            };

            this.getPermissions = function(siteId, path, user){
                return $http.get(security('get-user-permissions'), {
                    params: { site: siteId,  path: path, user: user}
                });
            };

            this.getAvailableLanguages = function(){
                return $http.get(server('get-available-languages'));
            };

            this.getLanguages = function(scope, setLang) {
                this.getAvailableLanguages()
                    .success(function (data) {
                        var cookieLang = $cookies['crafterStudioLanguage'];
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

            return this;

        }
    ]);

    app.controller('AppCtrl', [
        '$rootScope', '$scope', '$state', 'authService', 'Constants', 'sitesService', '$cookies', '$modal', '$translate', '$timeout', '$location',
        function ($rootScope, $scope, $state, authService, Constants, sitesService, $cookies, $modal, $translate, $timeout, $location) {

            $scope.langSelected = '';
            $scope.modalInstance = '';
            $scope.authenticated = authService.isAuthenticated();
            $scope.helpUrl = 'http://docs.craftercms.org/en/3.0/';
            $scope.isIframeClass = $location.search().iframe ? 'iframe' : '';

            function logout() {
                authService.logout();
                $state.go('login');
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

                                $rootScope.modalInstance = $modal.open({
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
                                    $scope.data = {};
                                }, 1500, false);
                            }
                        }, function(error){
                            $scope.error = error.data.status;
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

                $rootScope.modalInstance = $modal.open({
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
                sitesService.setCookie('crafterStudioLanguage', $scope.langSelected);

            };

            $scope.cancel = function () {
                $rootScope.modalInstance.close();
            };

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

        }
    ]);

    app.controller('SitesCtrl', [
        '$scope', '$state', '$location', 'sitesService', 'authService', '$modal',

        function ($scope, $state, $location, sitesService, authService, $modal) {

            $scope.sites = null;

            $scope.editSite = sitesService.editSite;

            $scope.goToDashboard = sitesService.goToDashboard;

            $scope.createSites = false;

            $scope.user = authService.getUser();

            $scope.siteValidation = $location.$$search.siteValidation;

            $scope.sitesPag = {
                sitesPerPage: 15
            }

            $scope.totalSites = 0;
            $scope.defaultDelay = 500;

            $scope.pageChanged = function(newPage) {
                getResultsPage(newPage);
            };

            function getSites (params) {
                sitesService.getSites(params)
                    .success(function (data) {
                        $scope.totalSites = data.total;
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

                var params = {
                    username: $scope.user.username
                };

                if($scope.totalSites && $scope.totalSites > 0) {
                    var start = (pageNumber - 1) * $scope.sitesPag.sitesPerPage,
                        end = start + $scope.sitesPag.sitesPerPage;
                    params.start = start;
                    params.number = $scope.sitesPag.sitesPerPage;
                }else{
                    params.start = 0;
                    params.number = $scope.sitesPag.sitesPerPage;
                }

                getSites(params);
            }

            getResultsPage(1);

            $scope.removeSiteSites = function (site){

                var modalInstance = $modal.open({
                    templateUrl: 'removeConfirmation.html',
                    controller: 'RemoveSiteCtrl',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm',
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
                $scope.adminModal = $modal.open({
                    templateUrl: '/studio/static-assets/ng-views/create-site.html',
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'SiteCtrl',
                    scope: $scope
                });
            }

            if($scope.siteValidation){
                $scope.adminModal = $modal.open({
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

            function removeSiteSitesModal (site){

                sitesService.removeSite(site)
                 .success(function (data) {
                 $modalInstance.close();
                 })
                 .error(function () {
                 //$scope.sites = null;
                 });

            }

            $scope.ok = function () {
                removeSiteSitesModal(siteToRemove);
            };

            $scope.cancel = function () {
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
        '$scope', '$state', 'sitesService', '$timeout', '$window', '$modal',
        function ($scope, $state, sitesService,$timeout, $window, $modal) {

            // View models
            $scope.site = null;
            $scope.blueprints = [];
            $scope.isValid = false;

            function getBlueprints() {
                sitesService.getAvailableBlueprints().success(function (data) {
                    $scope.blueprints = data;
                    $scope.site = { siteId: '', siteName: '', description: '', blueprint: $scope.blueprints[0] };
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
                    if ((site.id + '') === (siteId + '')) {
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

                $scope.createModalInstance = $modal.open({
                    templateUrl: 'creatingSiteConfirmation.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });

                sitesService.create({
                    site_id: $scope.site.siteId,
                    description: $scope.site.description,
                    blueprint: $scope.site.blueprint.id
                })
                    .success(function (data) {
                        $timeout(function () {
                            sitesService.editSite($scope.site);
                            $scope.createModalInstance.close();
                        }, 3000, false);
                    })
                    .error(function (data) {
                        $scope.createModalInstance.close();
                        $scope.error = data.message;
                        $scope.modalInstance = $modal.open({
                            templateUrl: 'createSiteError.html',
                            backdrop: 'static',
                            keyboard: false,
                            size: 'md',
                            controller: 'ErrorCreateSiteCtrl',
                            resolve: {
                                errorToShow: function () {
                                return $scope.error;
                            }
                        }
                        });
                    });
            }
        }
    ]);

    app.controller('LoginCtrl', [
        '$scope', '$state', 'authService', '$timeout', '$cookies', 'sitesService', '$translate',
        function ($scope, $state, authService, $timeout, $cookies, sitesService, $translate) {

            var credentials = {};
            $scope.langSelected = '';

            function login() {

                authService.login(credentials)
                    .then(function (data) {
                        if (data.type === 'failure') {
                            $scope.error = data;
                        }  else if (data.error) {
                            $scope.error = data.error;
                        } else {
                            $state.go('home.sites');
                            sitesService.setCookie('crafterStudioLanguage', $scope.langSelected);
                        }
                    });

            }

            function getModalEl() {
                return document.getElementById('loginView').parentNode.parentNode.parentNode;
            }

            function showModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).addClass('in');
            }

            function hideModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).removeClass('in');
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
        '$scope', '$state', '$location', 'authService', '$modal', '$timeout', '$translate',
        function ($scope, $state, $location, authService, $modal, $timeout, $translate) {

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


})(angular);
