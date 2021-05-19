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
    '$rootScope',
    function($scope, $rootScope) {
      CrafterCMSNext.render(document.querySelector('#log-console-view'), 'LogConsole', {
        logType: window === window.top ? 'studio' : 'preview'
      }).then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);

  app.controller('PublishingCtrl', [
    '$rootScope',
    function($rootScope) {
      CrafterCMSNext.render(document.querySelector('#publishing-dashboard-view'), 'PublishingDashboard').then(
        (done) => {
          const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
            unsubscribe();
            done.unmount();
          });
        }
      );
    }
  ]);

  app.controller('UsersCtrl', [
    '$rootScope',
    '$scope',
    function($rootScope, $scope) {
      CrafterCMSNext.render(document.querySelector('#users-management-view'), 'UsersManagement', {
        passwordRequirementsRegex
      }).then((done) => {
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
    function($rootScope) {
      CrafterCMSNext.render(
        document.querySelector('#remote-repositories-management-view'),
        'RemoteRepositoriesManagement'
      ).then((done) => {
        const unsubscribe = $rootScope.$on('$stateChangeStart', function() {
          unsubscribe();
          done.unmount();
        });
      });
    }
  ]);
})(angular, $);
