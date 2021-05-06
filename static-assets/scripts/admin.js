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

(function(angular, $) {
  'use strict';

  var app = angular.module('studio');

  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    repoMessages = i18n.messages.reposAdminMessages,
    passwordRequirementMessages = i18n.messages.passwordRequirementMessages,
    usersAdminMessages = i18n.messages.usersAdminMessages,
    groupsAdminMessages = i18n.messages.groupsAdminMessages,
    publishingMessages = i18n.messages.publishingMessages,
    adminDashboardMessages = i18n.messages.adminDashboardMessages,
    words = i18n.messages.words;

  function getTopLegacyWindow() {
    return window.top;
  }

  app.service('adminService', [
    '$http',
    'Constants',
    function($http, Constants) {
      let usersApi = CrafterCMSNext.services.users;

      this.maxInt = 32000;

      // USERS

      this.getUsers = function(params) {
        return usersApi.fetchAll(params).toPromise();
      };

      this.getUser = function(id) {
        return usersApi.fetchByUsername(id).toPromise();
      };

      this.createUser = function(user) {
        delete user.passwordVerification;
        return usersApi.create(user).toPromise();
      };

      this.editUser = function(user) {
        return usersApi.update(user).toPromise();
      };

      this.deleteUser = function(user) {
        return usersApi.trash(user.username).toPromise();
      };

      this.toggleUserStatus = function(user, action) {
        return (action === 'enable' ? usersApi.enable(user.username) : usersApi.disable(user.username)).toPromise();
      };

      // Allow the administrator to reset Crafter Studio’s user password provided.
      this.resetPassword = function(data) {
        return usersApi.setPassword(data.username, data.new).toPromise();
      };

      this.changePassword = function(data) {
        return usersApi.setMyPassword(data.username, data.current, data.new).toPromise();
      };

      // CLUSTERS
      let clustersApi = CrafterCMSNext.services.clusters;

      this.getClusterMembers = function() {
        return clustersApi.fetchMembers().toPromise();
      };

      this.deleteClusterMember = function(clusterParam) {
        return clustersApi.deleteMember(clusterParam.id).toPromise();
      };

      // GROUPS
      let groupsApi = CrafterCMSNext.services.groups;

      this.getGroups = function(params) {
        return groupsApi.fetchAll(params).toPromise();
      };

      this.getUsersFromGroup = function(group, params) {
        return groupsApi.fetchUsersFromGroup(group.id, params).toPromise();
      };

      this.deleteUserFromGroup = function(groupId, params) {
        return groupsApi.deleteUserFromGroup(groupId, params.userId, params.username).toPromise();
      };

      this.createGroup = function(group) {
        return groupsApi.create(group).toPromise();
      };

      this.editGroup = function(group) {
        return groupsApi.update(group).toPromise();
      };

      this.deleteGroup = function(group) {
        return groupsApi.trash(group.id).toPromise();
      };

      this.addUserToGroup = function(data) {
        var body = {
          ids: [data.userId.toString()],
          usernames: [data.username]
        };
        return groupsApi.addUsersToGroup(data.groupId, body).toPromise();
      };

      // REPOSITORIES
      let repositoriesApi = CrafterCMSNext.services.repositories;

      this.getRepositories = function(data) {
        return repositoriesApi.fetchRepositories(data.site).toPromise();
      };

      this.createRepository = function(data) {
        return repositoriesApi.addRemote(data).toPromise();
      };

      this.deleteRepository = function(data) {
        return repositoriesApi.deleteRemote(data.siteId, data.remoteName).toPromise();
      };

      this.pullRepository = function(data) {
        return repositoriesApi.pull(data).toPromise();
      };

      this.pushRepository = function(data) {
        return repositoriesApi.push(data.siteId, data.remoteName, data.remoteBranch).toPromise();
      };

      this.repositoryStatus = function(site) {
        return repositoriesApi.fetchStatus(site).toPromise();
      };

      this.resolveConflict = function(data) {
        return repositoriesApi.resolveConflict(data.siteId, data.path, data.resolution).toPromise();
      };

      this.diffConflictedFile = function(data) {
        return repositoriesApi.diffConflictedFile(data.siteId, data.path).toPromise();
      };

      this.commitResolution = function(data) {
        return repositoriesApi.commitResolution(data.siteId, data.commitMessage).toPromise();
      };

      this.cancelFailedPull = function(data) {
        return repositoriesApi.cancelFailedPull(data.siteId).toPromise();
      };

      // AUDIT
      let auditApi = CrafterCMSNext.services.audit;

      this.getAudit = function(data) {
        return auditApi.fetchAuditLog(data).toPromise();
      };

      this.getSpecificAudit = function(auditId) {
        return auditApi.fetchAuditLogEntry(auditId).toPromise();
      };

      // LOGGING
      let logsApi = CrafterCMSNext.services.logs;

      this.getLoggers = function() {
        return logsApi.fetchLoggers().toPromise();
      };

      this.setLogger = function(data) {
        return logsApi.setLogger(data.logger, data.level).toPromise();
      };

      // LOG CONSOLE
      this.getLogStudio = function(data) {
        return logsApi.fetchLogs(data.since).toPromise();
      };

      this.getLogPreview = function(data) {
        return $http.get('/studio/engine/api/1/monitoring/log.json', {
          params: data
        });
      };

      // PUBLISHING
      let publishingApi = CrafterCMSNext.services.publishing;

      this.getPublishStatus = function(site) {
        return publishingApi.fetchStatus(site).toPromise();
      };

      this.startPublishStatus = function(site) {
        return publishingApi.start(site.site_id).toPromise();
      };

      this.stopPublishStatus = function(site) {
        return publishingApi.stop(site.site_id).toPromise();
      };

      this.getTimeZone = function(data) {
        return CrafterCMSNext.util.ajax
          .get(`/studio/api/1/services/api/1/site/get-configuration.json?site=${data.site}&path=${data.path}`)
          .toPromise();
      };

      // BULKPUBLISH
      this.getPublishingChannels = function(site) {
        return publishingApi.fetchPublishingTargets(site).toPromise();
      };

      this.bulkGoLive = function(site, path, environment, submissionComment) {
        environment = environment ? environment : Constants.BULK_ENVIRONMENT;
        submissionComment = submissionComment ? submissionComment : '';

        return publishingApi.bulkGoLive(site, path, environment, submissionComment).toPromise();
      };

      // COMMITSPUBLISH

      this.commitsPublish = function(data) {
        return publishingApi
          .publishByCommits(data.site_id, data.commit_ids, data.environment, data.comment)
          .toPromise();
      };

      function repositories(action, params) {
        if (params) {
          return Constants.SERVICE2 + 'repository/' + action + '?' + params;
        } else {
          return Constants.SERVICE2 + 'repository/' + action;
        }
      }

      return this;
    }
  ]);

  app.controller('AuditCtrl', [
    '$rootScope',
    '$scope',
    '$location',
    function($rootScope, $scope, $location) {
      CrafterCMSNext.render(document.querySelector('#audit-management-view'), 'AuditManagement', {
        site: $location.search().site
      }).then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);

  app.controller('LoggingLevelsCtrl', [
    '$rootScope',
    function($rootScope) {
      CrafterCMSNext.render(document.querySelector('#logging-levels-management-view'), 'LoggingLevelsManagement').then(
        (done) => {
          const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
            unsubscribe();
            done.unmount();
          });
        }
      );
    }
  ]);

  app.controller('LogConsoleCtrl', [
    '$scope',
    '$state',
    '$window',
    'adminService',
    '$translate',
    '$interval',
    '$timeout',
    '$location',
    'logType',
    '$uibModal',
    function($scope, $state, $window, adminService, $translate, $interval, $timeout, $location, logType, $uibModal) {
      $scope.logs = {
        entries: [],
        running: true,
        timer: null,
        interval: 5000,
        since: 3600000
      };
      var logs = $scope.logs,
        logService = logType === 'studio' ? adminService.getLogStudio : adminService.getLogPreview;

      logs.logType = logType;

      logs.startTimer = function() {
        logs.timer = $interval(function() {
          logs.getLogs();
        }, logs.interval);
      };

      logs.stopTimer = function() {
        // Cancel the Timer.
        if (angular.isDefined(logs.timer)) {
          $interval.cancel(logs.timer);
        }
      };

      logs.logDetails = function(log) {
        $scope.logs.selectedLog = log;
        $scope.logs.detailsModal = $uibModal.open({
          templateUrl: '/studio/static-assets/ng-views/log-details.html',
          backdrop: 'static',
          keyboard: true,
          scope: $scope,
          size: 'lg'
        });
      };

      logs.closeDetails = function() {
        $scope.logs.detailsModal.close();
      };

      logs.getLogs = function(since) {
        var dateNow = new Date(),
          since = since ? since : logs.interval,
          currMillis = new Date(dateNow.getTime() - since).getTime(),
          container = document.getElementById('logConsoleContainer');

        var data = {
          since: currMillis
        };

        if (logType === 'preview') {
          data.site = $location.search().site;
          data.crafterSite = data.site;
        }

        logService(data).then(function(data) {
          var events = data;
          if (events.length > 0) {
            logs.entries = logs.entries.concat(events);
            $scope.$apply();

            $timeout(
              function() {
                container.scrollTop = container.scrollHeight;
              },
              0,
              false
            );
          }
        });
      };

      logs.clearLogs = function() {
        logs.entries = [];
      };

      logs.togglePlayPause = function() {
        if (logs.running) {
          logs.stopTimer();
        } else {
          logs.startTimer();
        }
        logs.running = !logs.running;
      };

      CrafterCMSNext.system.getStore().subscribe(() => {
        logs.getLogs(logs.since);
      });

      $scope.$on('$viewContentLoaded', function() {
        logs.startTimer();
      });

      $scope.$on('$destroy', function() {
        logs.stopTimer();
      });
    }
  ]);

  app.controller('LogConsoleStudioCtrl', [
    '$scope',
    '$state',
    '$window',
    'adminService',
    '$translate',
    '$interval',
    '$timeout',
    '$location',
    '$controller',
    function($scope, $state, $window, adminService, $translate, $interval, $timeout, $location, $controller) {
      $controller('LogConsoleCtrl', {
        $scope,
        $state,
        $window,
        adminService,
        $translate,
        $interval,
        $timeout,
        $location,
        logType: 'studio'
      });
    }
  ]);

  app.controller('LogConsolePreviewCtrl', [
    '$scope',
    '$state',
    '$window',
    'adminService',
    '$translate',
    '$interval',
    '$timeout',
    '$location',
    '$controller',
    function($scope, $state, $window, adminService, $translate, $interval, $timeout, $location, $controller) {
      $controller('LogConsoleCtrl', {
        $scope,
        $state,
        $window,
        adminService,
        $translate,
        $interval,
        $timeout,
        $location,
        logType: 'preview'
      });
    }
  ]);

  app.controller('PublishingCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$sce',
    'adminService',
    '$uibModal',
    '$timeout',
    '$stateParams',
    '$translate',
    '$location',
    'moment',
    function(
      $rootScope,
      $scope,
      $state,
      $window,
      $sce,
      adminService,
      $uibModal,
      $timeout,
      $stateParams,
      $translate,
      $location
    ) {
      $scope.publish = {};
      var store;
      var relevantProps = ['enabled', 'status', 'lockOwner', 'lockTTL', 'message'];
      var currentStatus = {};
      var publish = $scope.publish;
      publish.error = '';

      publish.bulkPublishNote = formatMessage(publishingMessages.bulkPublishNote);
      publish.publishByNote = formatMessage(publishingMessages.publishByNote);

      publish.initQueque = function() {
        CrafterCMSNext.render(document.getElementsByClassName('publishingQueue')[0], 'PublishingQueue', {
          siteId: $location.search().site
        });
      };

      publish.showModal = function(template, size, verticalCentered, styleClass) {
        var modalInstance = $uibModal.open({
          templateUrl: template,
          windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
          backdrop: 'static',
          keyboard: true,
          // controller: 'PublishingCtrl',
          scope: $scope,
          size: size ? size : ''
        });

        return modalInstance;
      };
      publish.hideAdminModal = function() {
        $scope.adminModal.close();
      };

      publish.hideConfirmationBulkModal = function() {
        $scope.confirmationBulk.close();
      };

      publish.hideErrorModal = function() {
        $scope.errorDialog.close();
      };

      publish.stopDisabled = false;
      publish.startDisabled = false;
      publish.site = $location.search().site;
      publish.timeZone;
      publish.isValidateCommentOn = false;
      publish.isValidateCommitPublishCommentOn = false;

      publish.getPublish = function() {
        store.dispatch({ type: 'FETCH_PUBLISHING_STATUS' });
      };

      publish.startPublish = function() {
        var requestAsString = { site_id: publish.site };
        adminService.startPublishStatus(requestAsString).then(
          function(data) {
            publish.getPublish(requestAsString);
            getTopLegacyWindow().postMessage('status-changed', '*');
          },
          function(err) {
            if (err.message) {
              publish.error = err.message;
            } else {
              publish.error = err.match(/<title[^>]*>([^<]+)<\/title>/)[1];
            }
            $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
          }
        );
      };

      publish.stopPublish = function() {
        var requestAsString = { site_id: publish.site };
        adminService.stopPublishStatus(requestAsString).then(
          function(data) {
            publish.getPublish(requestAsString);
            getTopLegacyWindow().postMessage('status-changed', '*');
          },
          function(err) {
            if (err.message) {
              publish.error = err.message;
            } else {
              publish.error = err.match(/<title[^>]*>([^<]+)<\/title>/)[1];
            }
            $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
          }
        );
      };

      // BULK PUBLISH

      publish.channels;
      publish.getPublishingChannels;
      publish.bulkPublish;
      publish.continue;
      publish.selectedChannel = '';
      publish.selectedChannelCommit = '';
      publish.pathPublish = '';

      publish.getPublishingChannels = function() {
        adminService.getPublishingChannels(publish.site).then(
          function(data) {
            publish.channels = data;
            publish.selectedChannel = publish.channels[0].name.toString();
            publish.selectedChannelCommit = publish.channels[0].name.toString();
          },
          function() {
            publish.channels = [];
          }
        );
      };

      publish.bulkPublish = function() {
        $scope.adminModal = publish.showModal('confirmationModal.html', 'md');
      };

      publish.continue = function() {
        var spinnerOverlay;
        publish.disable = true;
        spinnerOverlay = $scope.spinnerOverlay();
        adminService
          .bulkGoLive(publish.site, publish.pathPublish, publish.selectedChannel, publish.submissionComment)
          .then(
            function() {
              publish.disable = false;
              spinnerOverlay.close();
              $scope.confirmationBulk = publish.showModal('confirmationBulk.html', 'md');
            },
            function(err) {
              publish.error = err.message;
              $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
              spinnerOverlay.close();
              publish.disable = false;
            }
          );
      };

      // COMMITS PUBLISH

      publish.commitIds;
      publish.publishComment = '';

      publish.commitsPublish = function() {
        var spinnerOverlay,
          data = {},
          selectedChannelCommit = publish.commitIds.replace(/ /g, '').split(',');
        data['site_id'] = publish.site;
        data['commit_ids'] = selectedChannelCommit;
        data.environment = publish.selectedChannelCommit ? publish.selectedChannelCommit : Constants.BULK_ENVIRONMENT;
        data.comment = publish.publishComment;
        publish.commitIdsDisable = true;
        spinnerOverlay = $scope.spinnerOverlay();

        adminService.commitsPublish(data).then(
          function() {
            publish.commitIdsDisable = false;
            spinnerOverlay.close();
            $rootScope.showNotification($translate.instant('admin.publishing.PUBLISHBYCOMMITS_SUCCESS'));
          },
          function(err) {
            publish.error = err.message;
            $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
            spinnerOverlay.close();
            publish.commitIdsDisable = false;
          }
        );
      };

      CrafterCMSNext.system.getStore().subscribe((_store_) => {
        store = _store_;

        publish.maxCommentLength = store.getState().uiConfig.publishing.submissionCommentMaxLength;

        angular.element(document).ready(function() {
          renderDashboard();
          store.subscribe(renderDashboard);

          const el1 = document.getElementById('publishCommentCharCountStatus');
          CrafterCMSNext.render(el1, 'CharCountStatusContainer', {
            commentLength: publish && publish.publishComment ? publish.publishComment.length : 0
          });
          document.getElementById('publishComment').addEventListener('keyup', function(e) {
            CrafterCMSNext.render(el1, 'CharCountStatusContainer', {
              commentLength: publish.publishComment.length || 0
            });
          });

          const el2 = document.getElementById('bulkPublishCharCountStatus');
          CrafterCMSNext.render(el2, 'CharCountStatusContainer', {
            commentLength: publish && publish.submissionComment ? publish.submissionComment.length : 0
          });
          document.getElementById('submissionComment').addEventListener('keyup', function(e) {
            CrafterCMSNext.render(el2, 'CharCountStatusContainer', {
              commentLength: publish.submissionComment.length ? publish.submissionComment.length : 0
            });
          });
        });

        publish.getPublishingChannels();

        adminService
          .getTimeZone({
            site: publish.site,
            path: '/site-config.xml'
          })
          .then(function(data) {
            var publishing = data['publishing'];
            publish.timeZone = data['default-timezone'];
            publish.isValidateCommentOn =
              publishing && publishing['comments']
                ? (publishing['comments']['required'] === 'true' &&
                    publishing['comments']['bulk-publish-required'] !== 'false') ||
                  publishing['comments']['bulk-publish-required'] === 'true'
                  ? true
                  : false
                : false;
            publish.isValidateCommitPublishCommentOn =
              publishing && publishing['comments']
                ? (publishing['comments']['required'] === 'true' &&
                    publishing['comments']['publish-by-commit-required'] !== 'false') ||
                  publishing['comments']['publish-by-commit-required'] === 'true'
                  ? true
                  : false
                : false;
          });
      });

      function renderDashboard() {
        var state = store.getState().dialogs.publishingStatus;
        if (state.status) {
          var hasChanges = false;
          for (let prop of relevantProps) {
            if (currentStatus[prop] !== state[prop]) {
              hasChanges = true;
            }
            currentStatus[prop] = state[prop];
          }
          if (hasChanges) {
            publish.stopDisabled = false;
            publish.startDisabled = false;
            if (state.status.toLowerCase() === 'stopped') {
              publish.stopDisabled = true;
            } else {
              publish.startDisabled = true;
            }
            CrafterCMSNext.render('#publisherDashboard', 'PublishingStatusDialogBody', {
              onClose: null,
              isFetching: false,
              status: state.status,
              details: state.message,
              onRefresh: publish.getPublish,
              onUnlock: state.lockOwner
                ? () => {
                    store.dispatch({
                      type: 'SHOW_UNLOCK_PUBLISHER_DIALOG'
                    });
                  }
                : void 0
            });
            $scope.$apply();
          }
        }
      }
    }
  ]);

  app.controller('UsersCtrl', [
    '$rootScope',
    '$scope',
    function($rootScope, $scope) {
      CrafterCMSNext.render(document.querySelector('#users-management-view'), 'UsersManagement').then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);

  app.controller('clusterCtrl', [
    '$rootScope',
    '$scope',
    function($rootScope, $scope) {
      CrafterCMSNext.render(document.querySelector('#clusters-management-view'), 'ClustersManagement').then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);

  app.controller('GroupsCtrl', [
    '$rootScope',
    '$scope',
    function($rootScope, $scope) {
      CrafterCMSNext.render(document.querySelector('#groups-management-view'), 'GroupsManagement').then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);

  app.controller('RepositoriesCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    '$window',
    '$sce',
    'adminService',
    '$uibModal',
    '$timeout',
    '$stateParams',
    '$translate',
    '$location',
    '$q',
    function(
      $rootScope,
      $scope,
      $state,
      $window,
      $sce,
      adminService,
      $uibModal,
      $timeout,
      $stateParams,
      $translate,
      $location,
      $q
    ) {
      $scope.repositories = {
        site: $location.search().site,
        selectedTab: 'diff',
        status: {
          clean: false,
          conflicting: false
        },
        diff: {},
        mergeStrategy: 'none',
        repoMessages: {
          pendingCommit: formatMessage(repoMessages.pendingCommit),
          unstagedFiles: formatMessage(repoMessages.unstagedFiles),
          unreachableRemote: (name) => formatMessage(repoMessages.unreachableRemote, { name }),
          reason: formatMessage(words.reason),
          repositoriesNote: formatMessage(repoMessages.repositoriesNote)
        }
      };

      var repositories = $scope.repositories;
      repositories.spinnerOverlay;

      $scope.$watch('repositories.mergeStrategy', function() {
        repositories.mergeStrategyDescription = $translate.instant(
          'admin.repositories.MERGE_STRATEGY_DESCRIPTIONS.' + repositories.mergeStrategy
        );
      });

      repositories.getRepositoryStatus = function() {
        adminService.repositoryStatus($location.search().site).then(function(data) {
          repositories.status = data;
        });
      };
      repositories.getFileName = function(filePath) {
        return filePath.substr(filePath.lastIndexOf('/') + 1);
      };

      function repositoriesReceived(data) {
        const reachable = [],
          unreachable = [];
        data.forEach((remote) => {
          if (remote.reachable) {
            reachable.push(remote);
          } else {
            unreachable.push(remote);
          }
        });
        repositories.repositories = Object.assign({}, data, { reachable, unreachable });
        repositories.spinnerOverlay && repositories.spinnerOverlay.close();
      }

      this.init = function() {
        $scope.showError = function(error) {
          $scope.messageTitle = `${$translate.instant('common.ERROR')} ${$translate.instant('common.CODE')}: ${
            error.code
          }`;
          $scope.messageText = error.remedialAction ? `${error.message}. ${error.remedialAction}` : error.message + '.';
          $scope.messageLink = error.documentationUrl;
          $scope.messageModal = $scope.showModal('messageModal.html', 'sm', true, 'studioMedium');
        };

        $scope.showModal = function(template, size, verticalCentered, styleClass) {
          $scope.groupsError = null;
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
          $scope.adminModal.close();
        };

        $scope.hideMessageModal = function() {
          $scope.messageModal.close();
        };

        repositories.spinnerOverlay = $scope.spinnerOverlay();

        CrafterCMSNext.system.getStore().subscribe(() => {
          repositories.getRepositoryStatus();
          adminService.getRepositories(repositories).then(repositoriesReceived, function(error) {
            $scope.showError(error.response.response);
          });
        });
      };

      this.init();

      $scope.createGroupDialog = function() {
        $scope.repo = {};
        $scope.okModalFunction = $scope.createRepo;

        $scope.adminModal = $scope.showModal('modalView.html');

        $scope.dialogMode = 'CREATE';
        $scope.dialogTitle = $translate.instant('admin.repositories.CREATE_REPOSITORY');
      };

      $scope.createRepo = function(repo) {
        if (createNameForm.checkValidity()) {
          repositories.spinnerOverlay = $scope.spinnerOverlay();
          repo.siteId = repositories.site;
          repo.authenticationType = repo.authenticationType ? repo.authenticationType : 'none';

          adminService.createRepository(repo).then(
            function() {
              $scope.hideModal();
              adminService.getRepositories(repositories).then(repositoriesReceived, function(error) {
                $scope.showError(error.response);
                repositories.spinnerOverlay.close();
              });
            },
            function(error) {
              $scope.showError(error.response.response);
              repositories.spinnerOverlay.close();
            }
          );
        }
      };

      $scope.removeRepo = function(repo) {
        var deleteRepo = function() {
          var currentRepo = {};
          currentRepo.siteId = repositories.site;
          currentRepo.remoteName = repo.name;
          adminService.deleteRepository(currentRepo).then(
            function(data) {
              repositories.repositories.reachable = repositories.repositories.reachable.filter((r) => r !== repo);
              repositories.repositories.unreachable = repositories.repositories.unreachable.filter((r) => r !== repo);
              $rootScope.showNotification(`'${repo.name}' ${$translate.instant('admin.repositories.REPO_DELETED')}.`);
            },
            function(error) {
              $scope.showError(error.response.response);
            }
          );
        };

        $scope.confirmationAction = deleteRepo;
        $scope.confirmationText = $translate.instant('common.DELETE_QUESTION') + ' ' + repo.name + '?';
        $scope.adminModal = $scope.showModal('confirmationModal.html', 'sm', true, 'studioMedium');
      };

      $scope.pullRepo = function(repo) {
        $scope.branch = repo.branches[0];
        $scope.branches = repo.branches;
        var pullRepo = function(branch) {
          repositories.spinnerOverlay = $scope.spinnerOverlay();
          var currentRepo = {};
          currentRepo.siteId = repositories.site;
          currentRepo.remoteName = repo.name;
          currentRepo.remoteBranch = branch;
          currentRepo.mergeStrategy = repositories.mergeStrategy;

          adminService.pullRepository(currentRepo).then(
            function(data) {
              repositories.spinnerOverlay.close();
              repositories.getRepositoryStatus();
              $rootScope.showNotification($translate.instant('admin.repositories.SUCCESSFULLY_PULLED'));
            },
            function(error) {
              repositories.getRepositoryStatus();
              repositories.spinnerOverlay.close();
              $scope.showError(error.response.response);
            }
          );
        };

        repositories.repoAction = 'pull';
        $scope.confirmationAction = pullRepo;
        $scope.confirmationText = $translate.instant('admin.repositories.REMOTE_BRANCH_PULL') + ':';
        $scope.dialogTitle = $translate.instant('admin.repositories.PULL');

        $scope.adminModal = $scope.showModal('pushPull.html', 'sm', true, 'studioMedium');
      };

      $scope.pushRepo = function(repo) {
        $scope.branch = repo.branches[0];
        $scope.branches = repo.branches;
        var pushRepo = function(branch) {
          repositories.spinnerOverlay = $scope.spinnerOverlay();
          var currentRepo = {};
          currentRepo.siteId = repositories.site;
          currentRepo.remoteName = repo.name;
          currentRepo.remoteBranch = branch;

          adminService.pushRepository(currentRepo).then(
            function(data) {
              repositories.spinnerOverlay.close();
              $rootScope.showNotification($translate.instant('admin.repositories.SUCCESSFULLY_PUSHED'));
            },
            function(error) {
              repositories.spinnerOverlay.close();
              $scope.showError(error.response.response);
            }
          );
        };

        repositories.repoAction = 'push';
        $scope.confirmationAction = pushRepo;
        $scope.confirmationText = $translate.instant('admin.repositories.REMOTE_BRANCH_PUSH') + repo.name + ':';
        $scope.dialogTitle = $translate.instant('admin.repositories.PUSH');

        $scope.adminModal = $scope.showModal('pushPull.html', 'sm', true, 'studioMedium');
      };

      // Repository status

      repositories.commitResolutionModal = function() {
        $scope.adminModal = $scope.showModal('commitResolution.html', 'md', true);
      };

      repositories.commitResolution = function() {
        adminService
          .commitResolution({
            siteId: repositories.site,
            commitMessage: repositories.commitMsg
          })
          .then(function(data) {
            repositories.status = data.repositoryStatus;
            repositories.commitMsg = '';
          });
      };

      repositories.diffContent = function(path) {
        repositories.diffPath = path;

        adminService
          .diffConflictedFile({
            siteId: repositories.site,
            path: path
          })
          .then(function(data) {
            repositories.diff = {
              diff: data.diff.diff,
              studioVersion: data.diff.studioVersion,
              remoteVersion: data.diff.remoteVersion
            };

            $scope.adminModal = $scope.showModal('diffModal.html', 'lg', true);
          })
          .error(function() {
            $scope.adminModal = $scope.showModal('diffModal.html', 'lg', true);
          });
      };

      repositories.resolveConflict = function(path, resolution) {
        adminService
          .resolveConflict({
            siteId: repositories.site,
            path,
            resolution
          })
          .then(function(data) {
            repositories.status = data;
            $scope.$apply();
          });
      };

      repositories.revertAll = function() {
        adminService
          .cancelFailedPull({
            siteId: repositories.site
          })
          .then(function(repositoryStatus) {
            repositories.status = repositoryStatus;
            $scope.$apply();
          });
      };
    }
  ]);
})(angular, $);
