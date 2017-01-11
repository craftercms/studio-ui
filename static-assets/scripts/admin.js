(function (angular, $) {
    'use strict';

    var app = angular.module('studio');

    app.service('adminService', [
        '$http', 'Constants', '$cookies', '$timeout', '$window',
        function ($http, Constants, $cookies, $timeout, $window) {

            var me = this;

            this.getUsers = function() {
                return $http.get(json('get-users'));
            };

            this.getUser = function() {
                return $http.get(json('get-user'));
            };

            this.getGroups = function() {
                return $http.get(json('get-groups'));
            };

            this.getGroup = function() {
                return $http.get(json('get-group'));
            };

            this.getUsersFromGroup = function() {
                return $http.get(json('get-users-from-group'));
            };

            this.createUser = function (user) {
                return $http.post(api('create-user'),user);
            };

            this.createGroup = function (group) {
                return $http.post(api('create-group'),group);
            };

            this.editUser = function(user) {
                return $http.post(api('edit-group'), {
                    userId: user.id
                });
            };

            this.editGroup = function(group) {
                return $http.post(api('edit-group'), {
                    groupId: group.id
                });
            };

            this.addUserToGroup = function(groupId) {
                return $http.post(api('add-user-to-group'), {
                    groupId: groupId
                });
            }

            this.removeSite = function(site) {
                return $http.post(api('delete-site'), {
                    siteId: site.siteId
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

    app.controller('AdminCtrl', [
        '$scope', '$state', '$window', '$sce', 'adminService', '$modal', '$timeout',
        'Upload', '$stateParams', '$translate', '$location',
        function ($scope, $state, $window, $sce, adminService, $modal, $timeout,
                  Upload, $stateParams, $translate, $location) {

            var current = $state.current.name.replace(/\./g, '');

            $scope.back = function() {
                window.history.back();
            };

            this.homeadmin = function() {
                $location.path('/admin/groups');
            };

            this.homeadminusers = function() {

                //table setup
                $scope.itemsByPage=5;
                $scope.usersCollection = [];

                //remove to the real data holder
                $scope.removeItem = function removeItem(row) {
                    var index = $scope.usersCollection.indexOf(row);
                    if (index !== -1) {
                        $scope.usersCollection.splice(index, 1);
                    }
                }

                adminService.getUsers().success(function (data) {
                    //TODO: set users to scope
                }).error(function () {
                    $scope.usersCollection = [
                        {
                            'name': 'User 1',
                            'userName': 'user1',
                            'jobTitle': 'dev',
                            'email': 'user1@test.com',
                            'usage': '?',
                            'quota': '?'
                        },
                        {
                            'name': 'User 2',
                            'userName': 'user2',
                            'jobTitle': 'dev',
                            'email': 'user2@test.com',
                            'usage': '?',
                            'quota': '?'
                        }
                    ]

                    ;
                });
            };

            this.homeadmingroups = function() {

                $scope.assignUsers = false;
                $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.ASSIGN_USERS_LABEL');
                
                //table setup
                $scope.itemsByPage=5;
                $scope.groupsCollection = [];

                //remove to the real data holder
                $scope.removeItem = function removeItem(row) {
                    var index = $scope.groupsCollection.indexOf(row);
                    if (index !== -1) {
                        $scope.groupsCollection.splice(index, 1);
                    }
                }

                $scope.toggleAssignUsers = function() {
                    $scope.assignUsers = !$scope.assignUsers;

                    if($scope.assignUsers){
                        $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.VIEW_GROUPS_LABEL');
                    }else{
                        $scope.toggleAssignUsersLabel = $translate.instant('admin.groups.ASSIGN_USERS_LABEL');
                    }
                }

                adminService.getGroups().success(function (data) {
                    //TODO: set groups to scope
                }).error(function () {
                    $scope.groupsCollection = [
                        {
                            id: 'test1',
                            displayName: 'Hello 1'
                        },
                        {
                            id: 'test2',
                            displayName: 'Test 2'
                        },
                        {
                            id: 'batman',
                            displayName: 'batman'
                        },
                        {
                            id: 'robin',
                            displayName: 'robin'
                        },
                        {
                            id: 'yo',
                            displayName: 'yo'
                        },
                        {
                            id: 'tu',
                            displayName: 'tu'
                        }
                    ];
                });
            };

            this.homeadmingroup = function() {
                $scope.group = {};

                adminService.getGroup().success(function (data) {
                    //TODO: set group to scope
                }).error(function () {
                    $scope.group =
                    {
                        'id': 'test',
                        'displayName': 'Test'
                    };
                });
            }

            this[current]();

            $scope.createGroupDialog = function(){
                $scope.group = {};
                $scope.okModalFunction = $scope.createGroup;

                showModal('modalView.html');

                $scope.dialogMode = $translate.instant('common.CREATE');
                $scope.dialogTitle = $translate.instant('admin.groups.CREATE_GROUP');
            }
            $scope.createGroup = function() {
                $scope.hideModal();
                var createModalInstance = $modal.open({
                    templateUrl: 'creatingGroupConfirmation.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });
                adminService.createGroup({
                    identifier: $scope.group.identifier,
                    displayName: $scope.group.displayName
                }).success(function (data) {
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                }).error(function(error){
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                });

            }
            $scope.editGroupDialog = function(){
                $scope.group = {};
                $scope.okModalFunction = $scope.editGroup;

                showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.EDIT');
                $scope.dialogTitle = $translate.instant('admin.groups.EDIT_GROUP');

                adminService.getGroup().success(function (data) {
                    //TODO: set group to scope
                }).error(function () {
                    $scope.group =
                    {
                        'identifier': 'test',
                        'displayName': 'Test'
                    }
                    ;
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
                adminService.editGroup({
                    identifier: $scope.group.identifier,
                    displayName: $scope.group.displayName
                }).success(function (data) {
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                }).error(function(error){
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                });
            }

            $scope.createUserDialog = function() {
                $scope.user = {};
                $scope.okModalFunction = $scope.createUser;

                showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.CREATE');
            }
            $scope.createUser = function() {
                $scope.hideModal();
                var createModalInstance = $modal.open({
                    templateUrl: 'creatingUserConfirmation.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });
                adminService.createUser({
                    name: $scope.user.firstName,
                    email: $scope.user.email,
                    username: $scope.user.username,
                    password: $scope.user.password      //TODO: verify/encrypt password
                }).success(function (data) {
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                }).error(function(error){
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                });

            }
            $scope.editUserDialog = function() {
                $scope.user = {};
                $scope.okModalFunction = $scope.editUser;

                showModal('modalView.html');
                $scope.dialogMode = $translate.instant('common.EDIT');

                adminService.getUser().success(function (data) {
                    //TODO: set group to scope
                }).error(function () {
                    $scope.user =
                    {
                        'name': 'User 1',
                        'userName': 'user1',
                        'jobTitle': 'dev',
                        'email': 'user1@test.com',
                        'usage': '?',
                        'quota': '?'
                    }
                    ;
                });
            }
            $scope.editUser = function(user) {
                $scope.hideModal();

                var createModalInstance = $modal.open({
                    templateUrl: 'creatingUserConfirmation.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'sm'
                });

                adminService.editUser({
                    name: $scope.user.firstName,
                    email: $scope.user.email,
                    username: $scope.user.username,
                    password: $scope.user.password      //TODO: verify/encrypt password
                }).success(function (data) {
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                }).error(function(error){
                    $timeout(function () {
                        createModalInstance.close();
                    }, 5000, false);
                });
            }
            $scope.viewUser = function(user){
                $scope.user = {};
                $scope.dialogMode = false;
                
                showModal('modalView.html');

                adminService.getUser().success(function (data) {
                    //TODO: set group to scope
                }).error(function () {
                    $scope.user =
                    {
                        'name': 'User 1',
                        'userName': 'user1',
                        'jobTitle': 'dev',
                        'email': 'user1@test.com',
                        'usage': '?',
                        'quota': '?'
                    }
                    ;
                });
            }

            $scope.getUsersFromGroup = function(group){
                $scope.usersFromGroupCollection = [];
                $scope.activeGroup = group.id;

                //remove to the real data holder
                // $scope.removeItem = function removeItem(row) {
                //     var index = $scope.usersCollection.indexOf(row);
                //     if (index !== -1) {
                //         $scope.usersCollection.splice(index, 1);
                //     }
                // }

                adminService.getUsersFromGroup(group.id).success(function (data) {
                    //TODO: set users to scope
                }).error(function () {
                    var index = Math.floor((Math.random() * 2));

                    var users1 = [
                        {
                            'name': 'User 1',
                            'userName': 'user1'
                        },
                        {
                            'name': 'User 2',
                            'userName': 'user2'
                        }
                    ];
                    var users2 = [
                        {
                            'name': 'User 3',
                            'userName': 'user3'
                        }
                    ];

                    var testData = [users1, users2]

                    $scope.usersFromGroupCollection = testData[index];
                });
            }

            function showModal(template){
                $scope.adminModal = $modal.open({
                    templateUrl: template,
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'AdminCtrl',
                    scope: $scope
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

            $scope.addUserToGroupDialog = function () {
                $scope.userSelected = {};
                $scope.usersCollection = [];

                showModal('addUsersView.html');

                adminService.getUsers().success(function (data) {
                    //TODO: set users to scope
                }).error(function () {
                    $scope.usersCollection = [
                        {
                            'name': 'User 1',
                            'userName': 'user1',
                            'jobTitle': 'dev',
                            'email': 'user1@test.com',
                            'usage': '?',
                            'quota': '?'
                        },
                        {
                            'name': 'User 2',
                            'userName': 'user2',
                            'jobTitle': 'dev',
                            'email': 'user2@test.com',
                            'usage': '?',
                            'quota': '?'
                        }
                    ]

                    ;
                });
            }
            $scope.addUser = function (user) {
                adminService.addUserToGroup(user.id).success(function (data) {
                    //TODO: set users to scope
                }).error(function () {
                    $scope.hideModal();
                });
            }
        }



    ])

})(angular);
