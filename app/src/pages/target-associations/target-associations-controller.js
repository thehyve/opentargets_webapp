/* Add to the ot controllers module */
angular.module('otControllers')

    /**
     * AssociationsCtrl
     * Controller for the target associations page
     */
    .controller('TargetAssociationsController', ['$scope', '$location', 'otUtils', 'otApi', 'otFacetsState', 'otDictionary', 'otLocationState', 'otConfig', 'otGoogleAnalytics', function ($scope, $location, otUtils, otApi, otFacetsState, otDictionary, otLocationState, otConfig, otGoogleAnalytics) {
        'use strict';

        otLocationState.init();   // does nothing, but ensures the otLocationState service is instantiated and ready


        // Initial setup


        // scope vars
        $scope.search = {
            query: ''
        };

        $scope.labels = {
            therapeutic_areas: otDictionary.THERAPEUTIC_AREAS
        };

        $scope.n = {
            diseases: '...' // this should be a number, but initialize to "..." for better user feedback
        };

        // the scope view is essentially the state
        $scope.view = {
            t: ['table']    // t = the selected tab
        };

        $scope.loading = false;

        // set page facets (from config)
        var facetNames = otConfig.targetAssociationsFacets.facets;
        otFacetsState.setPageFacetNamesFromConfig(facetNames);

        // state we want to export to/from the URL
        var stateId = 'view';
        var cancersExcId = 'cancers';
        var facetsId = otFacetsState.stateId;


        /*
         * The view is essentially the state for the page;
         * filters are autonomous and do their own business
         */
        var setView = function (obj) {
        // should work also for obj==undefined at page load
        // or if navigating back through browser history

        // define defaults as needed
            obj = obj || {};
            obj.t = obj.t || ['table'];

            // update the scope; only the tab is needed at the moment
            $scope.view.t = obj.t;
        };

        var setCancersExclusion = function (obj) {
            obj = obj || {};
            obj.exc = obj.exc ? [(obj.exc[0] === 'true')] : [false];

            $scope.cancersExcluded = obj.exc[0];
        };


        /*
         * Takes object from locationStateService, initialize the page/component state and fire a query which then updates the screen
         */
        var render = function (new_state, old_state) {
            // here we want to update facets, tabs, etc:
            // 1. first we check if the state of a particular element has changed;
            // 2. if it hasn't changed, and it's undefined (new=undefined, old=undefined),
            // then it's a page load with no state specified, so we update that element anyway with default values
            // facets changed?
            if (! _.isEqual(new_state[facetsId], old_state[facetsId]) || !new_state[facetsId]) {
                getFacets(new_state[facetsId]);
            }

            // view changed?
            if (! _.isEqual(new_state[stateId], old_state[stateId]) || !new_state[stateId]) {
                setView(new_state[stateId]);
            }

            // exclude cancers changed?
            if (! _.isEqual(new_state[cancersExcId], old_state[cancersExcId]) || !new_state[cancersExcId]) {
                setCancersExclusion(new_state[cancersExcId]);
            }
        };


        /*
         * Get facets data as well general page info data (e.g. count, labels etc)
         */
        function getFacets (filters) {
        // Set the filters
            $scope.filters = filters;

            var opts = {
                target: $scope.search.query,
                outputstructure: 'flat',
                facets: true,
                direct: true,
                size: 1
            };
            opts = otApi.addFacetsOptions(filters, opts);
            var queryObject = {
                method: 'GET',
                params: opts
            };

            otApi.getAssociations(queryObject)
                .then(function (resp) {
                    $scope.search.total = resp.body.total;
                    if (resp.body.total) {
                        $scope.search.label = resp.body.data[0].target.gene_info.symbol;

                        // set the filename
                        $scope.search.filename = otDictionary.EXP_TARGET_ASSOC_LABEL + resp.body.data[0].target.gene_info.symbol;

                        // Set the total number of diseases
                        $scope.n.diseases = resp.body.total;

                        // Update the facets
                        otFacetsState.updatePageFacetsFromApiData(resp.body.facets, otConfig.targetAssociationsFacets.count);
                    } else {
                        // Check if there is a profile page
                        var profileOpts = {
                            method: 'GET',
                            params: {
                                target_id: $scope.search.query
                            }
                        };
                        otApi.getTarget(profileOpts)
                            .then(function (profileResp) {
                                $scope.search.label = profileResp.body.approved_symbol;
                            });
                    }
                },
                otApi.defaultErrorHandler);
        }


        /*
         * Update function passes the current view (state) to the URL
         * Also the current status for excluding cancers is updated
         */
        function update () {
            otLocationState.setStateFor(stateId, $scope.view);
            otLocationState.setStateFor(cancersExcId, $scope.cancers);
        }


        /*
         * Called from the tables in the HTML, this sets the active tab id.
         * Valid tabs are: "bubbles", "table", "tree".
         */
        $scope.setActiveTab = function (tab) {
            $scope.view.t[0] = tab;
            update();
            var label = tab + '-tab';
            otGoogleAnalytics.trackEvent('associations', 'view', label);
        };


        /**
         * Used to track link/button clicks from the HTML
         */
        $scope.trackClick = function (label) {
            otGoogleAnalytics.trackEvent('associations', 'btn-click', label);
        };


        //
        // on STATECHANGED
        // Set up a listener for the URL changes and when the search change, get new data
        //


        $scope.$on(otLocationState.STATECHANGED, function (evt, new_state, old_state) {
            render(new_state, old_state); // args is the same as getState()
        });


        $scope.cancersExcluded = false;
        $scope.excludeCancers = function () {
            $scope.cancersExcluded = !$scope.cancersExcluded;
            $scope.cancers = {
                exc: [$scope.cancersExcluded]
            };
            update();

            // Update facets
            // TODO: We are passing the "exclude cancers" option as a new option. Another option could be joining this with the passed filters
            // if ($scope.cancersExcluded) {
            //     if (!$scope.filters) {
            //         $scope.filters = {};
            //     }
            //     $scope.filters["cancersExcluded"] = true;
            // } else {
            //     // TODO: Not sure this is needed
            //     if (!Object.keys($scope.filters).length) {
            //         delete $scope.filters;
            //     }
            // }
        };

        //
        // on PAGE LOAD
        //

        otUtils.clearErrors();
        $scope.search.query = $location.path().split('/')[2];
        $scope.filters = otLocationState.getState()[facetsId] || {};

        render(otLocationState.getState(), otLocationState.getOldState());
    }]);
