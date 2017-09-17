homeApp.controller('HomeCtrl', function ($scope, $timeout, $http,
	$sessionStorage, $location, $route, sidebarService, alertModalService) {
	// This controller instance
	var thisCtrl = this;
	// Data collections
	$scope.commits = [];
	$scope.committers = [];
	$scope.repositories = [];
	$scope.references = [];
	$scope.committerEvolution = [];
	$scope.currentPage = "tdevolution";
	$scope.durationProgress = 1000;

	$scope.filtered = {
		repository: null,
		commits: [],
		committers: [],
		references: [],
		debts: ["CODE", "DESIGN"],
	}

	// Load all repositories
	thisCtrl.repositoriesLoad = function () {
		$http.get('http://localhost:4040/api/repositories')
			.success(function (repositories) {
				$scope.repositories = repositories;
			});
	}

	thisCtrl.repositoriesLoad();

	thisCtrl.selectView = function (view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.selectRepository = function (repository) {
		$scope.filtered.repository = repository;
		sidebarService.setRepository(repository);
		$route.reload();
		thisCtrl.referencesLoad(repository._id);
	}

	// Load all References
	thisCtrl.referencesLoad = function (repositoryId) {
		if (repositoryId) {
			let requestUrl = 'http://localhost:4040/api/references/enhanced/repository/' + repositoryId;
			$http.get(requestUrl)
				.success(function (references) {
					$scope.references = references;
				});
		}	
	}

	thisCtrl.selectDebt = function (debt) {
		var index = $.inArray(debt, $scope.filtered.debts);
		if (index > -1) {
			$scope.filtered.debts.splice(index, 1);
		} else {
			$scope.filtered.debts.push(debt);
		}
		$route.reload();
	}

	thisCtrl.analyzeDebts = function () {
		var analyze = true;
		if ($scope.filtered.repository == null) {
			alertModalService.setMessage("Please Select a Repository!");
			analyze = false;
		}
		else if ($scope.filtered.references.length == 0) {
			alertModalService.setMessage("Please Select What Versions Will be Analyzed!");
			analyze = false;
		}
		else if ($scope.filtered.debts.length == 0) {
			alertModalService.setMessage("Please Select What Technical Debts Will be Analyzed!");
			analyze = false;
		}

		if (analyze) {
			$('#progressBarModal').modal('show');
			$('#progressBarModal').on('hidden.bs.modal', function (e) {
				thisCtrl.selectView('tdanalyzer');
				$location.path("/tdanalyzer");
				$route.reload();
			});
		} else {
			$('#alertModal').modal('show');
		}
	}

});