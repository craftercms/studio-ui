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
        return repositoriesApi.push(data).toPromise();
      };

      this.repositoryStatus = function(site) {
        return repositoriesApi.status(site).toPromise();
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
        return auditApi.fetchAudit(data).toPromise();
      };

      this.getSpecificAudit = function(auditId) {
        return auditApi.fetchSpecificAudit(auditId).toPromise();
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
        return publishingApi.status(site).toPromise();
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
    '$scope',
    '$state',
    '$window',
    '$sce',
    'adminService',
    '$timeout',
    '$stateParams',
    '$translate',
    '$location',
    'moment',
    'sitesService',
    '$cookies',
    'Constants',
    function(
      $scope,
      $state,
      $window,
      $sce,
      adminService,
      $timeout,
      $stateParams,
      $translate,
      $location,
      moment,
      sitesService,
      $cookies,
      Constants
    ) {
      $scope.audit = {};
      $scope.isCollapsed = true;
      $scope.isSortAsc = false;
      var audit = $scope.audit;
      audit.logsPerPage = 15;
      audit.defaultDelay = 500;
      audit.site = $location.search().site ? $location.search().site : '';
      audit.timeZone;
      audit.allTimeZones = moment.tz.names();
      audit.sort = 'date';
      $scope.originValues = [$translate.instant('admin.audit.ALL_ORIGINS'), 'API', 'GIT'];

      var delayTimer;

      if ($cookies.get(Constants.AUDIT_TIMEZONE_COOKIE)) {
        audit.timeZone = $cookies.get(Constants.AUDIT_TIMEZONE_COOKIE);
      } else {
        audit.timeZone = moment.tz.guess();
      }

      audit.newTimezone = function() {
        $cookies.put(Constants.AUDIT_TIMEZONE_COOKIE, audit.timeZone);
      };

      var getUsers = function(site) {
        adminService.getUsers(site).then(
          function(data) {
            audit.users = data.users;
            audit.userSelected = '';
          },
          function() {
            audit.users = null;
          }
        );
      };

      var getAudit = function(site) {
        audit.totalLogs = 0;
        getResultsPage(1);

        audit.pagination = {
          current: 1
        };

        audit.pageChanged = function(newPage) {
          getResultsPage(newPage);
        };

        function getResultsPage(pageNumber) {
          var dateToUTC, dateFromUTC;
          var params = {};
          if (site) {
            params.siteName = site;
          }
          if (audit.userSelected && audit.userSelected != '') params.user = audit.userSelected;

          if (audit.actions.length > 0) {
            params.operations = audit.actions.toString();
          }
          if (audit.dateFrom) {
            if (audit.timeZone.indexOf('UTC') > -1) {
              params.dateFrom = audit.dateFrom;
            } else {
              var m = moment(audit.dateFrom).tz(audit.timeZone);
              params.dateFrom = m
                .utc()
                .format()
                .toString();
            }
          }

          if (audit.dateTo) {
            if (audit.timeZone.indexOf('UTC') > -1) {
              params.dateTo = audit.dateTo;
            } else {
              var m = moment(audit.dateTo).tz(audit.timeZone);
              params.dateTo = m
                .utc()
                .format()
                .toString();
            }
          }

          if (audit.target) {
            params.target = audit.target;
          }

          if (audit.includeParameters) {
            params.includeParameters = true;
          }

          if (audit.origin) {
            if (audit.origin !== $translate.instant('admin.audit.ALL_ORIGINS')) {
              params.origin = audit.origin;
            }
          }

          if (audit.clusterNodeId) {
            params.clusterNodeId = audit.clusterNodeId;
          }

          if ($scope.isSortAsc) {
            params.order = 'ASC';
          }
          params.sort = audit.sort;

          if (audit.totalLogs && audit.totalLogs > 0) {
            var start = (pageNumber - 1) * audit.logsPerPage,
              end = start + audit.logsPerPage;
            params.offset = start;
            params.limit = audit.logsPerPage;
          } else {
            params.offset = 0;
            params.limit = audit.logsPerPage;
          }

          adminService.getAudit(params).then(
            function(data) {
              audit.totalLogs = data.total;
              audit.logs = data;
              $scope.$apply();
            },
            function(err) {
              audit.totalLogs = 0;
              audit.logs = '';
            }
          );
        }
      };

      var getSpecificAudit = function(id) {
        var collapseContainer = $('#collapseContainer' + id);
        var html;
        adminService.getSpecificAudit(id).then(
          function(data) {
            var parameters = data.parameters;
            // parameters = [{id: 0, auditId: 0, targetId: "2", targetType: "User", targetSubtype: null, targetValue: "reviewer"}, {id: 0, auditId: 0, targetId: "2", targetType: "User", targetSubtype: null, targetValue: "reviewer"}]

            if (parameters.length > 0) {
              html = "<div class='mt10 has-children'>";

              for (var i = 0; parameters.length > i; i++) {
                if (
                  parameters[i].targetId ||
                  parameters[i].targetType ||
                  parameters[i].targetSubtype ||
                  parameters[i].targetValue
                ) {
                  html += "<div class='each-param'>";
                }
                if (parameters[i].targetId) {
                  html +=
                    '<span><strong>' +
                    $translate.instant('admin.audit.ID') +
                    ': </strong>' +
                    parameters[i].targetId +
                    '</span><br/>';
                }
                if (parameters[i].targetType) {
                  html +=
                    '<span><strong>' +
                    $translate.instant('admin.audit.TYPE') +
                    ': </strong>' +
                    parameters[i].targetType +
                    '</span><br/>';
                }
                if (parameters[i].targetSubtype) {
                  html +=
                    '<span><strong>' +
                    $translate.instant('admin.audit.SUBTYPE') +
                    ': </strong>' +
                    parameters[i].targetSubtype +
                    '</span><br/>';
                }
                if (parameters[i].targetValue) {
                  html +=
                    '<span><strong>' +
                    $translate.instant('admin.audit.VALUE') +
                    ': </strong>' +
                    parameters[i].targetValue +
                    '</span>';
                }
                if (
                  parameters[i].targetId ||
                  parameters[i].targetType ||
                  parameters[i].targetSubtype ||
                  parameters[i].targetValue
                ) {
                  html += '</div>';
                }
                if (parameters.length > i + 1) {
                  html += '<hr />';
                }
              }
              html += '</div>';
            } else {
              html =
                "<div class='mt10 has-children'><span>" + $translate.instant('admin.audit.NO_PARAM') + '</span></div>';
            }

            collapseContainer.append(html);
            collapseMethod(id);
          },
          function(err) {
            html =
              "<div class='mt10 has-children'><span>" + $translate.instant('admin.audit.ERROR_PARAM') + '</span></div>';
            collapseContainer.append(html);
            collapseMethod(id);
          }
        );
      };

      audit.initCalendar = function() {
        $('#dateTo').datetimepicker();
        $('#dateFrom').datetimepicker();
      };

      audit.updateUser = function(user) {
        if (user) {
          audit.userSelected = user.username;
        } else {
          audit.userSelected = '';
        }

        $timeout.cancel(delayTimer);
        delayTimer = $timeout(function() {
          getAudit(audit.site);
        }, audit.defaultDelay);
      };

      audit.updateSite = function(site, translate) {
        if (site) {
          audit.site = site;
        } else {
          audit.site = '';
        }

        if (translate) {
          audit.siteLabel = $translate.instant(site);
        } else {
          audit.siteLabel = '';
        }

        $timeout.cancel(delayTimer);
        delayTimer = $timeout(function() {
          getAudit(audit.site === 'admin.audit.SYSTEM' ? Constants.AUDIT_SYSTEM : audit.site);
        }, audit.defaultDelay);
      };

      audit.actions = [];
      audit.updateActions = function(action) {
        if (action === 'all') {
          audit.actions = [];
        } else {
          if (audit.actions.indexOf(action) != -1) {
            var index = audit.actions.indexOf(action);

            if (index !== -1) {
              audit.actions.splice(index, 1);
            }
          } else {
            audit.actions.push(action);
          }
        }

        var replaceChars = { ',': ', ', _: ' ' };
        audit.actionsInputVal = audit.actions.toString().replace(/,|_/g, function(match) {
          return replaceChars[match];
        });

        $timeout.cancel(delayTimer);
        delayTimer = $timeout(function() {
          getAudit(audit.site);
        }, audit.defaultDelay);
      };

      audit.generalUpdate = function(action) {
        $timeout.cancel(delayTimer);
        delayTimer = $timeout(function() {
          getAudit(audit.site);
        }, audit.defaultDelay);
      };

      audit.collapseParam = function(id) {
        var collapseContainer = $('#collapseContainer' + id);

        if (collapseContainer.find('.has-children').length > 0) {
          collapseMethod(id);
        } else {
          getSpecificAudit(id);
        }
      };

      var collapseMethod = function(id) {
        var collapseContainer = $('#collapseContainer' + id),
          collapseContainerParent = collapseContainer.parent();

        collapseContainer.collapse();
        if (collapseContainer.hasClass('collapsing') || !collapseContainer.hasClass('in')) {
          collapseContainerParent.find('.plus').hide();
          collapseContainerParent.find('.minus').show();
        } else {
          collapseContainerParent.find('.plus').show();
          collapseContainerParent.find('.minus').hide();
        }
      };

      audit.getAuditInfo = function() {
        if (audit.site) {
          audit.currentSiteName = $scope.sites[audit.site].name;
          getAudit(audit.site);
          getUsers(audit.site);
        } else {
          audit.site = '';
          getAudit(audit.site);
          getUsers(audit.site);
        }
      };

      CrafterCMSNext.system.getStore().subscribe((store) => {
        $scope.sites = store.getState().sites.byId;
        audit.getAuditInfo();
      });
    }
  ]);

  app.controller('LoggingLevelsCtrl', [
    '$scope',
    '$state',
    '$window',
    'adminService',
    '$translate',
    function($scope, $state, $window, adminService, $translate) {
      $scope.logging = {};
      var logging = $scope.logging;

      CrafterCMSNext.system.getStore().subscribe(() => {
        adminService.getLoggers().then(function(data) {
          logging.levels = data;
          $scope.$apply();
        });
      });

      logging.setLevel = function(log, level) {
        adminService
          .setLogger({
            logger: log,
            level: level
          })
          .then(function() {
            adminService.getLoggers().then(function(data) {
              logging.levels = data;
              $scope.$apply();
            });
          });
      };
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
      $location,
      moment
    ) {
      // PUBLISHING

      // MODAL

      $scope.publish = {};
      var currentIconColor;
      var publish = $scope.publish;
      publish.error = '';

      CrafterCMSNext.system.getStore().subscribe((store) => {
        publish.maxCommentLength = store.getState().configuration.publishing.submission.commentMaxLength;
      });

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
        adminService.getPublishStatus(publish.site).then(
          function(data) {
            publish.stopDisabled = false;
            publish.startDisabled = false;
            switch (data.status.toLowerCase()) {
              case 'busy':
                currentIconColor = 'orange';
                break;
              case 'stopped':
                currentIconColor = 'red';
                publish.stopDisabled = true;
                break;
              default:
                currentIconColor = 'blue';
                publish.startDisabled = true;
            }
            var stringDate = data.message.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z/);
            var date = null;
            if (stringDate && stringDate.length) {
              publish.date = stringDate[0];
              data.message = data.message.replace(stringDate[0], '');
            } else {
              publish.date = '';
            }
            publish.iconColor = currentIconColor;
            publish.message = data.message;
            publish.statusText = formatMessage(publishingMessages[data.status.toLowerCase()]);
            $scope.$apply();
          },
          function(err) {}
        );
      };

      var renderStatusView = function() {
        publish.getPublish(publish.site);
        $timeout(
          function() {
            renderStatusView();
          },
          3000,
          false
        );
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

      var currentIconColor;
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

      CrafterCMSNext.system.getStore().subscribe(() => {
        publish.getPublishingChannels();
      });

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

      angular.element(document).ready(function() {
        const el = document.getElementById('bulkPublishCharCountStatus');
        CrafterCMSNext.render(el, 'CharCountStatusContainer', {
          commentLength: publish && publish.submissionComment ? publish.submissionComment.length : 0
        });

        document.getElementById('submissionComment').addEventListener('keyup', function(e) {
          CrafterCMSNext.render(el, 'CharCountStatusContainer', {
            commentLength: publish.submissionComment.length ? publish.submissionComment.length : 0
          });
        });
      });

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
          function(data) {
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

      angular.element(document).ready(function() {
        const el = document.getElementById('publishCommentCharCountStatus');
        CrafterCMSNext.render(el, 'CharCountStatusContainer', {
          commentLength: publish && publish.publishComment ? publish.publishComment.length : 0
        });

        document.getElementById('publishComment').addEventListener('keyup', function(e) {
          CrafterCMSNext.render(el, 'CharCountStatusContainer', {
            commentLength: publish.publishComment.length || 0
          });
        });
      });

      CrafterCMSNext.system.getStore().subscribe(() => {
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
        renderStatusView();
      });
    }
  ]);

  app.controller('UsersCtrl', [
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
    'passwordRequirements',
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
      passwordRequirements
    ) {
      const maxInputLength = 32;
      const maxUsernameLength = 255;

      $scope.users = {
        maxInputLength: maxInputLength,
        maxUsernameLength: maxUsernameLength,
        messages: {
          userNameMaxLength: formatMessage(usersAdminMessages.maxLengthError, {
            field: formatMessage(usersAdminMessages.userName),
            size: maxUsernameLength
          }),
          firstNameMaxLength: formatMessage(usersAdminMessages.maxLengthError, {
            field: formatMessage(usersAdminMessages.firstName),
            size: maxInputLength
          }),
          lastNameMaxLength: formatMessage(usersAdminMessages.maxLengthError, {
            field: formatMessage(usersAdminMessages.lastName),
            size: maxInputLength
          }),
          fulfillAllReqErrorMessage: formatMessage(passwordRequirementMessages.fulfillAllReqErrorMessage)
        }
      };
      $scope.validPass = false;
      $scope.validResetPass = false;
      var users = $scope.users;
      $scope.user.enabled = true;

      this.init = function() {
        $scope.debounceDelay = 500;

        $scope.showModal = function(template, size, verticalCentered, styleClass) {
          $scope.usersError = null;

          var modalInstance = $uibModal.open({
            templateUrl: template,
            windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
            backdrop: 'static',
            keyboard: true,
            controller: 'UsersCtrl',
            scope: $scope,
            size: size ? size : ''
          });
          modalInstance.opened.then(function() {
            $timeout(function() {
              $('input, a').attr('tabindex', '-1');
              $('#user-form input, #user-form select, #user-form textarea').each(function(index, input) {
                input.tabIndex = index + 1;
              });
              $('#user-form')
                .find('input select textarea')
                .first()
                .focus();
            }, 1000);
          });

          return modalInstance;
        };
        $scope.hideModal = function() {
          $scope.adminModal.close();
          $('input').each(function(index, input) {
            input.tabIndex = index + 1;
          });
        };
      };

      $scope.passwordRequirements = function() {
        passwordRequirements.init($scope, 'validPass', 'password', 'top');
      };

      $scope.newPasswordRequirements = function() {
        passwordRequirements.init($scope, 'validResetPass', 'newPassword', 'top');
      };

      this.init();

      // table setup
      users.itemsPerPage = 10;
      $scope.usersCollection = [];

      var getUsers = function() {
        users.totalUsers = 0;
        users.searchdirty = false;
        getResultsPage(1);

        users.pagination = {
          current: 1,
          goToLast: () => {
            const total = users.totalLogs,
              itemsPerPage = users.itemsPerPage,
              lastPage = Math.ceil(total / itemsPerPage);
            users.pagination.current = lastPage;
          }
        };

        users.pageChanged = function(newPage) {
          getResultsPage(newPage);
        };

        function getResultsPage(pageNumber) {
          var params = {};

          if (users.totalLogs && users.totalLogs > 0) {
            var offset = (pageNumber - 1) * users.itemsPerPage,
              end = offset + users.itemsPerPage;
            params.offset = offset;
            params.limit = users.itemsPerPage;
          } else {
            params.offset = 0;
            params.limit = users.itemsPerPage;
          }
          params.sort = 'desc';

          adminService.getUsers(params).then(function(data) {
            users.totalLogs = data.total;
            $scope.usersCollection = data;
            $scope.$apply();
          });
        }
      };

      CrafterCMSNext.system.getStore().subscribe(() => {
        getUsers();
      });

      users.searchUser = function(query) {
        if ('' === query) {
          $scope.usersCollection = users.usersCollectionBackup;
          users.itemsPerPage = users.itemsPerPageBackup;
          users.searchdirty = false;
        } else {
          if (!users.searchdirty) {
            users.searchdirty = true;

            adminService.getUsers().then(function(data) {
              users.usersCollectionBackup = $scope.usersCollection;
              users.itemsPerPageBackup = users.itemsPerPage;
              $scope.usersCollection = data;
              users.itemsPerPage = adminService.maxInt;
              $scope.$apply();
            });
          }
        }
      };

      users.createUserDialog = function() {
        $scope.user = {};
        $scope.okModalFunction = users.createUser;

        $scope.adminModal = $scope.showModal('modalView.html');
        $scope.dialogMode = 'CREATE';
        $scope.dialogEdit = false;
      };
      users.createUser = function(user) {
        adminService.createUser(user).then(
          function(data) {
            $scope.hideModal();
            user = data;
            $scope.usersCollection.push(user);
            $scope.users.totalLogs++;
            $scope.users.pagination.goToLast();
            $rootScope.showNotification(formatMessage(usersAdminMessages.userCreated, { username: user.username }));
            $scope.$apply();
          },
          function(response) {
            $rootScope.showNotification(
              response.response.message + '. ' + response.response.remedialAction,
              null,
              null,
              'error'
            );
          }
        );
      };
      users.resetPasswordDialog = function(user) {
        $scope.editedUser = user;
        $scope.user = {};
        $scope.okModalFunction = users.editPassword;

        $scope.adminModal = $scope.showModal('resetPassword.html', null, null, 'modal-top-override modal-reset-pass');

        adminService.getUser(user.username).then(
          function(data) {
            data = { user: data };
            $scope.user = data.user;
            $scope.user.enabled = data.user.enabled;
            $scope.$apply();
          },
          function(error) {
            console.log(error);
          }
        );
      };
      users.editPassword = function(user) {
        user.password = user.newPassword;
        adminService
          .resetPassword({
            username: user.username,
            new: user.newPassword
          })
          .then(
            function() {
              $rootScope.showNotification(formatMessage(usersAdminMessages.userEdited, { username: user.username }));
              $scope.hideModal();
            },
            function(error) {
              $rootScope.showNotification(
                error.response.message + '. ' + error.response.remedialAction,
                null,
                null,
                'error'
              );
            }
          );
        delete user.newPassword;
      };
      users.editUserDialog = function(user) {
        $scope.editedUser = user;
        $scope.user = {};
        $scope.okModalFunction = users.editUser;

        $scope.adminModal = $scope.showModal('modalView.html');
        $scope.dialogMode = 'EDIT';
        $scope.dialogEdit = true;

        adminService.getUser(user.username).then(
          function(data) {
            data = { user: data };
            $scope.user = data.user;
            $scope.user.enabled = data.user.enabled;
            $scope.$apply();
          },
          function(error) {
            console.log(error);
            // TODO: properly display error
          }
        );
      };
      users.editUser = function(user) {
        var currentUser = {};
        currentUser.id = user.id;
        currentUser.username = user.username;
        currentUser.password = user.password;
        currentUser.firstName = user.firstName;
        currentUser.lastName = user.lastName;
        currentUser.email = user.email;
        currentUser.enabled = user.enabled;
        currentUser.externallyManaged = user.externallyManaged;

        adminService.editUser(currentUser).then(
          function(data) {
            var index = $scope.usersCollection.indexOf($scope.editedUser);

            if (index != -1) {
              $scope.usersCollection[index] = user;
              $scope.displayedCollection = $scope.usersCollection;
            }

            $scope.hideModal();
            $rootScope.showNotification(formatMessage(usersAdminMessages.userEdited, { username: user.username }));
          },
          function(error) {
            $rootScope.showNotification(
              error.response.message + '. ' + error.response.remedialAction,
              null,
              null,
              'error'
            );
          }
        );

        users.toggleUserStatus(user);
      };
      users.viewUser = function(user) {
        $scope.user = {};
        $scope.dialogMode = false;
        $scope.dialogEdit = false;

        $scope.adminModal = $scope.showModal('modalView.html');

        adminService.getUser(user.username).then(
          function(data) {
            data = { user: data };
            $scope.user = data.user;
            $scope.user.enabled = data.user.enabled;
            $scope.$apply();
          },
          function(error) {
            console.log(error);
            // TODO: properly display error
          }
        );
      };
      users.toggleUserStatus = function(user) {
        var newStatus = $('#enabled').is(':checked') ? 'enable' : 'disable';
        // user.status.enabled = $('#enabled').is(':checked');

        adminService.toggleUserStatus(user, newStatus);
      };
      users.removeUser = function(user) {
        var deleteUser = function() {
          adminService.deleteUser(user).then(
            function(data) {
              var index = $scope.usersCollection.indexOf(user);
              if (index !== -1) {
                $scope.usersCollection.splice(index, 1);
                $scope.users.totalLogs--;
              }
              $rootScope.showNotification(formatMessage(usersAdminMessages.userDeleted, { username: user.username }));
            },
            function(data) {
              $scope.error = data.response.message;
              $scope.adminModal = $scope.showModal('deleteUserError.html', 'md', true);
            }
          );
        };

        $scope.confirmationAction = deleteUser;
        $scope.confirmationText = `${$translate.instant('common.DELETE_QUESTION')} ${user.username}?`;

        $scope.adminModal = $scope.showModal('confirmationModal.html', '', true, 'studioMedium');
      };
    }
  ]);

  app.controller('clusterCtrl', [
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
      $scope.clusters = {};
      var clusters = $scope.clusters;

      this.init = function() {
        $scope.debounceDelay = 500;

        $scope.showModal = function(template, size, verticalCentered, styleClass) {
          $scope.clustersError = null;

          var modalInstance = $uibModal.open({
            templateUrl: template,
            windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
            backdrop: 'static',
            keyboard: true,
            controller: 'clusterCtrl',
            scope: $scope,
            size: size ? size : ''
          });

          return modalInstance;
        };
        $scope.hideModal = function() {
          $scope.adminModal.close();
          $('input').each(function(index, input) {
            input.tabIndex = index + 1;
          });
        };
      };
      this.init();

      // table setup
      $scope.membersCollection = [];

      clusters.getClusters = function() {
        adminService.getClusterMembers().then(function(data) {
          $scope.membersCollection = data;
          $scope.$apply();
        });
      };

      CrafterCMSNext.system.getStore().subscribe(() => {
        clusters.getClusters();
      });

      clusters.viewClusterMember = function(clusterMember) {
        $scope.clusterMember = clusterMember;
        $scope.dialogMode = false;
        $scope.dialogEdit = false;

        $scope.adminModal = $scope.showModal('modalView.html');
      };
      clusters.removeClusterMember = function(clusterMember) {
        var deleteClusterMember = function() {
          adminService.deleteClusterMember(clusterMember).then(
            function(data) {
              var index = $scope.membersCollection.indexOf(clusterMember);
              if (index !== -1) {
                $scope.membersCollection.splice(index, 1);
              }
              $rootScope.showNotification(
                formatMessage(adminDashboardMessages.clusterDeleted, {
                  cluster: clusterMember.gitUrl
                })
              );
            },
            function(data) {
              $scope.error = data.response.message;
              $scope.adminModal = $scope.showModal('deleteClusterError.html', 'md', true);
            }
          );
        };

        $scope.confirmationAction = deleteClusterMember;
        $scope.confirmationText = `${$translate.instant('common.DELETE_QUESTION')} ${clusterMember.gitUrl}?`;

        $scope.adminModal = $scope.showModal('confirmationModal.html', '', true, 'studioMedium');
      };
    }
  ]);

  app.controller('GroupsCtrl', [
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
      $scope.groups = {};
      var groups = $scope.groups;
      groups.site = $location.search().site;
      groups.maxInputLength = 512;
      groups.messages = {
        groupNameMaxLength: formatMessage(groupsAdminMessages.maxLengthError, {
          field: formatMessage(groupsAdminMessages.displayName),
          size: groups.maxInputLength
        })
      };
      groups.members = {};

      this.init = function() {
        $scope.debounceDelay = 500;

        $scope.showModal = function(template, size, verticalCentered, styleClass) {
          $scope.groupsError = null;
          var modalInstance = $uibModal.open({
            templateUrl: template,
            windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
            backdrop: 'static',
            keyboard: true,
            controller: 'GroupsCtrl',
            scope: $scope,
            size: size ? size : ''
          });

          return modalInstance;
        };
        $scope.hideModal = function() {
          $scope.adminModal.close();
        };
      };
      this.init();

      // table setup
      groups.itemsPerPage = 10;
      groups.members.itemsPerPage = 10;
      $scope.groupsCollection = [];

      /// //////////////// MULTIPLE GROUPS VIEW ////////////////////

      var getGroups = function() {
        groups.totalLogs = 0;
        getResultsPage(1);

        groups.pagination = {
          current: 1,
          goToLast: () => {
            const total = groups.totalLogs,
              itemsPerPage = groups.itemsPerPage,
              lastPage = Math.ceil(total / itemsPerPage);
            groups.pagination.current = lastPage;
          }
        };

        groups.pageChanged = function(newPage) {
          getResultsPage(newPage);
        };

        function getResultsPage(pageNumber) {
          var params = {};

          // params.site_id = site;

          if (groups.totalLogs && groups.totalLogs > 0) {
            var offset = (pageNumber - 1) * groups.itemsPerPage,
              end = offset + groups.itemsPerPage;
            params.offset = offset;
            params.limit = groups.itemsPerPage;
          } else {
            params.offset = 0;
            params.limit = groups.itemsPerPage;
          }

          adminService.getGroups(params).then(function(data) {
            groups.totalLogs = data.total;
            $scope.groupsCollection = data;
            $scope.$apply();
          });
        }
      };

      CrafterCMSNext.system.getStore().subscribe(() => {
        getGroups();
      });

      groups.searchGroup = function(query) {
        if ('' === query) {
          $scope.groupsCollection = groups.groupsCollectionBackup;
          groups.itemsPerPage = groups.itemsPerPageBackup;
          groups.searchdirty = false;
        } else {
          if (!groups.searchdirty) {
            groups.searchdirty = true;

            adminService.getGroups().then(function(data) {
              groups.groupsCollectionBackup = $scope.groupsCollection;
              groups.itemsPerPageBackup = groups.itemsPerPage;
              $scope.groupsCollection = data;
              groups.itemsPerPage = adminService.maxInt;
            });
          }
        }
      };

      $scope.createGroupDialog = function() {
        $scope.group = {};
        $scope.okModalFunction = $scope.createGroup;

        $scope.adminModal = $scope.showModal('modalView.html');

        $scope.dialogMode = 'CREATE';
        $scope.dialogTitle = $translate.instant('admin.groups.CREATE_GROUP');
      };
      $scope.createGroup = function(group) {
        // group.site_id = groups.site;

        adminService.createGroup(group).then(
          function(data) {
            $scope.hideModal();
            $scope.groupsCollection.push(data);
            $scope.groups.totalLogs++;
            $scope.groups.pagination.goToLast();
            $rootScope.showNotification(formatMessage(groupsAdminMessages.groupCreated, { group: group.name }));
          },
          function(error) {
            $scope.groupsError = `${error.response.message}. ${error.response.remedialAction}`;
          }
        );
      };
      $scope.editGroup = function(group) {
        // group.site_id = groups.site;

        adminService
          .editGroup({
            id: group.id,
            name: group.name,
            desc: group.desc
          })
          .then(
            function(data) {
              $rootScope.showNotification(formatMessage(groupsAdminMessages.groupEdited, { group: group.name }));
            },
            function(error) {
              if ('Unauthorized' === error.response.message) {
                $rootScope.showNotification($translate.instant('admin.groups.UNAUTHORIZED'), null, null, 'error');
              } else {
                $rootScope.showNotification(error.response.message, null, null, 'error');
              }
            }
          );
      };
      $scope.removeGroup = function(group) {
        var deleteGroup = function() {
          // group.site_id = groups.site;

          adminService.deleteGroup(group).then(
            function(data) {
              var index = $scope.groupsCollection.indexOf(group);
              if (index !== -1) {
                $scope.groupsCollection.splice(index, 1);
                $scope.groups.totalLogs--;
              }

              $scope.usersFromGroupCollection = [];
              $scope.noGroupSelected = true;

              $rootScope.showNotification(formatMessage(groupsAdminMessages.groupDeleted, { group: group.name }));
            },
            function(error) {
              if ('Unauthorized' === error.response.message) {
                $rootScope.showNotification($translate.instant('admin.groups.UNAUTHORIZED'), null, null, 'error');
              } else {
                $rootScope.showNotification(error.response.message, null, null, 'error');
              }
            }
          );
        };

        $scope.confirmationAction = deleteGroup;
        $scope.confirmationText = `${$translate.instant('common.DELETE_QUESTION')} ${group.name}?`;

        $scope.adminModal = $scope.showModal('confirmationModal.html', 'sm', true, 'studioMedium');
      };

      /// //////////////// SINGLE GROUP VIEW ////////////////////

      groups.viewGroup = function(group) {
        groups.selectedGroup = group;
        groups.groupView = true;
        groups.usersToAdd = [];

        // RESET TABLE STATE
        if ($scope.mq && $scope.mq !== '') {
          $scope.mq = '';
          groups.members.itemsPerPage = groups.members.itemsPerPageBackup
            ? groups.members.itemsPerPageBackup
            : groups.members.itemsPerPage;
          groups.members.searchdirty = false;
          $('#groups-members-clear-filter').click(); // trigger reset filters directive
        }

        $scope.getGroupMembers(group);
      };

      groups.getUsersAutocomplete = function() {
        var params = {};
        params.limit = 1000;
        adminService.getUsers(params).then(function(data) {
          groups.usersAutocomplete = [];
          data.forEach(function(user) {
            var added = false;
            groups.usersFromGroupCollection.forEach(function(userCompare) {
              if (user.username == userCompare.username) {
                added = true;
              }
            });

            if (!added) {
              groups.usersAutocomplete.push(user);
            }
          });
          $scope.$apply();
        });
      };

      groups.addUsers = function() {
        var calls = [];

        groups.usersToAdd.forEach(function(user) {
          calls.push($scope.addUserToGroup(user));
        });

        $q.all(calls).then(function() {
          $rootScope.showNotification(formatMessage(groupsAdminMessages.usersAdded));
        });

        groups.usersToAdd = [];
      };

      $scope.loadTags = function($query) {
        var users = groups.usersAutocomplete;

        return users.filter(function(user) {
          var username = user.username.toLowerCase().indexOf($query.toLowerCase()) != -1,
            email = user.email.toLowerCase().indexOf($query.toLowerCase()) != -1,
            first_name = user.firstName.toLowerCase().indexOf($query.toLowerCase()) != -1,
            last_name = user.lastName.toLowerCase().indexOf($query.toLowerCase()) != -1;
          return username || email || first_name || last_name;
        });
      };

      $scope.validateTag = function($tag) {
        for (var x = 0; x < groups.usersAutocomplete.length; x++) {
          var user = groups.usersAutocomplete[x];

          if ($tag.username == user.username) {
            return true;
          }
        }

        return false;
      };

      $scope.getGroupMembers = function(group) {
        groups.membersCollection = {};
        groups.members.totalLogs = 0;
        groups.members.pagination = { current: 1 };
        groups.members.getMembersError = null;

        $scope.activeGroup = group;
        $scope.noGroupSelected = false;

        groups.members.pageChanged = function(newPage) {
          getResultsPage(newPage);
        };

        function getResultsPage(pageNumber) {
          var params = {};

          if (groups.members.totalLogs && groups.members.totalLogs > 0) {
            var offset = (pageNumber - 1) * groups.members.itemsPerPage;
            params.offset = offset;
            params.limit = groups.members.itemsPerPage;
          } else {
            params.offset = 0;
            params.limit = groups.members.itemsPerPage;
          }

          adminService.getUsersFromGroup(group, params).then(
            function(data) {
              groups.members.totalLogs = data.total;
              groups.usersFromGroupCollection = data;
              groups.getUsersAutocomplete();
              $scope.$apply();
            },
            function(e) {
              groups.members.getMembersError = e.response.message + '. ' + e.response.remedialAction;
            }
          );
        }

        getResultsPage(1);
      };

      groups.searchGroupMembers = function(query) {
        if ('' === query) {
          groups.usersFromGroupCollection = groups.usersFromGroupCollectionBackup;
          groups.members.itemsPerPage = groups.members.itemsPerPageBackup;
          groups.members.searchdirty = false;
        } else {
          if (!groups.members.searchdirty) {
            groups.members.searchdirty = true;

            adminService.getGroups().then(function(data) {
              groups.usersFromGroupCollectionBackup = groups.usersFromGroupCollection;
              groups.members.itemsPerPageBackup = groups.members.itemsPerPage;
              $scope.usersFromGroupCollection = data.users;
              groups.members.itemsPerPage = adminService.maxInt;
            });
          }
        }
      };

      $scope.removeUserFromGroup = function(user, group) {
        var deleteUserFromGroupParams = {};
        deleteUserFromGroupParams.userId = user.id;
        deleteUserFromGroupParams.username = user.username;
        // user.site_id = groups.site;

        var removeUserFromGroup = function() {
          adminService.deleteUserFromGroup(group.id, deleteUserFromGroupParams).then(
            function() {
              $scope.getGroupMembers(group);
              $rootScope.showNotification(
                formatMessage(groupsAdminMessages.userRemoved, {
                  username: user.username,
                  group: group.name
                })
              );
            },
            function(error) {
              $rootScope.showNotification(error.response.message, null, null, 'error');
            }
          );
        };

        $scope.confirmationAction = removeUserFromGroup;
        $scope.confirmationText = `${$translate.instant('common.DELETE_QUESTION')} ${
          user.username
        } ${$translate.instant('common.FROM')} ${group.name}?`;

        $scope.adminModal = $scope.showModal('confirmationModal.html', '', true, 'studioMedium');
      };

      $scope.addUserToGroup = function(user) {
        var activeGroup = groups.selectedGroup;

        return adminService
          .addUserToGroup({
            username: user.username,
            userId: user.id,
            groupId: activeGroup.id
          })
          .then(function(data) {
            $scope.getGroupMembers(activeGroup);
          });
      };
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
          reason: formatMessage(words.reason)
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
            $scope.showError(error.response);
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
        repositories.spinnerOverlay = $scope.spinnerOverlay();
        repo.siteId = repositories.site;
        repo.authenticationType = repo.authenticationType ? repo.authenticationType : 'none';

        adminService.createRepository(repo).then(
          function(data) {
            $scope.hideModal();
            adminService.getRepositories(repositories).then(repositoriesReceived, function(error) {
              $scope.showError(error.response);
              repositories.spinnerOverlay.close();
            });
          },
          function(error) {
            $scope.showError(error.response);
            repositories.spinnerOverlay.close();
          }
        );
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
              $scope.showError(error.response);
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
              $scope.showError(error.response);
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
              $scope.showError(error.response);
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
          .then(function(data) {
            repositories.status = data.repositoryStatus;
          });
      };
    }
  ]);
})(angular, $);
