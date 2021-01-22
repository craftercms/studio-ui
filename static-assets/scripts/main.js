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

(function(angular) {
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
    globalMenuMessages = i18n.messages.globalMenuMessages,
    adminDashboardMessages = i18n.messages.adminDashboardMessages;

  app.run([
    '$rootScope',
    '$state',
    '$stateParams',
    'authService',
    'sitesService',
    'Constants',
    '$uibModal',
    '$timeout',
    function($rootScope, $state, $stateParams, authService, sitesService, Constants, $uibModal, $timeout) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;

      $rootScope.imagesDirectory = Constants.PATH_IMG;

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        const init = () => {
          if (toState.name.indexOf('users') !== -1) {
            var user = authService.getUser();
            if (user && user.username) {
              var createSitePermissions = false;
              sitesService.getPermissions('', '/', user.username || user).then(function(permissions) {
                if (permissions.includes('create-site')) {
                  createSitePermissions = true;
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
            sitesService.getGlobalMenu().then(function(menuItems) {
              $rootScope.globalMenuData = menuItems;
              setDocTitle(menuItems, toState);
            });
          }
        };

        CrafterCMSNext.system.getStore().subscribe(() => {
          init();
        });
      });

      sitesService.getLanguages($rootScope, true);

      // More configuration on https://notifyjs.com/
      $rootScope.showNotification = function(message, positionx, positiony, type, originalx, originaly, classElt) {
        var globalPositionx = positionx ? positionx : 'top',
          globalPositiony = positiony ? positiony : 'right',
          globalPosition = globalPositionx + ' ' + globalPositiony,
          type = type ? type : 'success',
          currentClassElt = classElt ? ' ' + classElt : '';
        const currentType = type + currentClassElt;
        originalx = originalx ? originalx : 0;
        originaly = originaly ? originaly : 0;
        let html;

        if (type === 'success') {
          html =
            '<div><svg class="notifyjs-material-icon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path></svg><span data-notify-text/></div>';
        } else if (type === 'error') {
          html =
            '<div><svg class="notifyjs-material-icon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg><span data-notify-text/></div>';
        } else {
          html = '<div><span data-notify-text/></div>';
        }

        $.notify.addStyle('material', {
          html
        });

        $.notify(message, {
          globalPosition: globalPosition,
          className: currentType,
          style: 'material',
          autoHideDelay: 4000
        });

        var element;
        if (classElt) {
          element = $('.notifyjs-corner').has('.' + classElt);
        } else {
          element = $('.notifyjs-corner').has('.notifyjs-bootstrap-' + type);
        }

        if (positionx == 'top') {
          if (positiony == 'left') element.css({ top: originalx + 'px', left: originaly + 'px' });
          if (positiony == 'right') element.css({ top: originalx + 'px', right: originaly + 'px' });
        }
        if (positionx == 'bottom') {
          if (positiony == 'left')
            element.css({
              bottom: originalx + 'px',
              left: originaly + 'px'
            });
          if (positiony == 'right')
            element.css({
              bottom: originalx + 'px',
              right: originaly + 'px'
            });
        }
      };

      CrafterCMSNext.renderBackgroundUI();
    }
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$translateProvider',
    function($stateProvider, $urlRouterProvider, $translateProvider) {
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
    AUDIT_SYSTEM: 'Studio Root'
  });

  app.service('authService', [
    '$rootScope',
    '$document',
    function($rootScope, $document) {
      var user = null;
      var script = $document[0].getElementById('user');
      var authApi = CrafterCMSNext.services.auth;
      var monitoringApi = CrafterCMSNext.services.monitoring;
      var usersApi = CrafterCMSNext.services.users;

      if (script) {
        script = angular.element(script);
        user = JSON.parse(script.html());
      }

      this.isAuthenticated = function() {
        return !!user;
      };

      this.getSSOLogoutInfo = function() {
        return authApi.getSSOLogoutURL().toPromise();
      };

      this.getUser = function() {
        return user;
      };

      this.removeUser = function() {};

      this.getStudioInfo = function() {
        return monitoringApi.version().toPromise();
      };

      this.changePassword = function(data) {
        return usersApi.setMyPassword(data.username, data.current, data.new).toPromise();
      };

      return this;
    }
  ]);

  app.service('sitesService', [
    '$rootScope',
    'Constants',
    '$cookies',
    '$timeout',
    '$window',
    '$translate',
    function($rootScope, Constants, $cookies, $timeout, $window, $translate) {
      var me = this;
      var securityApi = CrafterCMSNext.services.security;
      var sitesApi = CrafterCMSNext.services.sites;
      var configurationApi = CrafterCMSNext.services.configuration;

      this.getSites = function(params) {
        return sitesApi.fetchSites().toPromise();
      };

      this.setCookie = function(cookieGenName, value) {
        CrafterCMSNext.util.auth.setSiteCookie(value);
      };

      this.editSite = function(site) {
        me.setCookie('crafterSite', site.id);
        $timeout(
          function() {
            $window.location.href =
              CrafterCMSNext.util.state.getStoredPreviewChoice(site.id) === '2'
                ? '/studio/next/preview'
                : '/studio/preview';
          },
          0,
          false
        );
      };

      this.editSiteData = function(site, onEditSuccess) {
        const eventIdSuccess = 'editSiteDialogSuccess';
        const eventIdDismissed = 'editSiteDialogDismissed';
        CrafterCMSNext.system.store.dispatch({
          type: 'SHOW_EDIT_SITE_DIALOG',
          payload: {
            open: true,
            site,
            onSaveSuccess: {
              type: 'BATCH_ACTIONS',
              payload: [
                {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: eventIdSuccess }
                },
                { type: 'CLOSE_EDIT_SITE_DIALOG' }
              ]
            },
            onClose: {
              type: 'BATCH_ACTIONS',
              payload: [
                {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: eventIdDismissed }
                },
                { type: 'CLOSE_EDIT_SITE_DIALOG' }
              ]
            }
          }
        });
        let cleanupSuccess = CrafterCMSNext.createLegacyCallbackListener(eventIdSuccess, (response) => {
          $rootScope.showNotification(formatMessage(adminDashboardMessages.siteUpdated));
          onEditSuccess(response);
        });
        CrafterCMSNext.createLegacyCallbackListener(eventIdDismissed, () => {
          cleanupSuccess();
        });
      };

      this.goToDashboard = function(site) {
        me.setCookie('crafterSite', site.id);
        $timeout(
          function() {
            $window.location.href = '/studio/site-dashboard';
          },
          0,
          false
        );
      };

      this.removeSite = function(site) {
        return sitesApi.deleteSite(site).toPromise();
      };

      this.getPermissions = function(siteId, path, user) {
        return securityApi.getUserPermissions(siteId, path).toPromise();
      };

      this.getAvailableLanguages = function() {
        return configurationApi.getProductLanguages().toPromise();
      };

      this.getDocumentCookie = function(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2)
          return parts
            .pop()
            .split(';')
            .shift();
      };

      this.getLanguages = function(scope, setLang) {
        this.getAvailableLanguages().then(
          function(data) {
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
          },
          function() {
            scope.languagesAvailable = [];
          }
        );
      };

      this.showLoaderProperty = function() {
        var showLoader = false;

        return {
          getProperty: function() {
            return showLoader;
          },
          setProperty: function(value) {
            showLoader = value;
            $rootScope.$broadcast(Constants.SHOW_LOADER, value);
          }
        };
      };

      this.getGlobalMenu = function() {
        return configurationApi.getGlobalMenuItems().toPromise();
      };

      return this;
    }
  ]);

  app.service('passwordRequirements', [
    function() {
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

      this.init = function(scope, isValid, elt, placement) {
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
              console.warning('Defaulting password validation to server due to issues in RegExp compilation.');
            }
          }
        }
      };

      this.creatingPassValHTML = function(content, templateType) {
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
            html += `<span class="password-popover--list-Info">${messages[captureGroupNameClean] ||
              captureGroupNameClean}</span>`;
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

      this.runValidation = function(scope, isValid, elt, staticTemplate, placement) {
        $('#' + elt)
          .blur(function() {
            $(this).popover('destroy');
          })
          .keyup(function() {
            let creatingPassValHTML = me.creatingPassValHTML($(this).get(0).value, staticTemplate);
            $('.popover')
              .find('.popover-content')
              .html(creatingPassValHTML.template);
            scope[isValid] = creatingPassValHTML.validPass;
            scope.$apply();
          })
          .focus(function() {
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
    function(
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

      $scope.showModal = function(template, size, verticalCentered, styleClass) {
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
      $scope.hideModal = function() {
        $scope.confirmationModal.close();
      };

      if ($location.$$search.iframe) {
        $rootScope.isFooter = false;
      }

      const container = document.querySelector('#toolbarGlobalNav');
      CrafterCMSNext.ReactDOM.unmountComponentAtNode(container);
      CrafterCMSNext.render(container, 'ToolbarGlobalNav', {
        authHeaders: Constants.AUTH_HEADERS,
        authSaml: Constants.SAML
      });

      function changePassword() {
        $scope.data.username = $scope.user.username;
        $translate.use($scope.langSelected);

        if ($scope.data.new === $scope.data.confirmation) {
          authService.changePassword($scope.data).then(
            function() {
              CrafterCMSNext.system.store.dispatch({
                type: 'SHOW_SYSTEM_NOTIFICATION',
                payload: {
                  message: formatMessage(i18n.messages.usersAdminMessages.passwordChangeSuccess)
                }
              });
            },
            function(error) {
              var errorResponse = error.response.response;
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

      $scope.selectActionLanguage = function(optSelected) {
        $scope.isModified = true;
        $scope.langSelected = optSelected;
      };

      $scope.setLangCookie = function() {
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

      $scope.cancel = function() {
        $rootScope.modalInstance.close();
      };

      $scope.loadHomeState = function() {
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
        sitesService.getPermissions('', '/', $scope.user.username || $scope.user).then(function(permissions) {
          if (permissions.includes('create-site')) {
            $scope.createSites = true;
          }
        });
      }

      $scope.data = { email: ($scope.user || { email: '' }).email };
      $scope.error = null;

      $scope.changePassword = changePassword;

      $scope.$on(Constants.AUTH_SUCCESS, function($event, user) {
        $scope.user = user;
        $scope.data.email = $scope.user.email;
      });

      if (authService.getUser()) {
        authService.getStudioInfo().then(function(data) {
          const packageVersion = data.packageVersion;
          const simpleVersion = packageVersion.substr(0, 3);
          $scope.aboutStudio = data.version;
          $scope.versionNumber = `${packageVersion}-${data.packageBuild.substring(0, 6)}`;
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

      $scope.spinnerOverlay = function() {
        return $uibModal.open({
          templateUrl: 'spinnerModal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'sm',
          windowClass: 'spinner-modal centered-dialog'
        });
      };
      $scope.validPass = false;
      $scope.passwordRequirements = function() {
        passwordRequirements.init($scope, 'validPass', 'password', 'top');
      };

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        if ($scope.isModified) {
          event.preventDefault();

          $scope.confirmationAction = function() {
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
    function($rootScope, $scope, $state, $location, sitesService) {
      if ($rootScope.globalMenuData) {
        initGlobalMenu($rootScope.globalMenuData);
      } else {
        sitesService.getGlobalMenu().then(
          function(data) {
            $rootScope.globalMenuData = data;
            initGlobalMenu(data);
          },
          function(er) {
            console.log(er);
          }
        );
      }

      function setLabels() {
        i18n = CrafterCMSNext.i18n;
        formatMessage = i18n.intl.formatMessage;
        globalMenuMessages = i18n.messages.globalMenuMessages;
        $scope.entities.forEach(function(entry, i) {
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

          $scope.entities.forEach(function(entry, i) {
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
    '$rootScope',
    '$scope',
    '$state',
    '$location',
    'sitesService',
    'authService',
    '$uibModal',
    '$cookies',
    '$timeout',
    'Constants',

    function(
      $rootScope,
      $scope,
      $state,
      $location,
      sitesService,
      authService,
      $uibModal,
      $cookies,
      $timeout,
      Constants
    ) {
      $scope.sites = null;

      $scope.editSite = sitesService.editSite;

      $scope.editSiteData = function(site) {
        const onEditSuccess = () => {
          CrafterCMSNext.system.store.dispatch({
            type: 'CLOSE_EDIT_SITE_DIALOG'
          });
          getSites();
        };

        sitesService.editSiteData(site, onEditSuccess);
      };

      $scope.goToDashboard = sitesService.goToDashboard;

      $scope.createSites = false;

      $scope.user = authService.getUser();

      $scope.siteValidation = $location.$$search.siteValidation;

      $scope.showLoader = sitesService.showLoaderProperty().getProperty();

      $scope.$on(Constants.SHOW_LOADER, function($event, showLoader) {
        $scope.showLoader = showLoader;
      });

      $scope.sitesPag = {
        sitesPerPage: $cookies.get('crafterStudioSitesPagination')
          ? parseInt($cookies.get('crafterStudioSitesPagination'), 10)
          : 15
      };

      $scope.totalSites = 0;
      $scope.defaultDelay = 500;

      $scope.pageChanged = function(newPage) {
        getResultsPage(newPage);
        sitesService.setCookie('crafterStudioSitesPagination', $scope.sitesPag.sitesPerPage);
      };

      function getSites(params) {
        if (params) {
          $scope.paginationData = params;
        }
        sitesService.getSites($scope.paginationData).then(
          (data) => {
            $scope.totalSites = data.total;
            $scope.sites = data;
            isRemove();
            createSitePermission();
            $scope.$apply();
          },
          (e) => {
            $rootScope.showNotification(e.message, null, null, 'error');
            $scope.sites = null;
          }
        );
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

      $scope.removeSiteSites = function(site) {
        var modalInstance = $uibModal.open({
          templateUrl: 'removeConfirmation.html',
          controller: 'RemoveSiteCtrl',
          backdrop: 'static',
          keyboard: true,
          windowClass: 'studioMedium',
          resolve: {
            siteToRemove: function() {
              return site;
            }
          }
        });

        modalInstance.result.then(function() {
          getResultsPage(1);
        });
      };

      function addingRemoveProperty(siteId) {
        for (var j = 0; j < $scope.sites.length; j++) {
          if ($scope.sites[j].id == siteId) {
            $scope.sites[j].remove = true;
          }
        }
      }

      function addingEditProperty(siteId) {
        for (var j = 0; j < $scope.sites.length; j++) {
          if ($scope.sites[j].id == siteId) {
            $scope.sites[j].edit = true;
          }
        }
      }

      function removePermissionPerSite(siteId) {
        return sitesService
          .getPermissions(siteId, '/', $scope.user.username || $scope.user)
          .then(function(permissions) {
            var removeProp = false;
            var addProp = false;
            for (var i = 0; i < permissions.length; i++) {
              if (permissions[i] === 'delete') {
                addingRemoveProperty(siteId);
                removeProp = true;
              }
              if (permissions[i] === 'edit_site') {
                addingEditProperty(siteId);
                addProp = true;
              }
              if (removeProp && addProp) {
                break;
              }
            }
          });
      }

      function isRemove() {
        const promises = [];
        for (var j = 0; j < $scope.sites.length; j++) {
          promises.push(removePermissionPerSite($scope.sites[j].id));
        }
        Promise.all(promises).then(() => {
          $scope.$apply();
        });
      }

      function createSitePermission() {
        sitesService.getPermissions('', '/', $scope.user.username || $scope.user).then(function(permissions) {
          if (permissions.includes('create-site')) {
            $scope.createSites = true;
            $scope.$apply();
          }
        });
      }

      $scope.createSitesDialog = function() {
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
    '$timeout',
    '$uibModal',
    '$state',
    function($rootScope, $scope, $element, $timeout, $uibModal, $state) {
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

      let configurationApi = CrafterCMSNext.services.configuration;

      $scope.showModal = function(template, size, verticalCentered, styleClass) {
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
      $scope.hideModal = function() {
        $scope.confirmationModal.close();
      };

      const aceEditor = ace.edit('globalConfigAceEditor');

      aceEditor.setOptions({
        readOnly: true,
        value: defaultValue,
        mode: 'ace/mode/yaml',
        theme: 'ace/theme/textmate'
      });

      aceEditor.getSession().on('change', function() {
        globalConfig.isModified = true;
      });

      configurationApi
        .getRawConfiguration('studio_root', '/configuration/studio-config-override.yaml', 'studio')
        .subscribe((data) => {
          aceEditor.setValue(data || defaultValue, -1); // sets cursor in position 0, avoiding all editor content selection
          aceEditor.focus();
          defaultValue = data;
          globalConfig.isModified = false;
          enableUI(true);
          $scope.$apply();
        });

      // Differ the loading of the sample config file to the "background"
      // Loading the value from this higher order controller allows caching,
      // avoiding fetching it multiple times on every sample modal open.
      setTimeout(() => {
        configurationApi
          .getRawConfiguration('studio_root', '/configuration/samples/sample-studio-config-override.yaml', 'studio')
          .subscribe((data) => {
            sampleValue = data;
            $scope.$apply();
          });
      });

      $scope.save = function() {
        enableUI(false);
        const value = aceEditor.getValue();
        configurationApi
          .writeConfiguration('studio_root', '/configuration/studio-config-override.yaml', 'studio', value)
          .subscribe(
            () => {
              enableUI(true);
              defaultValue = value;
              aceEditor.focus();
              globalConfig.isModified = false;
              $element.notify(formatMessage(globalConfigMessages.successfulSave), {
                position: 'top left',
                className: 'success'
              });
              $scope.$apply();
            },
            () => {
              $element.notify(formatMessage(globalConfigMessages.failedSave), {
                position: 'top left',
                className: 'error'
              });
              $scope.$apply();
            }
          );
      };

      $scope.reset = function() {
        aceEditor.setValue(defaultValue, -1); // sets cursor in position 0, avoiding all editor content selection
        aceEditor.focus();
        aceEditor.gotoLine(0, 0, true);
        globalConfig.isModified = false;
      };

      $scope.sample = function() {
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
          .result.then(function({ mode, sample }) {
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

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        if (globalConfig.isModified) {
          event.preventDefault();

          $scope.confirmationAction = function() {
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
    function($scope) {
      const workarea = document.querySelector('#encryption-tool-view');
      const el = document.createElement('div');

      $(workarea).html('');
      workarea.appendChild(el);

      CrafterCMSNext.render(el, 'EncryptTool');
    }
  ]);

  app.controller('SampleGlobalConfigCtrl', function($uibModalInstance, sample) {
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

    $ctrl.use = function(mode) {
      $uibModalInstance.close({ mode, sample });
    };
    $ctrl.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });

  app.controller('RemoveSiteCtrl', [
    '$scope',
    '$state',
    'sitesService',
    '$modalInstance',
    'siteToRemove',
    function($scope, $state, sitesService, $modalInstance, siteToRemove) {
      $scope.siteToRemove = siteToRemove.id;
      $scope.confirmationSubmitDisabled = false;

      function removeSiteSitesModal(site) {
        sitesService.removeSite(site.id).then(
          function() {
            CrafterCMSNext.system.store.dispatch({
              type: 'SHOW_SYSTEM_NOTIFICATION',
              payload: {
                message: formatMessage(i18n.messages.siteSuccessMessages.siteDeleted)
              }
            });
            $modalInstance.close();
            sitesService.showLoaderProperty().setProperty(false);
            $scope.$apply();
          },
          function() {
            // $scope.sites = null;
          }
        );
      }

      $scope.ok = function() {
        sitesService.showLoaderProperty().setProperty(true);
        $scope.confirmationSubmitDisabled = true;
        removeSiteSitesModal(siteToRemove);
      };

      $scope.cancel = function() {
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
    function($scope, $state, sitesService, $modalInstance) {
      $scope.cancel = function() {
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
    function($scope, $state, sitesService, $modalInstance, errorToShow) {
      $scope.error = errorToShow;

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);

  app.directive('compareTo', function() {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=compareTo'
      },
      link: function(scope, element, attributes, ngModel) {
        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch('otherModelValue', function() {
          ngModel.$validate();
        });
      }
    };
  });

  app.directive('onlyDigits', function() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attr, ctrl) {
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

  app.directive('focusMe', function($timeout) {
    return {
      link: function(scope, element, attr) {
        attr.$observe('focusMe', function(value) {
          if (value === 'true') {
            $timeout(function() {
              element[0].focus();
            });
          }
        });
      }
    };
  });

  app.filter('nospace', function() {
    return function(value) {
      return !value ? '' : value.replace(/ /g, '');
    };
  });

  app.directive('stResetSearch', function() {
    return {
      restrict: 'EA',
      require: '^stTable',
      link: function(scope, element, attrs, ctrl) {
        return element.bind('click', function() {
          return scope.$evalAsync(function() {
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
