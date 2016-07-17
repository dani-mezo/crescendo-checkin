'use strict';

angular.module('crescendo-checkin.zsuzsi', ['ngRoute', 'cgNotify'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/zsuzsi', {
    templateUrl: 'zsuzsi/zsuzsi.html',
    controller: 'ZsuzsiController'
  });
}])

.controller('ZsuzsiController',
    function($scope, $location, $mdDialog, connectionProvider, storageProvider,roleProvider, constProvider, $timeout, eventProvider, viewProvider, log, reasonProvider, $http, notifyProvider, statusProvider, $rootScope, _) {
        var target = 'ZsuzsiController';

        if(!storageProvider.get(constProvider.ROLE)){
            $location.path('/login');
        }

        connectionProvider.emit('REG', {role: roleProvider.ZSUZSI});
        connectionProvider.addHandler('ISSUE', issueHandler);

        function issueHandler(issue){
            if(isNewIssue(issue)){
                notifyProvider.info('Egy új probléma érkezett!')
                issue.message = getMessage(issue);
                vm.issues.push(issue);
                console.log(issue)
            }
        }

        function getMessage(issue){
            var message = '';
            if(!issue.isArrivalOK) {
                message += 'Eredeti érkezési idő: ' + issue.arrival + '\n';
            }

            if(!issue.isDebitOK) {
                message += 'Tartozás: ' + issue.debit + '\n';
            }

            if(!issue.isRoleOK) {
                message += 'Nem szerepel bejegyzett role\n';
            }

            return message;
        }

        function isNewIssue(issue){
            for(var i in vm.issues){
                if(vm.issues[i].id === issue.id) return false;
            }
            return true;
        }

        function showConfirm(id, name, message) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title(name)
                .textContent(message)
                .ariaLabel('Lucky day')
                .ok('Megoldottnak tekintem!')
                .cancel('Mégse');
                $mdDialog.show(confirm).then(function() {
                    resolveIssue(id);
                }, function() {
            });
        };

        function resolveIssue(id){
            _.remove(vm.issues, function(issue){
                return issue.id === id;
            });

            var data = {id: id, token: storageProvider.get(constProvider.TOKEN)};
            $http.post('/resolve', data).then(handleIssueResolve, errorCallback);
        }

        function handleIssueResolve(){
            if(response.data.status === 'ok'){
                notifyProvider.success('A probléma sikeresen feloldódott!');
            }
        }

        function errorCallback(err){
            console.error(err);
        }


        var vm = $scope;

        vm.issues = [];

        console.log('ZsuzsiController')

        vm.name = storageProvider.get(constProvider.NAME);

        vm.logout = logout;

        vm.viewIssue = viewIssue;



        function viewIssue(issue){
            showConfirm(issue.id, issue.name, issue.message);
        }

        function logout(){
            storageProvider.clear();
            notifyProvider.success('Successfully logged out!');
            $location.path('/');
        }

        $rootScope.$on('$routeChangeStart', function (ev, to, toParams, from, fromParams) {
            if(!storageProvider.get(constProvider.ROLE)){
                $location.path('/login');
            }
            if ($location.url() !== '/' + storageProvider.get(constProvider.ROLE)) {
                $location.path(storageProvider.get(constProvider.ROLE));
            }
        });
});