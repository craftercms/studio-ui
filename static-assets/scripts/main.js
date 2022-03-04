/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
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
    'ngAnimate',
    'ngSanitize'
  ]);

  let //
    i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    passwordRequirementMessages = i18n.messages.passwordRequirementMessages,
    globalConfigMessages = i18n.messages.globalConfigMessages,
    words = i18n.messages.words,
    profileSettingsMessages = i18n.messages.profileSettingsMessages,
    globalMenuMessages = i18n.messages.globalMenuMessages;

  app.run([
    '$rootScope',
    '$state',
    '$stateParams',
    'authService',
    'sitesService',
    'Constants',
    function ($rootScope, $state, $stateParams, authService, sitesService, Constants) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      $rootScope.imagesDirectory = Constants.PATH_IMG;

      $rootScope.$on('$stateChangeStart', function (event, toState) {
        authService.validateSession().then(function (response) {
          if (response.data && response.data.active) {
            var user = authService.getUser() || {};
            if (user.authenticationType === Constants.HEADERS) {
              $state.go('home.globalMenu');
            }
          } else {
            authService.removeUser();
            window.location.reload();
          }
        });

        if (toState.name.indexOf('users') !== -1) {
          var user = authService.getUser();

          if (user && user.username) {
            var createSitePermissions = false;
            sitesService.getPermissions('', '/', user.username || user).success(function (data) {
              for (var i = 0; i < data.permissions.length; i++) {
                if (data.permissions[i] == 'create-site') {
                  createSitePermissions = true;
                }
              }

              if (!createSitePermissions) {
                $state.go('home.globalMenu');
              }
            });
          }
        }

        function setDocTitle(globalMenuData, toState) {
          let docTitle;

          // check if state is a globalMenu Item
          const globalMenuItem = globalMenuData.find((o) => o.id === toState.name);

          // if globalMenuItem exists => check if globalMenuMessages has the id, or use the label as docTitle
          if (globalMenuItem) {
            docTitle = globalMenuMessages[globalMenuItem.id]
              ? `${formatMessage(globalMenuMessages[globalMenuItem.id])} - Crafter CMS`
              : `${globalMenuItem.label} - Crafter CMS`;
          } else {
            // if not a globalMenuItem, use state id, if not in globalMenuMessages => just 'Crafter CMS'
            docTitle = globalMenuMessages[toState.name]
              ? `${formatMessage(globalMenuMessages[toState.name])} - Crafter CMS`
              : 'Crafter CMS';
          }

          document.title = docTitle;
        }

        if ($rootScope.globalMenuData) {
          setDocTitle($rootScope.globalMenuData, toState);
        } else {
          sitesService.getGlobalMenu().success(function (data) {
            $rootScope.globalMenuData = data.menuItems;
            setDocTitle(data.menuItems, toState);
          });
        }
      });

      sitesService.getLanguages($rootScope, true);
    }
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$translateProvider',
    function ($stateProvider, $urlRouterProvider, $translateProvider) {
      $urlRouterProvider.otherwise('/globalMenu');

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
              controller: 'LogConsoleStudioCtrl'
            }
          }
        })
        .state('home.globalMenu.globalConfig', {
          url: '/global-config',
          views: {
            contentTab: {
              templateUrl: '/studio/static-assets/ng-views/global-config.html',
              controller: 'GlobalConfigCtrl'
            }
          }
        })
        .state('home.globalMenu.encryptionTool', {
          url: '/encryption-tool',
          views: {
            contentTab: {
              templateUrl: '/studio/static-assets/ng-views/encrypt.html',
              controller: 'EncryptionToolCtrl'
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
        .state('home.log', {
          url: 'log',
          views: {
            content: {
              templateUrl: '/studio/static-assets/ng-views/log-console.html',
              controller: 'LogConsolePreviewCtrl'
            }
          }
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
    SERVICE2: '/studio/api/2/',
    STUDIO_PATH: '/studio',
    MONITORING_PATH: 'monitoring/',
    SHOW_LOADER: 'show-loader',
    BULK_ENVIRONMENT: 'Live',
    HEADERS: 'headers',
    AUTH_HEADERS: 'AUTH_HEADERS',
    SAML: 'SAML',
    AUDIT_TIMEZONE_COOKIE: 'crafterStudioAuditTimezone',
    AUDIT_SYSTEM: 'Studio Root',
    CRAFTER_LOGO: '/studio/static-assets/images/logo.svg'
  });

  app.service('authService', [
    '$rootScope',
    '$http',
    '$document',
    'Constants',
    function ($rootScope, $http, $document, Constants) {
      var user = null;
      var script = $document[0].getElementById('user');
      let unmountAuthMonitor;

      if (script) {
        script = angular.element(script);
        user = JSON.parse(script.html());
      }

      if (user && user.username !== '') {
        authLoop();
      }

      this.isAuthenticated = function () {
        return !!user;
      };

      this.logout = function () {
        return $http.post(security('logout'), null).then(() => {
          unmountAuthMonitor && unmountAuthMonitor();
          user = null;
        });
      };

      this.getSSOLogoutInfo = function () {
        return $http.get(userActions('/me/logout/sso/url'));
      };

      this.getUser = function () {
        return user;
      };

      this.getCurrentUserData = function (action) {
        if (this.getUser()) {
          return $http.get(userActions('/' + action));
        }
      };

      this.removeUser = function () {};

      this.getStudioInfo = function () {
        return $http.get(api2('version', Constants.MONITORING_PATH));
      };

      this.forgotPassword = function (username) {
        return $http.get(userActions('/forgot_password'), {
          params: { username: username }
        });
      };

      this.recoverPassword = function (data) {
        return $http.post(userActions(user + '/reset_password'), data);
      };

      this.setPassword = function (data) {
        return $http.post(userActions('/set_password'), data);
      };

      this.changePassword = function (data) {
        var requestData = { username: data.username, current: data.current, new: data.new };
        return $http.post(userActions('/me/change_password'), requestData);
      };

      this.validateToken = function (data) {
        return $http.get(api('validate-token'), {
          params: { token: data.token }
        });
      };

      this.validateSession = function () {
        return $http.get(security('validate-session'));
      };

      function api(action, server, monitor) {
        var api = 'user/';

        if (server) {
          api = 'server/';
        }

        if (monitor) {
          api = 'monitor/';
        }

        return Constants.SERVICE + api + action + '.json';
      }

      function api2(action, path) {
        return Constants.SERVICE2 + path + action;
      }

      function security(action) {
        var api = 'security/';
        return Constants.SERVICE + api + action + '.json';
      }

      function userActions(action) {
        if (action) {
          return Constants.SERVICE2 + 'users' + action;
        } else {
          return Constants.SERVICE2 + 'users';
        }
      }

      function authLoop() {
        // Site config embeds several angular views on an iframe.
        // This is to avoid duplicate login dialogs.
        if (window.top === window) {
          const el = document.createElement('craftercms-auth-monitor');
          CrafterCMSNext.render(el, 'AuthMonitor').then(({ unmount }) => {
            unmountAuthMonitor = unmount;
          });
        }
      }

      return this;
    }
  ]);

  app.service('sitesService', [
    '$rootScope',
    '$http',
    'Constants',
    '$cookies',
    '$timeout',
    '$window',
    '$translate',
    function ($rootScope, $http, Constants, $cookies, $timeout, $window, $translate) {
      var me = this;

      this.getSites = function (params) {
        return $http.get(api('get-per-user'), {
          params: params
        });
      };

      this.getSite = function (id) {
        return $http.get(json('get-site'), {
          params: { siteId: id }
        });
      };

      this.getSitesPerUser = function (id, params) {
        return $http.get(userActions(id + '/sites'), {
          params: params
        });
      };

      this.setCookie = function (cookieGenName, value, maxAge) {
        var domainVal = document.location.hostname.indexOf('.') > -1 ? 'domain=' + document.location.hostname : '';
        if (maxAge != null) {
          document.cookie = [cookieGenName, '=', value, '; path=/; ', domainVal, '; max-age=', maxAge].join('');
        } else {
          document.cookie = [cookieGenName, '=', value, '; path=/; ', domainVal].join('');
        }
      };

      this.editSite = function (site) {
        me.setCookie('crafterSite', site.siteId);
        $timeout(
          function () {
            $window.location.href = '/studio/preview/#/?page=/&site=' + site.siteId;
          },
          0,
          false
        );
      };

      this.goToDashboard = function (site) {
        me.setCookie('crafterSite', site.siteId);
        $timeout(
          function () {
            $window.location.href = '/studio/site-dashboard';
          },
          0,
          false
        );
      };

      this.create = function (site) {
        return $http.post(api('create'), site);
      };

      this.exists = function (site) {
        return $http.get(api('exists'), {
          params: { site: site.site }
        });
      };

      this.removeSite = function (site) {
        return $http.post(api('delete-site'), {
          siteId: site.siteId
        });
      };

      this.getAvailableBlueprints = function () {
        return $http.get(sitesApi('available_blueprints'));
      };

      this.getPermissions = function (siteId, path, user) {
        return $http.get(security('get-user-permissions'), {
          params: { site: siteId, path: path }
        });
      };

      this.getAvailableLanguages = function () {
        return $http.get(server('get-available-languages'));
      };

      this.getDocumentCookie = function (name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
      };

      this.getLanguages = function (scope, setLang) {
        var me = this;
        this.getAvailableLanguages()
          .success(function (data) {
            var userCookieLang = scope.user
                ? localStorage.getItem(scope.user.username + '_crafterStudioLanguage')
                : null,
              cookieLang = userCookieLang ? userCookieLang : localStorage.getItem('crafterStudioLanguage');

            if (cookieLang) {
              for (var i = 0; i < data.length; i++) {
                if (data[i].id == cookieLang) {
                  scope.langSelect = data[i].id;
                  scope.langSelected = data[i].id;
                }
              }
            } else {
              scope.langSelect = data[0].id;
              scope.langSelected = data[0].id;
            }
            scope.languagesAvailable = data;

            if (setLang) {
              $translate.use(cookieLang);
            }
          })
          .error(function () {
            scope.languagesAvailable = [];
          });
      };

      this.showLoaderProperty = function () {
        var showLoader = false;

        return {
          getProperty: function () {
            return showLoader;
          },
          setProperty: function (value) {
            showLoader = value;
            $rootScope.$broadcast(Constants.SHOW_LOADER, value);
          }
        };
      };

      this.getGlobalMenu = function () {
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
        return Constants.SERVICE2 + 'ui/views/' + action + '.json';
      }

      function sitesApi(action) {
        return Constants.SERVICE2 + 'sites/' + action + '.json';
      }

      function userActions(action, params) {
        if (params) {
          return Constants.SERVICE2 + 'users/' + action + params;
        } else {
          return Constants.SERVICE2 + 'users/' + action;
        }
      }

      return this;
    }
  ]);

  app.service('passwordRequirements', [
    function () {
      var me = this,
        generalRegExp = passwordRequirementsRegex, // Global declared in entry.ftl, comes from FTL context.
        generalRegExpWithoutGroups = generalRegExp.replace(/\?<(.*?)>/g, ''),
        captureGroups = generalRegExp.match(/\(\?<.*?>.*?\)/g);

      const allowedChars = (generalRegExp.match(/\(\?<hasSpecialChars>(.*)\[(.*?)]\)/) || ['', '', ''])[2];

      const min = ((generalRegExp.match(/\(\?<minLength>(.*){(.*?)}\)/) || [''])[0].match(/{(.*?)}/) || [
        '',
        ''
      ])[1].split(',')[0];

      const max = ((generalRegExp.match(/\(\?<maxLength>(.*){(.*?)}\)/) || [''])[0].match(/{(.*?)}/) || [
        '',
        ''
      ])[1].split(',')[1];

      const minLength = ((generalRegExp.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(/{(.*?)}/) || [
        '',
        ''
      ])[1].split(',')[0];

      const maxLength = ((generalRegExp.match(/\(\?<minMaxLength>(.*){(.*?)}\)/) || [''])[0].match(/{(.*?)}/) || [
        '',
        ''
      ])[1].split(',')[1];

      const messages = {
        hasNumbers: formatMessage(passwordRequirementMessages.hasNumbers),
        hasLowercase: formatMessage(passwordRequirementMessages.hasLowercase),
        hasUppercase: formatMessage(passwordRequirementMessages.hasUppercase),
        hasSpecialChars: formatMessage(passwordRequirementMessages.hasSpecialChars, {
          chars: allowedChars ? `(${allowedChars})` : ''
        }),
        noSpaces: formatMessage(passwordRequirementMessages.noSpaces),
        minLength: formatMessage(passwordRequirementMessages.minLength, { min }),
        maxLength: formatMessage(passwordRequirementMessages.maxLength, { max }),
        minMaxLength: formatMessage(passwordRequirementMessages.minMaxLength, {
          minLength,
          maxLength
        }),
        passwordValidation: formatMessage(passwordRequirementMessages.passwordValidation),
        validPassword: formatMessage(passwordRequirementMessages.validPassword),
        invalidPassword: formatMessage(passwordRequirementMessages.invalidPassword)
      };

      this.init = function (scope, isValid, elt, placement) {
        if (generalRegExp) {
          try {
            let isRegExpValid = new RegExp(generalRegExp);
            if (isRegExpValid && captureGroups && captureGroups.length > 0) {
              this.runValidation(scope, isValid, elt, 'groupsSupported', placement);
            } else {
              this.runValidation(scope, isValid, elt, 'noGroups', placement);
            }
          } catch (error) {
            try {
              let isRegExpValid = new RegExp(generalRegExpWithoutGroups);
              if (isRegExpValid && captureGroups && captureGroups.length > 0) {
                this.runValidation(scope, isValid, elt, 'groupsNotSupported', placement);
              } else {
                this.runValidation(scope, isValid, elt, 'noGroups', placement);
              }
            } catch (error) {
              console.warn('Defaulting password validation to server due to issues in RegExp compilation.');
            }
          }
        }
      };

      this.creatingPassValHTML = function (content, templateType) {
        var html = '<div class="password-popover">';
        var validPass = false;
        var isGeneralRegExpWithoutGroupsValid = content ? content.match(generalRegExpWithoutGroups) : false;
        if (templateType !== 'noGroups') {
          if (templateType === 'groupsNotSupported') {
            html += '<ul class="password-popover--list password-popover--static">';
          } else {
            html += '<ul class="password-popover--list" >';
          }
          captureGroups.forEach((captureGroup) => {
            let captureGroupName = captureGroup.match(/\?<(.*?)>/g);
            let captureGroupNameClean = captureGroupName[0].replace(/\?<|>/g, '');
            html += '<li class="password-popover--list--item">';
            if (templateType === 'groupsSupported') {
              let isValid;
              if (captureGroupName[0].toLowerCase().indexOf('maxlength') > 0) {
                isValid = content ? content.match(`^${captureGroup}$`) : false;
              } else {
                isValid = content ? content.match(captureGroup) : false;
              }
              if (isValid) {
                html += '<span class="password-popover--list-icon fa fa-check-circle password-popover--green"></span>';
              } else {
                html += '<span class="password-popover--list-icon fa fa-times-circle password-popover--red "></span>';
                validPass = true;
              }
            }
            html += `<span class="password-popover--list-Info">${
              messages[captureGroupNameClean] || captureGroupNameClean
            }</span>`;
            html += '</li>';
          });
          html += '</ul>';
        }
        if (templateType === 'groupsNotSupported' || templateType === 'noGroups') {
          if (isGeneralRegExpWithoutGroupsValid) {
            html +=
              '<p class="password-popover--result password-popover--green"><span class="password-popover--list-icon fa fa-check-circle"></span>' +
              messages.validPassword +
              '</p>';
          } else {
            html +=
              '<p class="password-popover--result password-popover--red"><span class="password-popover--list-icon fa fa-times-circle"></span>' +
              messages.invalidPassword +
              '</p>';
            validPass = true;
          }
        }
        html += '</div>';
        return { template: html, validPass: validPass };
      };

      this.runValidation = function (scope, isValid, elt, staticTemplate, placement) {
        $('#' + elt)
          .blur(function () {
            $(this).popover('destroy');
          })
          .keyup(function () {
            let creatingPassValHTML = me.creatingPassValHTML($(this).get(0).value, staticTemplate);
            $('.popover').find('.popover-content').html(creatingPassValHTML.template);
            scope[isValid] = creatingPassValHTML.validPass;
            scope.$apply();
          })
          .focus(function () {
            let creatingPassValHTML = me.creatingPassValHTML($(this).get(0).value, staticTemplate);
            $(this).popover({
              title:
                `<span>${messages.passwordValidation}</span>` +
                `<button type="button" class="close fa fa-times" onclick="$(this).popover('hide');"/>`,
              content: creatingPassValHTML.template,
              placement: placement ? placement : 'top',
              html: true,
              trigger: 'manual'
            });
            $(this).popover('show');
            scope[isValid] = creatingPassValHTML.validPass;
            scope.$apply();
          });
      };
    }
  ]);

  app.controller('AppCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    'authService',
    'Constants',
    'sitesService',
    '$cookies',
    '$uibModal',
    '$translate',
    '$timeout',
    '$location',
    '$window',
    'passwordRequirements',
    '$element',
    function (
      $rootScope,
      $scope,
      $state,
      authService,
      Constants,
      sitesService,
      $cookies,
      $uibModal,
      $translate,
      $timeout,
      $location,
      $window,
      passwordRequirements,
      $element
    ) {
      $scope.langSelected = '';
      $scope.modalInstance = '';
      $scope.authenticated = authService.isAuthenticated();
      $scope.helpUrl = 'javascript:alert("Please wait while product information loads.")';
      $scope.attributionHTML = '';
      $scope.isIframeClass = $location.search().iframe ? 'iframe' : '';
      $rootScope.isFooter = true;
      $scope.showLogoutLink = false;
      $scope.logoutInfo = {};
      $scope.crafterLogo = Constants.CRAFTER_LOGO;
      $scope.messages = {
        fulfillAllReqErrorMessage: formatMessage(passwordRequirementMessages.fulfillAllReqErrorMessage),
        password: formatMessage(profileSettingsMessages.password),
        currentPassword: formatMessage(profileSettingsMessages.currentPassword),
        isRequired: formatMessage(profileSettingsMessages.isRequired),
        mustMatchPreviousEntry: formatMessage(profileSettingsMessages.mustMatchPreviousEntry),
        unSavedConfirmation: formatMessage(profileSettingsMessages.unSavedConfirmation),
        unSavedConfirmationTitle: formatMessage(profileSettingsMessages.unSavedConfirmationTitle),
        yes: formatMessage(words.yes),
        no: formatMessage(words.no)
      };

      $scope.showModal = function (template, size, verticalCentered, styleClass) {
        var modalInstance = $uibModal.open({
          templateUrl: template,
          windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
          backdrop: 'static',
          keyboard: true,
          scope: $scope,
          size: size ? size : ''
        });

        return modalInstance;
      };
      $scope.hideModal = function () {
        $scope.confirmationModal.close();
      };

      if ($location.$$search.iframe) {
        $rootScope.isFooter = false;
      }

      if (authService.getUser()) {
        authService.getCurrentUserData('me').then(
          function successCallback(response) {
            $scope.externallyManaged = response.data.authenticatedUser.externallyManaged;
            $scope.showLogoutLink = !(
              response.data.authenticatedUser.authenticationType === Constants.AUTH_HEADERS ||
              response.data.authenticatedUser.authenticationType === Constants.SAML
            );
            if (!$scope.showLogoutLink) {
              authService.getSSOLogoutInfo().success(function (data) {
                var result = data.logoutUrl ? true : false;
                if (result) {
                  $scope.showLogoutLink = true;
                  $scope.logoutInfo.url = data.logoutUrl;
                }
              });
            }
          },
          function errorCallback(response) {}
        );
      }

      function logout() {
        if ($scope.showLogoutLink) {
          authService.logout().then(() => {
            if ($scope.logoutInfo.url) {
              $window.location.href = $scope.logoutInfo.url;
            } else {
              window.location.reload();
            }
          });
        }
      }

      function changePassword() {
        $scope.data.username = $scope.user.username;
        $translate.use($scope.langSelected);

        if ($scope.data.new == $scope.data.confirmation) {
          authService.changePassword($scope.data).then(
            function (data) {
              $scope.error = $scope.message = null;

              if (data.type === 'error') {
                $scope.error = data.message;
              } else if (data.error) {
                $scope.error = data.error;
              } else {
                $scope.message = data.message;
                $timeout(logout, 1500, false);
              }
            },
            function (error) {
              var errorResponse = error.data.response;
              $('#current').focus();

              if (errorResponse.code === 6003) {
                $scope.error =
                  $translate.instant('dashboard.login.PASSWORD_REQUIREMENTS_ERROR') +
                  '. ' +
                  $translate.instant('dashboard.login.PASSWORD_REQUIREMENTS_REMEDIAL');
              } else {
                $scope.error = errorResponse.message + '. ' + errorResponse.remedialAction;
              }
            }
          );
        } else {
          $scope.error = "Passwords don't match.";
        }
      }

      $scope.languagesAvailable = [];

      sitesService.getLanguages($scope);

      $scope.selectActionLanguage = function (optSelected) {
        $scope.isModified = true;
        $scope.langSelected = optSelected;
      };

      $scope.setLangCookie = function () {
        try {
          $translate.use($scope.langSelected);
          // set max-age of language cookie to one year
          // set both cookies, on login (on user) it will get last selected
          localStorage.setItem('crafterStudioLanguage', $scope.langSelected);
          localStorage.setItem($scope.user.username + '_crafterStudioLanguage', $scope.langSelected);
          $scope.isModified = false;

          let loginSuccess = new CustomEvent('setlocale', { detail: $scope.langSelected });
          document.dispatchEvent(loginSuccess);

          $element.find('.settings-view').notify(formatMessage(profileSettingsMessages.languageSaveSuccesfully), {
            position: 'top left',
            className: 'success'
          });
        } catch (err) {
          $element.find('.settings-view').notify(formatMessage(profileSettingsMessages.languageSaveFailedWarning), {
            position: 'top left',
            className: 'error'
          });
        }
      };

      $scope.cancel = function () {
        $rootScope.modalInstance.close();
      };

      $scope.loadHomeState = function () {
        var currentState = $state.current.name,
          homeState = 'home.globalMenu';

        // If current state = home, reload controller
        if (currentState.indexOf(homeState) !== -1) {
          $state.go('home.globalMenu', {}, { reload: true });
        } else {
          $state.go('home.globalMenu');
        }
      };

      $scope.user = authService.getUser();

      if ($scope.user && $scope.user.username) {
        sitesService.getPermissions('', '/', $scope.user.username || $scope.user).success(function (data) {
          for (var i = 0; i < data.permissions.length; i++) {
            if (data.permissions[i] == 'create-site') {
              $scope.createSites = true;
            }
          }
        });
      }

      $scope.data = { email: ($scope.user || { email: '' }).email };
      $scope.error = null;

      $scope.logout = logout;
      $scope.changePassword = changePassword;

      $scope.$on(Constants.AUTH_SUCCESS, function ($event, user) {
        $scope.user = user;
        $scope.data.email = $scope.user.email;
      });

      if (authService.getUser()) {
        authService.getStudioInfo().then(function (response) {
          const packageVersion = response.data.version.packageVersion;
          const simpleVersion = packageVersion.substr(0, 3);
          $scope.aboutStudio = response.data.version;
          $scope.versionNumber = `${packageVersion}-${response.data.version.packageBuild.substring(0, 6)}`;
          $scope.simpleVersion = simpleVersion;
          $scope.helpUrl = `https://docs.craftercms.org/en/${simpleVersion}/index.html`;
          $scope.attributionHTML = CrafterCMSNext.i18n.intl
            .formatMessage(CrafterCMSNext.i18n.messages.ossAttribution.attribution, {
              a: (msg) =>
                `<a href="https://docs.craftercms.org/en/${simpleVersion}/acknowledgements/index.html" target="_blank">${msg}</a>`
            })
            .join('');
        });
      }

      var isChromium = window.chrome,
        vendorName = window.navigator.vendor,
        isOpera = window.navigator.userAgent.indexOf('OPR') > -1,
        isIEedge = window.navigator.userAgent.indexOf('Edge') > -1;

      if (
        isChromium !== null &&
        isChromium !== undefined &&
        vendorName === 'Google Inc.' &&
        isOpera == false &&
        isIEedge == false
      ) {
        isChromium = true;
      } else {
        isChromium = false;
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      }

      if (!(isChromium || isFirefox)) {
        $('body').addClass('iewarning');
        $scope.ieWarning = true;
      }

      $scope.spinnerOverlay = function () {
        return $uibModal.open({
          templateUrl: 'spinnerModal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'sm',
          windowClass: 'spinner-modal centered-dialog'
        });
      };
      $scope.validPass = false;
      $scope.passwordRequirements = function () {
        passwordRequirements.init($scope, 'validPass', 'password', 'top');
      };

      $rootScope.$on('$stateChangeStart', function (event, toState) {
        if ($scope.isModified) {
          event.preventDefault();

          $scope.confirmationAction = function () {
            $scope.isModified = false;
            $state.go(toState.name);
          };

          $scope.confirmationText = $scope.messages.unSavedConfirmation;
          $scope.confirmationTitle = $scope.messages.unSavedConfirmationTitle;
          $scope.confirmationModal = $scope.showModal('confirmationModal.html', 'sm', true, 'studioMedium');
        }
      });
    }
  ]);

  app.controller('GlobalMenuCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    '$location',
    'sitesService',
    function ($rootScope, $scope, $state, $location, sitesService) {
      if ($rootScope.globalMenuData) {
        initGlobalMenu($rootScope.globalMenuData);
      } else {
        sitesService
          .getGlobalMenu()
          .success(function (data) {
            $rootScope.globalMenuData = data.menuItems;
            initGlobalMenu(data.menuItems);
          })
          .error(function (er) {
            console.log(er);
          });
      }

      function setLabels() {
        i18n = CrafterCMSNext.i18n;
        formatMessage = i18n.intl.formatMessage;
        globalMenuMessages = i18n.messages.globalMenuMessages;
        $scope.entities.forEach(function (entry, i) {
          entry.label = globalMenuMessages[entry.id] ? formatMessage(globalMenuMessages[entry.id]) : entry.label;
        });
      }

      function initGlobalMenu(data) {
        $scope.entities = data;

        i18n = CrafterCMSNext.i18n;
        formatMessage = i18n.intl.formatMessage;
        globalMenuMessages = i18n.messages.globalMenuMessages;

        if ($scope.entities.length > 1) {
          let defaultView = $scope.entities[0].id; // default view (first)
          const currentView = $state.current.name;

          $scope.entities.forEach(function (entry, i) {
            const label = globalMenuMessages[entry.id] ? formatMessage(globalMenuMessages[entry.id]) : entry.label;

            entry.label = label;

            if (currentView === entry.id) {
              // if current view is an entry of globalMenu -> set as default view
              defaultView = entry.id;
            }
          });

          $state.go(defaultView);
        } else {
          if ($scope.entities.length > 0) {
            $state.go((data[0] || data.menuItems[0]).id.replace('globalMenu.', ''));
          }
        }
      }

      document.addEventListener(
        'setlocale',
        () => {
          setLabels();
        },
        false
      );
    }
  ]);

  app.controller('SitesCtrl', [
    '$scope',
    '$state',
    '$location',
    'sitesService',
    'authService',
    '$uibModal',
    '$cookies',
    '$timeout',
    'Constants',
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
        sitesPerPage: $cookies.get('crafterStudioSitesPagination')
          ? parseInt($cookies.get('crafterStudioSitesPagination'), 10)
          : 15
      };

      $scope.totalSites = 0;
      $scope.defaultDelay = 500;

      $scope.pageChanged = function (newPage) {
        getResultsPage(newPage);
        sitesService.setCookie('crafterStudioSitesPagination', $scope.sitesPag.sitesPerPage);
      };

      function getSites(params) {
        sitesService
          .getSitesPerUser('me', params)
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
        if (authService.getUser()) {
          var params = {};

          if ($scope.totalSites && $scope.totalSites > 0) {
            var offset = (pageNumber - 1) * $scope.sitesPag.sitesPerPage,
              limit = offset + $scope.sitesPag.sitesPerPage;
            params.offset = offset;
            params.limit = $scope.sitesPag.sitesPerPage;
          } else {
            params.offset = 0;
            params.limit = $scope.sitesPag.sitesPerPage;
          }

          getSites(params);
        }
      }

      getResultsPage(1);

      $scope.removeSiteSites = function (site) {
        var modalInstance = $uibModal.open({
          templateUrl: 'removeConfirmation.html',
          controller: 'RemoveSiteCtrl',
          backdrop: 'static',
          keyboard: true,
          windowClass: 'studioMedium',
          resolve: {
            siteToRemove: function () {
              return site;
            }
          }
        });

        modalInstance.result.then(function () {
          getResultsPage(1);
        });
      };

      function addingRemoveProperty(siteId) {
        for (var j = 0; j < $scope.sites.length; j++) {
          if ($scope.sites[j].siteId == siteId) {
            $scope.sites[j].remove = true;
          }
        }
      }

      function removePermissionPerSite(siteId) {
        sitesService
          .getPermissions(siteId, '/', $scope.user.username || $scope.user)
          .success(function (data) {
            for (var i = 0; i < data.permissions.length; i++) {
              if (data.permissions[i] == 'site_delete') {
                addingRemoveProperty(siteId);
              }
            }
          })
          .error(function () {});
      }

      function isRemove() {
        for (var j = 0; j < $scope.sites.length; j++) {
          removePermissionPerSite($scope.sites[j].siteId);
        }
      }

      function createSitePermission() {
        sitesService
          .getPermissions('', '/', $scope.user.username || $scope.user)
          .success(function (data) {
            for (var i = 0; i < data.permissions.length; i++) {
              if (data.permissions[i] == 'create-site') {
                $scope.createSites = true;
              }
            }
          })
          .error(function () {});
      }

      $scope.createSitesDialog = function () {
        const container = document.getElementsByClassName('create-site-dialog-container')[0];
        const onClose = () => {
          CrafterCMSNext.ReactDOM.unmountComponentAtNode(container);
        };
        CrafterCMSNext.render(container, 'CreateSiteDialog', {
          onClose: onClose
        });
      };

      if ($scope.siteValidation) {
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

  app.controller('GlobalConfigCtrl', [
    '$rootScope',
    '$scope',
    '$element',
    '$http',
    '$timeout',
    '$uibModal',
    '$state',
    function ($rootScope, $scope, $element, $http, $timeout, $uibModal, $state) {
      $scope.globalConfig = {};
      let globalConfig = $scope.globalConfig;
      $scope.messages = {
        title: formatMessage(globalConfigMessages.title),
        viewSample: formatMessage(globalConfigMessages.viewSample),
        sampleFile: formatMessage(globalConfigMessages.sampleFile),
        useSampleContent: formatMessage(globalConfigMessages.useSampleContent),
        replaceContent: formatMessage(globalConfigMessages.replaceContent),
        appendContent: formatMessage(globalConfigMessages.appendContent),
        confirmSave: formatMessage(globalConfigMessages.confirmSave),
        confirmReset: formatMessage(globalConfigMessages.confirmReset),
        unSavedConfirmation: formatMessage(globalConfigMessages.unSavedConfirmation),
        unSavedConfirmationTitle: formatMessage(globalConfigMessages.unSavedConfirmationTitle),
        cancel: formatMessage(words.cancel),
        reset: formatMessage(words.reset),
        close: formatMessage(words.close),
        yes: formatMessage(words.yes),
        no: formatMessage(words.no),
        save: formatMessage(words.save)
      };

      $scope.uiEnabled = false;
      let defaultValue = '';
      let sampleValue = '';

      $scope.showModal = function (template, size, verticalCentered, styleClass) {
        var modalInstance = $uibModal.open({
          templateUrl: template,
          windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
          backdrop: 'static',
          keyboard: true,
          scope: $scope,
          size: size ? size : ''
        });

        return modalInstance;
      };
      $scope.hideModal = function () {
        $scope.confirmationModal.close();
      };

      const aceEditor = ace.edit('globalConfigAceEditor');

      const fileErrors = (editor) => {
        const editorAnnotations = editor.getSession().getAnnotations();
        const errors = editorAnnotations.filter((annotation) => {
          return annotation.type === 'error';
        });

        return errors;
      };

      aceEditor.setOptions({
        readOnly: true,
        value: defaultValue,
        mode: 'ace/mode/yaml',
        theme: 'ace/theme/textmate'
      });

      aceEditor.getSession().on('change', function () {
        globalConfig.isModified = true;
      });

      $http
        .get('/studio/api/2/configuration/get_configuration', {
          params: {
            siteId: 'studio_root',
            module: 'studio',
            path: '/configuration/studio-config-override.yaml'
          }
        })
        .then((data) => {
          aceEditor.setValue(data.data.content || defaultValue, -1); // sets cursor in position 0, avoiding all editor content selection
          aceEditor.focus();
          defaultValue = data.data.content;
          globalConfig.isModified = false;
          enableUI(true);
        });

      // Differ the loading of the sample config file to the "background"
      // Loading the value from this higher order controller allows caching,
      // avoiding fetching it multiple times on every sample modal open.
      setTimeout(() => {
        $http
          .get('/studio/api/1/services/api/1/content/get-content-at-path.bin', {
            params: {
              site: 'studio_root',
              path: '/configuration/samples/sample-studio-config-override.yaml'
            }
          })
          .then((content) => {
            sampleValue = content.data;
          });
      });

      $scope.checkDocumentErrors = function () {
        const errors = fileErrors(aceEditor);

        if (errors.length) {
          $scope.documentHasErrors = true;
          $element.notify(formatMessage(globalConfigMessages.documentError), {
            position: 'top left',
            className: 'error'
          });
        } else {
          $scope.documentHasErrors = false;
        }
      };

      $scope.save = function () {
        enableUI(false);
        const value = aceEditor.getValue();

        $http
          .post('/studio/api/2/configuration/write_configuration', {
            siteId: 'studio_root',
            module: 'studio',
            path: '/configuration/studio-config-override.yaml',
            content: value
          })
          .then(() => {
            enableUI(true);
            defaultValue = value;
            aceEditor.focus();
            $element.notify(formatMessage(globalConfigMessages.successfulSave), {
              position: 'top left',
              className: 'success'
            });
            globalConfig.isModified = false;
          })
          .catch((e) => {
            enableUI(true);
            $element.notify(
              (e.data && e.data.response && e.data.response.message) || formatMessage(globalConfigMessages.failedSave),
              {
                position: 'top left',
                className: 'error'
              }
            );
          });
      };

      $scope.reset = function () {
        aceEditor.setValue(defaultValue, -1); // sets cursor in position 0, avoiding all editor content selection
        aceEditor.focus();
        aceEditor.gotoLine(0, 0, true);
        globalConfig.isModified = false;
      };

      $scope.sample = function () {
        $uibModal
          .open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'sampleModal.html',
            controller: 'SampleGlobalConfigCtrl',
            scope: $scope,
            controllerAs: '$ctrl',
            size: 'lg',
            resolve: { sample: () => sampleValue }
          })
          .result.then(function ({ mode, sample }) {
            const value = aceEditor.getValue();
            aceEditor.setValue(
              mode === 'replace' ? sample : `${value}${value.trim() === '' ? '' : '\n\n'}${sample}`,
              -1
            );
            aceEditor.focus();
          });
      };

      function enableUI(enable = true, digest = false) {
        aceEditor.setReadOnly(!enable);
        $scope.uiEnabled = enable;
        digest && $scope.$apply();
      }

      $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (globalConfig.isModified) {
          event.preventDefault();

          $scope.confirmationAction = function () {
            globalConfig.isModified = false;
            $state.go(toState.name);
          };

          $scope.confirmationText = formatMessage(globalConfigMessages.unSavedConfirmation);
          $scope.confirmationTitle = formatMessage(globalConfigMessages.unSavedConfirmationTitle);
          $scope.confirmationModal = $scope.showModal('confirmationModal.html', 'sm', true, 'studioMedium');
        }
      });
    }
  ]);

  app.controller('EncryptionToolCtrl', [
    '$scope',
    function ($scope) {
      const workarea = document.querySelector('#encryption-tool-view');
      const el = document.createElement('div');

      $(workarea).html('');
      workarea.appendChild(el);

      CrafterCMSNext.render(el, 'EncryptTool');
    }
  ]);

  app.controller('SampleGlobalConfigCtrl', function ($uibModalInstance, sample) {
    let editor;
    let $ctrl = this;

    $uibModalInstance.rendered.then(() => {
      editor = ace.edit('sampleFileEditor');
      editor.setOptions({
        readOnly: true,
        value: sample,
        mode: 'ace/mode/yaml',
        theme: 'ace/theme/textmate'
      });
    });

    $ctrl.use = function (mode) {
      $uibModalInstance.close({ mode, sample });
    };
    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });

  app.controller('RemoveSiteCtrl', [
    '$scope',
    '$state',
    'sitesService',
    '$modalInstance',
    'siteToRemove',
    function ($scope, $state, sitesService, $modalInstance, siteToRemove) {
      $scope.siteToRemove = siteToRemove.siteId;
      $scope.confirmationSubmitDisabled = false;

      function removeSiteSitesModal(site) {
        sitesService
          .removeSite(site)
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
    '$scope',
    '$state',
    'sitesService',
    '$modalInstance',
    function ($scope, $state, sitesService, $modalInstance) {
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);

  app.controller('ErrorCreateSiteCtrl', [
    '$scope',
    '$state',
    'sitesService',
    '$modalInstance',
    'errorToShow',
    function ($scope, $state, sitesService, $modalInstance, errorToShow) {
      $scope.error = errorToShow;

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);

  app.controller('SiteCtrl', [
    '$scope',
    '$state',
    'sitesService',
    '$timeout',
    '$window',
    '$uibModal',
    '$translate',
    function ($scope, $state, sitesService, $timeout, $window, $uibModal, $translate) {
      // View models
      $scope.site = {};
      $scope.blueprints = [];
      $scope.isNumValid = false;
      $scope.isValid = false;
      $scope.isCollapsed = true;
      $scope.isPushChecked = false;
      $scope.isRemoteGit = false;

      function getBlueprints() {
        sitesService
          .getAvailableBlueprints()
          .success(function (data) {
            $scope.blueprints = data;
            $scope.site = {
              siteId: '',
              siteName: '',
              description: '',
              blueprint: $scope.blueprints[0],
              search: 'ElasticSearch'
            };
          })
          .error(function () {
            $scope.blueprints = [];
          });
      }

      getBlueprints();

      // View methods
      $scope.percent = percent;
      $scope.select = select;
      $scope.create = create;
      $scope.setSiteId = setSiteId;
      $scope.isValidSite = isValidSite;

      $scope.$watch('site', getSite);

      function setSiteId() {
        if ($scope.site.siteName != undefined) {
          $scope.site.siteId = $scope.site.siteName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        } else {
          $scope.site.siteId = '';
        }
        isValidSite();
      }

      function percent(data) {
        !data && (data = {});
        return Math.ceil((data.used * 100) / data.total);
      }

      function select($event) {
        $event.target.select();
      }

      function getSite() {
        var siteId = $state.params.siteId;

        if (!$scope.sites) {
          return;
        }

        for (var i = 0, sites = $scope.sites, site = sites[i], l = sites.length; i < l; site = sites[++i]) {
          if (site.siteId + '' === siteId + '') {
            $scope.site = site;
            break;
          }
        }
      }

      function isValidSite() {
        var patt = /(^0$)|(^0[0-9]+$)/i;
        var result = false;
        if ($scope.site.siteId) {
          $scope.site.siteId = $scope.site.siteId.replace(/(^-|_$)|[^a-zA-Z0-9-_]/g, '').toLowerCase();
          result = $scope.site.siteId.match(patt);
          if (result) {
            $scope.isNumValid = true;
          } else {
            $scope.isNumValid = false;
          }
          sitesService
            .exists({
              site: $scope.site.siteId
            })
            .success(function (data) {
              $scope.isValid = data.exists;
            });
        } else {
          $scope.isNumValid = false;
        }
      }

      function create() {
        $scope.modalInstance = null;
        $scope.createModalInstance = null;
        $scope.error = '';
        $scope.adminModal.close();

        $scope.createModalInstance = $uibModal.open({
          templateUrl: 'creatingSiteConfirmation.html',
          backdrop: 'static',
          keyboard: false,
          size: 'sm'
        });

        var params = { site_id: $scope.site.siteId, description: $scope.site.description };

        //$scope.site.isRemoteGit
        if ($scope.site.isRemoteGit) {
          if ($scope.site.sandbox_branch) {
            params.sandbox_branch = $scope.site.sandbox_branch;
          }
          params.use_remote = $scope.site.isRemoteGit;
          params.remote_name = $scope.site.name;
          params.remote_url = $scope.site.url;
          if ($scope.site.remote_branch) {
            params.remote_branch = $scope.site.remote_branch;
          }
          params.single_branch = false;
          params.authentication_type = !$scope.site.authentication ? 'none' : $scope.site.authentication;
          if ($scope.site.authentication == 'basic') {
            params.remote_username = $scope.site.username;
            params.remote_password = $scope.site.password;
          }
          if ($scope.site.authentication == 'token') {
            if ($scope.site.username) {
              params.remote_username = $scope.site.username;
            }
            params.remote_token = $scope.site.token;
          }
          if ($scope.site.authentication == 'key') {
            params.remote_private_key = $scope.site.key;
          }
        } else {
          params.blueprint = $scope.site.blueprint;
          if ($scope.site.push_sandbox_branch) {
            params.sandbox_branch = $scope.site.push_sandbox_branch;
          }
          if ($scope.site.push_site) {
            params.use_remote = $scope.site.push_site;
            params.remote_name = $scope.site.push_name;
            params.remote_url = $scope.site.push_url;
            if ($scope.site.push_remote_branch) {
              params.remote_branch = $scope.site.push_remote_branch;
            }
            params.single_branch = false;
            params.authentication_type = !$scope.site.push_authentication ? 'none' : $scope.site.push_authentication;
            if ($scope.site.push_authentication == 'basic') {
              params.remote_username = $scope.site.push_username;
              params.remote_password = $scope.site.push_password;
            }
            if ($scope.site.push_authentication == 'token') {
              if ($scope.site.push_username) {
                params.remote_username = $scope.site.push_username;
              }
              params.remote_token = $scope.site.push_token;
            }
            if ($scope.site.push_authentication == 'key') {
              params.remote_private_key = $scope.site.push_key;
            }
          }
        }
        params.create_option = $scope.site.push_site ? 'push' : 'clone';

        sitesService
          .create(params)
          .success(function (data) {
            $timeout(
              function () {
                sitesService.editSite($scope.site);
                $scope.createModalInstance.close();
              },
              0,
              false
            );
          })
          .error(function (data, error) {
            if (error === 401) {
              $scope.createModalInstance.close();
            } else {
              $scope.createModalInstance.close();
              $scope.error = data.message;
              $scope.modalInstance = $uibModal.open({
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
          template: 'createSitesBlueprint'
        },
        {
          step: 2,
          name: $translate.instant('dashboard.sites.create.BASIC_INFORMATION'),
          template: 'createSitesBasicInfo'
        },
        {
          step: 3,
          name: $translate.instant('dashboard.sites.create.BASIC_DEVELOPER_INFORMATION'),
          template: 'createSitesBasicDevInfo'
        },
        {
          step: 4,
          name: $translate.instant('dashboard.sites.create.ADITIONAL_DEVELOPER_OPTIONS'),
          template: 'createSitesAditionalDevOptions'
        },
        {
          step: 5,
          name: $translate.instant('dashboard.sites.create.REVIEW_CREATE'),
          template: 'createSitesReviewCreate'
        }
      ];

      //Functions
      $scope.gotoStep = function (newStep, isPreviosBtn) {
        for (var i = 0; i <= $scope.previousStep.length; i++) {
          if ($scope.previousStep[i] >= newStep) {
            $scope.previousStep.splice(i, 1);
            i = -1;
          }
        }
        if (!isPreviosBtn) {
          $scope.previousStep.push($scope.currentStep);
        }
        $scope.currentStep = newStep;
        if (newStep == 2) {
          $timeout(function () {
            $('#siteId')[0].focus();
          });
        }
      };

      $scope.getStepTemplate = function () {
        for (var i = 0; i < $scope.steps.length; i++) {
          if ($scope.currentStep == $scope.steps[i].step) {
            return $scope.steps[i].template;
          }
        }
      };

      $scope.gotoPreviousStep = function () {
        var previousStep = $scope.previousStep.slice(-1);
        $scope.previousStep.pop();
        $scope.gotoStep(previousStep, true);
      };

      $scope.removeHide = function () {
        $timeout(
          function () {
            $('#wizard-content-container').removeClass('hide');
          },
          300,
          false
        );
      };

      $scope.flexSilderInit = function (flexslider, carousel) {
        $timeout(function () {
          $('#' + flexslider).flexslider({
            animation: 'slide',
            controlNav: true
          });
        });
      };

      $scope.cancelCreateDialog = function (eve) {
        $(document).off('keyup');
        $scope.adminModal.close();
      };

      $(document).on('keyup', function (evt) {
        if (evt.which == 13) {
          var isRemoteGit = $scope.isRemoteGit ? 'remoteGit' : 'BPAvailable',
            elt = $scope.getStepTemplate() + '-' + isRemoteGit + '-key';

          !$('.' + elt).is(':disabled') ? $('.' + elt).trigger('click') : null;
        }
        if (evt.which == 27) {
          $scope.cancelCreateDialog();
        }
      });

      // END NEW Create Site
    }
  ]);

  app.controller('PreviewCtrl', [
    '$scope',
    '$state',
    '$window',
    '$sce',
    function ($scope, $state, $window, $sce) {
      function getIFrame(getContentWindow) {
        var el = $window.document.getElementById('studioIFrame');
        return getContentWindow ? el.contentWindow : el;
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

  app.directive('compareTo', function () {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=compareTo'
      },
      link: function (scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function (modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch('otherModelValue', function () {
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
            if (!val.replace) {
              val = val.toString();
            }
            var digits = val.replace(/[^0-9]/g, '');

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }
            return parseInt(digits, 10);
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
          if (value === 'true') {
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
      return !value ? '' : value.replace(/ /g, '');
    };
  });

  app.directive('stResetSearch', function () {
    return {
      restrict: 'EA',
      require: '^stTable',
      link: function (scope, element, attrs, ctrl) {
        return element.bind('click', function () {
          return scope.$evalAsync(function () {
            var tableState;
            tableState = ctrl.tableState();
            tableState.search.predicateObject = {};
            tableState.pagination.start = 0;

            return ctrl.pipe();
          });
        });
      }
    };
  });
})(angular);
