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

            this.getUsers = function(site) {
                if(site && site != "all"){
                    return $http.get(users('get-per-site', 'site_id=' + site));
                }else{
                    return $http.get(users('get-all'));
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

            this.changePassword = function(data){
                return $http.post(users('change-password'), data);
            };

            this.forgotPassword = function(username){
                return $http.get(users('forgot-password', 'username=' + username));
            };

            //GROUPS

            this.getGroups = function(site) {
                if(site && site != "all"){
                    return $http.get(groups('get-per-site', 'site_id=' + site));
                }else{
                    return $http.get(groups('get-all'));
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
            }


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

            function groups(action, params) {
                if(params){
                    return Constants.SERVICE + 'group/' + action + '.json?' + params;
                }else {
                    return Constants.SERVICE + 'group/' + action + '.json';
                }
            }

            return this;

        }
    ]);

    app.controller('AdminCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        'Upload', '$stateParams', '$translate', '$location',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  Upload, $stateParams, $translate, $location) {

            var current = $state.current.name.replace(/\./g, '');

            adminService.getSites()
                .success(function (data) {
                    $scope.sites = data;
                })
                .error(function () {
                    $scope.sites = null;
                });

            //sites dropdown
            $scope.currentSite = {
                name : "All Sites",
                id: "all"
            };
            $scope.dropdownStatus = {
                isopen: false
            };
            $scope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
            $scope.updateDropdown = function(siteId, siteName) {
                $scope.currentSite = {
                    name: siteName,
                    id: siteId
                };
            }

            this.homeadmin = function() {
                $location.path('/admin/groups');
            };

            this.homeadminusers = function() {
                
                //table setup
                $scope.itemsByPage=8;
                $scope.usersCollection = {};

                var getUsers = function(site) {
                    adminService.getUsers(site).success(function (data) {
                        $scope.usersCollection = data;
                    }).error(function (error) {
                        console.log(error);
                        //TODO: properly show error
                    });
                };
                getUsers();
                $scope.$watch('currentSite', function() {
                    getUsers($scope.currentSite.id);
                });

                $scope.createUserDialog = function() {
                    $scope.user = {};
                    $scope.okModalFunction = $scope.createUser;

                    $scope.adminModal = showModal('modalView.html');
                    $scope.dialogMode = $translate.instant('common.CREATE');
                };
                $scope.createUser = function(user) {
                    $scope.hideModal();

                    adminService.createUser(user).success(function (data) {
                        $scope.usersCollection.users.push(user);
                        $scope.notification('\''+ user.username + '\' created.');
                    }).error(function(error){
                        console.log(error);
                    });

                };
                $scope.editUserDialog = function(user) {
                    $scope.editedUser = user;
                    $scope.user = {};
                    $scope.okModalFunction = $scope.editUser;

                    $scope.adminModal = showModal('modalView.html');
                    $scope.dialogMode = $translate.instant('common.EDIT');

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
                $scope.editUser = function(user) {
                    $scope.hideModal();

                    adminService.editUser(user).success(function (data) {
                        var index = $scope.usersCollection.users.indexOf($scope.editedUser);

                        if(index != -1){
                            $scope.usersCollection.users[index] = user;
                            $scope.displayedCollection = $scope.usersCollection.users;
                        }

                        $scope.notification('\''+ user.username + '\' edited.');
                    }).error(function(error){
                        console.log(error);
                        //TODO: properly display the error.
                    });
                };
                $scope.viewUser = function(user){
                    $scope.user = {};
                    $scope.dialogMode = false;

                    $scope.adminModal = showModal('modalView.html');

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
                $scope.toggleUserStatus = function(user){
                    var currentStatus = user.status.enabled,
                        newStatus = currentStatus == true ? 'disable' : 'enable';

                    adminService.toggleUserStatus(user, newStatus).success(function(data){
                        user.status.enabled = !currentStatus;
                        var notificationText = user.status.enabled ? 'enabled' : 'disabled';
                        $scope.notification('User ' + notificationText, true);
                    }).error(function() {
                        // user.status.enabled = !currentStatus;
                    });
                };
                $scope.removeUser = function(user) {

                    var deleteUser = function() {
                        adminService.deleteUser(user).success(function (data) {
                            var index = $scope.usersCollection.users.indexOf(user);
                            if (index !== -1) {
                                $scope.usersCollection.users.splice(index, 1);
                            }

                            $scope.notification('\''+ user.username + '\' deleted.');
                        }).error(function (error) {
                            console.log(error);
                            //TODO: properly display error.
                        });
                    }

                    $scope.confirmationAction = deleteUser;
                    $scope.confirmationText = "Do you want to delete " + user.username + "?";

                    $scope.adminModal = showModal('confirmationModal.html', 'sm', true);
                };

            };

            this.homeadmingroups = function() {

                $scope.assignUsers = false;
                $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.ASSIGN_USERS_LABEL');
                $scope.noGroupSelected = true;
                
                //table setup
                $scope.itemsByPage=8;
                $scope.groupsCollection = [];

                var getGroups = function(site) {
                    adminService.getGroups(site).success(function (data) {
                        if(data.sites){
                            var groups = {
                                "groups": []
                            };
                            for(var x = 0; x < data.sites.length; x++){
                                var site = data.sites[x],
                                    site_id = site.site_id;

                                for(var y = 0; y < site.groups.length; y++){
                                    var group = site.groups[y];
                                    group.site_id = site_id;
                                    groups.groups.push(group);
                                }
                            }

                            $scope.groupsCollection = groups;
                        }else{
                            $scope.groupsCollection = data;
                        }



                    }).error(function () {
                        console.log(error);
                        //TODO: properly display the error.
                    });
                };
                getGroups();

                $scope.$watch('currentSite', function() {
                    getGroups($scope.currentSite.id);
                });

                $scope.toggleAssignUsers = function() {
                    $scope.assignUsers = !$scope.assignUsers;
                    if($scope.assignUsers){
                        $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.VIEW_GROUPS_LABEL');
                    }else{
                        $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.ASSIGN_USERS_LABEL');
                    }
                }

                $scope.createGroupDialog = function(){
                    $scope.group = {};
                    $scope.okModalFunction = $scope.createGroup;

                    $scope.adminModal = showModal('modalView.html');

                    $scope.dialogMode = $translate.instant('common.CREATE');
                    $scope.dialogTitle = $translate.instant('admin.groups.CREATE_GROUP');
                }
                $scope.createGroup = function(group) {
                    $scope.hideModal();

                    adminService.createGroup(group).success(function (data) {
                        $scope.groupsCollection.groups.push(group);
                        $scope.notification('\''+ group.group_name + '\' created.');
                    }).error(function(error){
                        console.log(error);
                        //TODO: properly display error.
                    });

                }
                $scope.editGroupDialog = function(group){
                    $scope.group = {};
                    $scope.okModalFunction = $scope.editGroup;

                    $scope.adminModal = showModal('modalView.html');
                    $scope.dialogMode = $translate.instant('common.EDIT');
                    $scope.dialogTitle = $translate.instant('admin.groups.EDIT_GROUP');

                    adminService.getGroup(group).success(function (data) {
                        $scope.group = data;
                    }).error(function () {
                        //TODO: properly display error.
                    });
                }
                $scope.editGroup = function(group) {
                    $scope.hideModal();

                    var createModalInstance = $modal.open({
                        templateUrl: 'creatingGroupConfirmation.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'sm'
                    });
                    adminService.editGroup(group).success(function (data) {
                        //TODO: pending, need get group service working

                        createModalInstance.close();
                    }).error(function(error){
                        console.log(error);
                        //TODO: properly display error.
                    });
                }
                $scope.removeGroup = function(group) {
                    var deleteGroup = function() {
                        adminService.deleteGroup(group).success(function (data) {
                            var index = $scope.groupsCollection.groups.indexOf(group);
                            if (index !== -1) {
                                $scope.groupsCollection.groups.splice(index, 1);
                            }

                            $scope.usersFromGroupCollection = [];
                            $scope.noGroupSelected = true;

                            $scope.notification('\''+ group.group_name + '\' group deleted.');

                        }).error(function (error) {
                            console.log(error);
                            //TODO: properly display error;
                        });
                    };

                    $scope.confirmationAction = deleteGroup;
                    $scope.confirmationText = "Do you want to delete " + group.group_name + "?";

                    $scope.adminModal = showModal('confirmationModal.html', 'sm', true);
                };
                $scope.getUsersFromGroup = function(group){
                    $scope.usersFromGroupCollection = [];
                    $scope.activeGroup = group;
                    $scope.noGroupSelected = false;

                    $scope.removeUserFromGroup = function(user) {

                        user.group_name = group.group_name;
                        user.site_id = group.site_id;

                        var removeUserFromGroup = function() {
                            adminService.deleteUserFromGroup(user).success(function () {
                                var index = $scope.usersFromGroupCollection.users.indexOf(user);
                                if (index !== -1) {
                                    $scope.usersFromGroupCollection.users.splice(index, 1);
                                }
                            }).error(function () {
                                var index = $scope.usersFromGroupCollection.users.indexOf(user);
                                if (index !== -1) {
                                    $scope.usersFromGroupCollection.users.splice(index, 1);
                                }
                            });
                        }

                        $scope.confirmationAction = removeUserFromGroup;
                        $scope.confirmationText = "Do you want to delete " + user.username + " from " + group.group_name + "?";

                        $scope.adminModal = showModal('confirmationModal.html', 'sm');
                    };
                    
                    adminService.getUsersFromGroup(group).success(function (data) {
                        //TODO: set users to scope
                    }).error(function () {
                        var users = {
                            "users" :
                                [
                                    {
                                        "username" : "jane.doe",
                                        "first_name" : "Jane",
                                        "last_name" : "Doe",
                                        "email" : "jane@example.com",
                                    },
                                    {
                                        "username" : "joe.bloggs",
                                        "first_name" : "Joe",
                                        "last_name" : "Bloggs",
                                        "email" : "joe@example.com",
                                    }
                                ]
                        }

                        $scope.usersFromGroupCollection = users;
                    });
                }
                $scope.addUserToGroupDialog = function () {
                    $scope.userSelected = {};
                    $scope.usersCollection = [];

                    $scope.adminModal = showModal('addUsersView.html');

                    adminService.getUsers().success(function (data) {
                        $scope.usersCollection = data;
                    }).error(function (error) {
                        console.log(error);
                    });
                }
                $scope.addUserToGroup = function (user) {
                    var activeGroup = $scope.activeGroup;

                    adminService.addUserToGroup({
                        "username": user.username,
                        "group_name": activeGroup.group_name,
                        "site_id": activeGroup.site_id
                    }).success(function (data) {
                        //TODO: set users to scope
                    }).error(function () {
                        $scope.hideModal();
                    });
                }
            };

            this[current]();

            function showModal(template, size, verticalCentered){
                return $modal.open({
                    templateUrl: template,
                    windowClass: verticalCentered ? 'centered-dialog' : '',
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'AdminCtrl',
                    scope: $scope,
                    size: size ? size : ''
                });
            }
            $scope.hideModal = function() {
                $scope.adminModal.close();
            }
            $scope.uploadFiles = function(file, errFiles) {         //TODO: change upload to submit button
                $scope.f = file;
                $scope.errFile = errFiles && errFiles[0];
                if (file) {
                    file.upload = Upload.upload({
                        // url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                        url: '',
                        data: {file: file}
                    });

                    file.upload.then(function (response) {
                        $timeout(function () {
                            file.result = response.data;
                        });
                    }, function (response) {
                        if (response.status > 0)
                            $scope.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        file.progress = Math.min(100, parseInt(100.0 *
                            evt.loaded / evt.total));

                        if(file.progress == 100) {
                            file.uploaded = 'completed';
                        }
                    });
                }
            }
            $scope.notification = function(notificationText, showOnTop){
                var verticalAlign = showOnTop ? false : true;
                $scope.notificationText = notificationText;
                $scope.notificationType = 'alert';

                var modal = showModal('notificationModal.html', 'sm', verticalAlign);

                $timeout(function () {
                    modal.close();
                }, 1500, false);

            };

        }



    ])

})(angular);
