(function (angular, $) {
    'use strict';

    var app = angular.module('studio');

    app.service('adminService', [
        '$http', 'Constants', '$cookies', '$timeout', '$window',
        function ($http, Constants, $cookies, $timeout, $window) {

            var me = this;

            this.getSites = function() {
                return $http.get(users('get-sites-3'));
            };

            //USERS

            this.getUsers = function(params) {

                if(params && params.site_id && params.site_id != "all"){
                    return $http.get(users('get-per-site'), {
                        params: params
                    });
                }else{
                    return $http.get(users('get-all'), {
                        params: params
                    });
                }
            };

            this.getUser = function(username) {
                return $http.get(users('get', 'username=' + username));
            };

            this.createUser = function (user) {
                return $http.post(users('create'),user);
            };

            this.editUser = function(user) {
                return $http.post(users('update'), user);
            };

            this.deleteUser = function(user){
                return $http.post(users('delete'), user);
            };

            this.getUserStatus = function(username){
                return $http.get(users('status', 'username=' + username));
            };

            this.toggleUserStatus = function(user, status){
                return $http.post(users(status), user);
            };

            this.setPassword = function(data){
                return $http.post(users('set-password'), data);
            };

            //Allow the administrator to reset Crafter Studio’s user password provided.
            this.resetPassword = function(data){
                return $http.post(users('reset-password'), data);
            };

            this.changePassword = function(data){
                return $http.post(users('change-password'), data);
            };

            this.forgotPassword = function(username){
                return $http.get(users('forgot-password', 'username=' + username));
            };

            //GROUPS

            this.getGroups = function(params) {
                if(params.site_id && params.site_id != "all"){
                    return $http.get(groups('get-per-site'), {
                        params: params
                    });
                }else{
                    return $http.get(groups('get-all'), {
                        params: params
                    });
                }
            };

            this.getGroup = function(group) {
                return $http.get(groups('get', 'group_name=' + group.group_name + '&site_id=' + group.site_id));
            };

            this.getUsersFromGroup = function(group) {
                return $http.get(groups('users', 'group_name=' + group.group_name + "&site_id=" + group.site_id));
            };

            this.deleteUserFromGroup = function(user){
                return $http.post(groups('remove-user'), user);
            };

            this.createGroup = function (group) {
                return $http.post(groups('create'),group);
            };

            this.editGroup = function(group) {
                return $http.post(groups('update'), group);
            };

            this.deleteGroup = function(group){
                return $http.post(groups('delete'), group);
            };

            this.addUserToGroup = function(data) {
                return $http.post(groups('add-user'), data);
            };

            //AUDIT

            this.getAudit = function(data) {
                return $http.get(audit('get'), {
                    params: data
                })
            };

            this.getTimeZone = function(data) {
                return $http.get(api('get-configuration'), {
                    params: data
                })
            };

            //PUBLISHING
            this.getPublishStatus = function(site) {
                return $http.get(publish('status', 'site_id=' + site));
            };

            this.startPublishStatus = function(site) {
                return $http.post(publish('start'), site);
            };

            this.stopPublishStatus = function(site) {
                return $http.post(publish('stop'), site);
            };

            //BULKPUBLISH
            this.getPublishingChannels = function(site) {
                return $http.get(bulkPublish('get-available-publishing-channels', 'site=' + site));
            };

            this.bulkGoLive = function(site, path) {
                return $http.post(bulkPublish('bulk-golive', 'site=' + site + "&path=" + path + "&environment=" + Constants.BULK_ENVIRONMENT));
            };

            function api(action) {
                return Constants.SERVICE + 'site/' + action + '.json';
            }

            function users(action, params) {
                if(params){
                    return Constants.SERVICE + 'user/' + action + '.json?' + params;
                }else {
                    return Constants.SERVICE + 'user/' + action + '.json';
                }
            }

            function publish(action, params) {
                if(params){
                    return Constants.SERVICE + 'publish/' + action + '.json?' + params;
                }else {
                    return Constants.SERVICE + 'publish/' + action + '.json';
                }
            }

            function bulkPublish(action, params) {
                if(params){
                    return Constants.SERVICE + 'deployment/' + action + '.json?' + params;
                }else {
                    return Constants.SERVICE + 'deployment/' + action + '.json';
                }
            }

            function groups(action, params) {
                if(params){
                    return Constants.SERVICE + 'group/' + action + '.json?' + params;
                }else {
                    return Constants.SERVICE + 'group/' + action + '.json';
                }
            }

            function audit(action, data) {
                return Constants.SERVICE + 'audit/' + action + '.json?';
            }

            return this;

        }
    ]);
    
    app.controller('AuditCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        '$stateParams', '$translate', '$location', 'moment',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  $stateParams, $translate, $location, moment) {

            $scope.audit = {};
            var audit = $scope.audit;
            audit.logsPerPage = 15;
            audit.defaultDelay = 500;
            audit.site = $location.search().site;
            audit.timeZone;

            adminService.getTimeZone({
                "site" : audit.site,
                "path" : "/site-config.xml"
            }).success(function (data) {
                audit.timeZone = data["default-timezone"];
            });

            var delayTimer;

            var getUsers = function(site) {
                adminService.getUsers(site)
                    .success(function (data) {
                        audit.users = data.users;
                        audit.userSelected = '';
                    })
                    .error(function () {
                        audit.users = null;
                    });
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

                    var params = {};
                    params.site_id = site;
                    if(audit.userSelected && audit.userSelected != '') params.user = audit.userSelected;

                    if(audit.actions.length > 0){
                        params.actions = JSON.stringify(audit.actions);
                    }

                    if(audit.totalLogs && audit.totalLogs > 0) {
                        var start = (pageNumber - 1) * audit.logsPerPage,
                            end = start + audit.logsPerPage;
                        params.start = start;
                        params.number = audit.logsPerPage;
                    }else{
                        params.start = 0;
                        params.number = audit.logsPerPage;
                    }

                    adminService.getAudit(params).success(function (data) {
                        audit.totalLogs = data.total;
                        audit.logs = data.items;
                    });
                }
            };

            audit.updateUser = function(user){
                if(user){
                    audit.userSelected = user.username;
                }else{
                    audit.userSelected = '';
                }

                $timeout.cancel(delayTimer)
                delayTimer = $timeout(function() {
                    getAudit(audit.site);
                }, audit.defaultDelay);
            };

            audit.actions = [];
            audit.updateActions = function(action) {
                if(action === "all"){
                    audit.actions = [];
                }else{
                    if(audit.actions.indexOf(action) != -1){
                        var index = audit.actions.indexOf(action);

                        if (index !== -1) {
                            audit.actions.splice(index, 1);
                        }
                    }else{
                        audit.actions.push(action);
                    }
                }

                audit.actionsInputVal = audit.actions.toString();

                $timeout.cancel(delayTimer);
                delayTimer = $timeout(function() {
                    getAudit(audit.site);
                }, audit.defaultDelay);

            };

            getAudit(audit.site);

        }
    ]);

    app.controller('PublishingCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        '$stateParams', '$translate', '$location', 'moment',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  $stateParams, $translate, $location, moment) {

                //PUBLISHING

                //MODAL

                $scope.publish = {};
                var currentIconColor;
                var publish = $scope.publish;
                publish.error = "";

                publish.showModal = function(template, size, verticalCentered, styleClass){
                    var modalInstance = $modal.open({
                        templateUrl: template,
                        windowClass: (verticalCentered ? 'centered-dialog ' : '') + (styleClass ? styleClass : ''),
                        backdrop: 'static',
                        keyboard: true,
                        //controller: 'PublishingCtrl',
                        scope: $scope,
                        size: size ? size : ''
                    });

                    return modalInstance;
                };
                publish.hideAdminModal = function() {
                    $scope.adminModal.close();
                }
                publish.hideConfirmationBulkModal = function() {
                    $scope.confirmationBulk.close();
                }
                publish.hideErrorModal = function() {
                    $scope.errorDialog.close();
                }

                publish.stopDisabled = false;
                publish.startDisabled = false;
                publish.site = $location.search().site;
                publish.timeZone;

                adminService.getTimeZone({
                    "site" : publish.site,
                    "path" : "/site-config.xml"
                }).success(function (data) {
                    publish.timeZone = data["default-timezone"];
                });

                publish.getPublish = function () {
                    adminService.getPublishStatus(publish.site)
                        .success(function (data) {
                            publish.stopDisabled = false;
                            publish.startDisabled = false;
                            switch (data.status.toLowerCase()) {
                                case "busy":
                                    currentIconColor = "orange";
                                    break;
                                case "stopped":
                                    currentIconColor = "red";
                                    publish.stopDisabled = true;
                                    break;
                                default:
                                    currentIconColor = "blue";
                                    publish.startDisabled  = true;
                            }
                            var stringDate = data.message.match( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z/ );
                            var date = null;
                            if(stringDate && stringDate.length){
                                publish.date = stringDate[0];
                                data.message = data.message.replace(stringDate[0], "");
                            }else{
                                publish.date = "";
                            }
                            publish.iconColor = currentIconColor;
                            publish.message = data.message;
                            publish.statusText = data.status;
                        })
                        .error(function (err) {
                        });
                };

                var renderStatusView = function() {
                    publish.getPublish(publish.site);
                    $timeout(function () {
                        renderStatusView();
                    }, 60000, false);
                }
                renderStatusView();

                publish.startPublish = function () {
                    var requestAsString = {"site_id": publish.site};
                    adminService.startPublishStatus(requestAsString)
                        .success(function (data) {
                            publish.getPublish(requestAsString);
                            window.top.postMessage('status-changed', '*');
                        })
                        .error(function (err) {
                            publish.error = err.match(/<title[^>]*>([^<]+)<\/title>/)[1];
                            $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
                        });
                };

                publish.stopPublish = function () {
                    var requestAsString = {"site_id": publish.site};
                    adminService.stopPublishStatus(requestAsString)
                        .success(function (data) {
                            publish.getPublish(requestAsString);
                            window.top.postMessage('status-changed', '*');
                        })
                        .error(function (err) {
                            publish.error = err.match(/<title[^>]*>([^<]+)<\/title>/)[1];
                            $scope.errorDialog = publish.showModal('errorDialog.html', 'md');
                        });
                };

                //BULK PUBLISH

                var currentIconColor;
                publish.channels;
                //publish.getPublishingChannels;
                publish.bulkPublish;
                publish.continue;
                //publish.selectedChannel ='';
                publish.pathPublish = '';

                /*publish.getPublishingChannels = function () {
                    adminService.getPublishingChannels(publish.site)
                        .success(function (data) {
                            //data.availablePublishChannels = [{name: "Live", publish: true, updateStatus: false, order: 2147483647}, {name: "Test", publish: true, updateStatus: false, order: 2147483642}]
                            publish.channels = data.availablePublishChannels;
                            publish.selectedChannel = publish.channels[0].name.toString();
                        })
                        .error(function () {
                        });
                };

                publish.getPublishingChannels();*/

                publish.bulkPublish = function () {
                    $scope.adminModal = publish.showModal('confirmationModal.html', 'md');
                }

                publish.continue = function () {
                    adminService.bulkGoLive(publish.site, publish.pathPublish)
                        .success(function (data) {
                            $scope.confirmationBulk = publish.showModal('confirmationBulk.html', 'md');
                        })
                        .error(function () {
                        })
                }

        }
    ]);

    app.controller('UsersCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        '$stateParams', '$translate', '$location',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  $stateParams, $translate, $location) {

            $scope.users = {};
            var users = $scope.users;

            this.init = function() {
                $scope.debounceDelay = 500;

                $scope.showModal = function(template, size, verticalCentered, styleClass){
                    $scope.usersError = null;

                    var modalInstance = $modal.open({
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
                            $('input, a').attr('tabindex', "-1");
                            $('#user-form input, #user-form select, #user-form textarea').each(function(index, input) {
                                input.tabIndex = index + 1;
                            });
                            $('#user-form').find('input select textarea').first().focus();
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
                $scope.notification = function(notificationText, showOnTop, styleClass){
                    var verticalAlign = showOnTop ? false : true;
                    $scope.notificationText = notificationText;
                    $scope.notificationType = 'exclamation-triangle';

                    var modal = $scope.showModal('notificationModal.html', 'sm', verticalAlign, styleClass);

                    $timeout(function () {
                        modal.close();
                    }, 1500, false);

                };
            };
            this.init();

            //table setup
            users.itemsPerPage = 10;
            $scope.usersCollection = {};

            var getUsers = function() {
                users.totalUsers = 0;
                getResultsPage(1);

                users.pagination = {
                    current: 1
                };

                users.pageChanged = function(newPage) {
                    getResultsPage(newPage);
                };

                function getResultsPage(pageNumber) {

                    var params = {};

                    if(users.totalLogs && users.totalLogs > 0) {
                        var start = (pageNumber - 1) * users.itemsPerPage,
                            end = start + users.itemsPerPage;
                        params.start = start;
                        params.number = users.itemsPerPage;
                    }else{
                        params.start = 0;
                        params.number = users.itemsPerPage;
                    }

                    adminService.getUsers(params).success(function (data) {
                        users.totalLogs = data.total;
                        $scope.usersCollection = data;
                    });
                }
            };

            getUsers();

            users.createUserDialog = function() {
                $scope.user = {};
                $scope.okModalFunction = users.createUser;

                $scope.adminModal = $scope.showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.CREATE');
                $scope.dialogEdit = false;
            };
            users.createUser = function(user) {
                adminService.createUser(user).success(function (data) {
                    $scope.hideModal();
                    $scope.usersCollection.users.push(user);
                    $scope.notification('\''+ user.username + '\' created.','','studioMedium');
                }).error(function(error){
                    $scope.usersError = error
                });

            };
            users.editUserDialog = function(user) {
                $scope.editedUser = user;
                $scope.user = {};
                $scope.okModalFunction = users.editUser;

                $scope.adminModal = $scope.showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.EDIT');
                $scope.dialogEdit = true;

                adminService.getUser(user.username).success(function (data) {
                    $scope.user = data;

                    adminService.getUserStatus(user.username).success(function(data){
                        $scope.user.status = data;
                    }).error(function(error){
                        console.log(error);
                        //TODO: properly display error
                    });
                }).error(function (error) {
                    console.log(error);
                    //TODO: properly display error
                });
            };
            users.editUser = function(user) {
                $scope.hideModal();

                adminService.editUser(user).success(function (data) {
                    var index = $scope.usersCollection.users.indexOf($scope.editedUser);

                    if(index != -1){
                        $scope.usersCollection.users[index] = user;
                        $scope.displayedCollection = $scope.usersCollection.users;
                    }

                    $scope.notification('\''+ user.username + '\' edited.','',"studioMedium");
                }).error(function(error){
                    console.log(error);
                    //TODO: properly display the error.
                });

                if(user.newPassword){
                    adminService.resetPassword({
                        "username" : user.username,
                        "new" : user.newPassword
                    });
                }

                users.toggleUserStatus(user);
            };
            users.viewUser = function(user){
                $scope.user = {};
                $scope.dialogMode = false;
                $scope.dialogEdit = false;

                $scope.adminModal = $scope.showModal('modalView.html');

                adminService.getUser(user.username).success(function (data) {
                    $scope.user = data;

                    adminService.getUserStatus(user.username).success(function(status){
                        $scope.user.status = status;
                    }).error(function(error){
                        console.log(error);
                    });
                }).error(function (error) {
                    console.log(error);
                    //TODO: properly display error
                });
            };
            users.toggleUserStatus = function(user){
                var newStatus = $('#enabled').is(':checked') ? 'enable' : 'disable';
                user.status.enabled = $('#enabled').is(':checked');

                adminService.toggleUserStatus(user, newStatus);
            };
            users.removeUser = function(user) {

                var deleteUser = function() {
                    adminService.deleteUser(user).success(function (data) {
                        var index = $scope.usersCollection.users.indexOf(user);
                        if (index !== -1) {
                            $scope.usersCollection.users.splice(index, 1);
                        }

                        $scope.notification('\''+ user.username + '\' deleted.','',"studioMedium");
                    }).error(function (data) {
                        $scope.error = data.message;
                        $scope.adminModal = $scope.showModal('deleteUserError.html', 'md', true);
                    });
                }

                $scope.confirmationAction = deleteUser;
                $scope.confirmationText = "Do you want to delete " + user.username + "?";

                $scope.adminModal = $scope.showModal('confirmationModal.html', '', true, "studioMedium");
            };
        }
    ]);

    app.controller('GroupsCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        '$stateParams', '$translate', '$location', '$q',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  $stateParams, $translate, $location, $q) {

            $scope.groups = {};
            var groups = $scope.groups;
            groups.site = $location.search().site;

            this.init = function() {
                $scope.debounceDelay = 500;

                $scope.showModal = function(template, size, verticalCentered, styleClass){
                    $scope.groupsError = null;
                    var modalInstance = $modal.open({
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

                $scope.notification = function(notificationText, showOnTop, time, styleClass){
                    var verticalAlign = showOnTop ? false : true,
                        timer = time ? time : 1500;
                    $scope.notificationText = notificationText;
                    $scope.notificationType = 'exclamation-triangle';

                    var modal = $scope.showModal('notificationModal.html', 'sm', verticalAlign, styleClass);

                    $timeout(function () {
                        modal.close();
                    }, timer, false);
                };
            };
            this.init();

            //table setup
            groups.itemsPerPage=10;
            $scope.groupsCollection = [];

            /////////////////// MULTIPLE GROUPS VIEW ////////////////////

            var getGroups = function(site) {

                groups.totalLogs = 0;
                getResultsPage(1);

                groups.pagination = {
                    current: 1
                };

                groups.pageChanged = function(newPage) {
                    getResultsPage(newPage);
                };

                function getResultsPage(pageNumber) {

                    var params = {};

                    params.site_id = site;

                    if(groups.totalLogs && groups.totalLogs > 0) {
                        var start = (pageNumber - 1) * groups.itemsPerPage,
                            end = start + groups.itemsPerPage;
                        params.start = start;
                        params.number = groups.itemsPerPage;
                    }else{
                        params.start = 0;
                        params.number = groups.itemsPerPage;
                    }

                    adminService.getGroups(params).success(function (data) {
                        groups.totalLogs = data.total;
                        $scope.groupsCollection = data;
                    });

                }
            };
            getGroups(groups.site);

            $scope.createGroupDialog = function(){
                $scope.group = {};
                $scope.okModalFunction = $scope.createGroup;

                $scope.adminModal = $scope.showModal('modalView.html');

                $scope.dialogMode = $translate.instant('common.CREATE');
                $scope.dialogTitle = $translate.instant('admin.groups.CREATE_GROUP');
            }
            $scope.createGroup = function(group) {
                group.site_id = groups.site;

                adminService.createGroup(group).success(function (data) {
                    $scope.hideModal();
                    $scope.groupsCollection.groups.push(group);
                    $scope.notification('\''+ group.group_name + '\' created.', '', null,"studioMedium");
                }).error(function(error){
                    $scope.groupsError = error;
                });

            };
            $scope.editGroupDialog = function(group){
                group.site_id = groups.site;

                $scope.editedGroup = group;
                $scope.group = {};
                $scope.okModalFunction = $scope.editGroup;

                $scope.adminModal = $scope.showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.EDIT');
                $scope.dialogTitle = $translate.instant('admin.groups.EDIT_GROUP');

                adminService.getGroup(group).success(function (data) {
                    $scope.group = data;
                }).error(function () {
                    //TODO: properly display error.
                });
            };
            $scope.editGroup = function(group) {
                group.site_id = groups.site;

                adminService.editGroup(group).success(function (data) {
                    $scope.notification('\''+ group.group_name + '\' edited.', '', null, "studioMedium");
                }).error(function(error){
                    if("Unauthorized" === error.message) {;
                        $scope.notification($translate.instant('admin.groups.UNAUTHORIZED'), false, 2000, "studioMedium");
                    }
                });
            };
            $scope.removeGroup = function(group) {
                var deleteGroup = function() {
                    group.site_id = groups.site;

                    adminService.deleteGroup(group).success(function (data) {
                        var index = $scope.groupsCollection.groups.indexOf(group);
                        if (index !== -1) {
                            $scope.groupsCollection.groups.splice(index, 1);
                        }

                        $scope.usersFromGroupCollection = [];
                        $scope.noGroupSelected = true;

                        $scope.notification('\''+ group.group_name + '\' group deleted.', '', null,"studioMedium");

                    }).error(function (error) {
                        if("Unauthorized" === error.message) {
                            $scope.notification($translate.instant('admin.groups.UNAUTHORIZED'), false, 2000, "studioMedium");
                        }
                    });
                };

                $scope.confirmationAction = deleteGroup;
                $scope.confirmationText = "Do you want to delete " + group.group_name + "?";

                $scope.adminModal = $scope.showModal('confirmationModal.html', 'sm', true, "studioMedium");
            };


            /////////////////// SINGLE GROUP VIEW ////////////////////

            groups.viewGroup = function(group) {
                groups.selectedGroup = group;
                groups.groupView = true;
                groups.usersToAdd = [];

                $scope.getUsersFromGroup(group);
            };

            groups.getUsersAutocomplete = function() {
                adminService.getUsers().success(function(data){
                    groups.usersAutocomplete = [];

                    data.users.forEach(function(user){
                        var added = false;
                        groups.usersFromGroupCollection.users.forEach(function(userCompare){
                            if(user.username == userCompare.username){
                                added = true;
                            }
                        });

                        if(!added){
                            groups.usersAutocomplete.push(user);
                        }
                    });
                });
            };

            groups.addUsers = function() {

                var calls = [];

                groups.usersToAdd.forEach(function(user){
                    calls.push($scope.addUserToGroup(user));
                });

                $q.all(calls).then(function() {
                    $scope.notification('Users successfully added.', false, null, "studioMedium");
                });

                groups.usersToAdd = [];
            };

            $scope.loadTags = function($query) {
                var users = groups.usersAutocomplete;

                return users.filter(function(user) {
                    var username= user.username.toLowerCase().indexOf($query.toLowerCase()) != -1,
                        email = user.email.toLowerCase().indexOf($query.toLowerCase()) != -1,
                        first_name = user.first_name.toLowerCase().indexOf($query.toLowerCase()) != -1,
                        last_name = user.last_name.toLowerCase().indexOf($query.toLowerCase()) != -1;
                    return username || email || first_name || last_name;
                });

            };

            $scope.validateTag = function($tag) {
                for(var x = 0; x < groups.usersAutocomplete.length; x++){
                    var user = groups.usersAutocomplete[x];

                    if($tag.username == user.username){
                        return true;
                    }
                };

                return false;
            };

            $scope.getUsersFromGroup = function(group){
                groups.usersFromGroupCollection = {};
                $scope.activeGroup = group;
                $scope.noGroupSelected = false;

                group.site_id = groups.site;

                adminService.getUsersFromGroup(group).success(function (data) {
                    groups.usersFromGroupCollection = data;
                    groups.getUsersAutocomplete();
                }).error(function () {
                    //TODO: properly display error
                });
            };

            $scope.removeUserFromGroup = function(user, group) {

                user.group_name = group.group_name;
                user.site_id = groups.site;

                var removeUserFromGroup = function() {
                    adminService.deleteUserFromGroup(user).success(function () {
                        $scope.getUsersFromGroup(group);
                        $scope.notification(user.username + ' successfully removed from ' + group.group_name, false, null, "studioMedium");
                    }).error(function () {
                    });
                };

                $scope.confirmationAction = removeUserFromGroup;
                $scope.confirmationText = "Do you want to delete " + user.username + " from " + group.group_name + "?";

                $scope.adminModal = $scope.showModal('confirmationModal.html', '', true, "studioMedium");
            };

            $scope.addUserToGroup = function (user) {
                var activeGroup = groups.selectedGroup;

                return adminService.addUserToGroup({
                    "username": user.username,
                    "group_name": activeGroup.group_name,
                    "site_id": groups.site
                }).success(function (data) {
                    $scope.getUsersFromGroup(activeGroup);
                }).error(function () {

                });
            };
        }
    ]);

})(angular, $);
