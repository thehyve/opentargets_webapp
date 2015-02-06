'use strict';

/* Directives */
angular.module('cttvDirectives', [])

    .directive('cttvTargetAssociations', function () {
	// var bView = bubblesView();
	// processData aggregates evidence by EFO id
	// TODO: This function may change once we have a final version of the API. In the meantime, counts are processed here
	// function processData (data) {
	//     var d = {};
	//     for (var i=0; i<data.length; i++) {
	// 	var label = data[i]["biological_object.efo_info.efo_label"];
	// 	if (d[label] === undefined) {
	// 	    d[label] = 1;
	// 	} else {
	// 	    d[label]++;
	// 	}
	//     }

	//     // var o = {name: "Root", children: []};
	//     // for (var j in d) {
	//     // 	o.children.push ( {"name":j, "value":d[j]} );
	//     // }
	//     // return o;
	//     //console.log(d);
	//     return d;
	// }

	function processData (full_data) {
	    var nested = d3.nest()
		.key(function(d) { return d["biological_object.efo_info.efo_label"]; })
	        .rollup(function(leaves) { return leaves.length; })
	        .entries(full_data);
	    var total = d3.sum(nested, function (d) {return d.values});
	    return {
		"key": "Root",
		"values": total,
		"children": nested
	    }
	};
	
	return {
	    restrict: 'EA',
	    scope: {},
	    link: function (scope, elem, attrs) {
		var api = cttvApi();
		var url = api.url.filterby({
		    gene:attrs.target,
		    datastructure:"simple",
		    size:1000
		});
		api.call(url, function (status, resp) {
		    scope.$parent.took = resp.took;
		    scope.$parent.nresults = resp.size;
		    scope.$parent.$apply();

		    // viewport Size
		    var viewportW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
		    var viewportH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		    console.log("WIDTH: " + viewportW + " -- HEIGHT: " + viewportH);

		    // Element Coord
		    var elemOffsetTop = elem[0].offsetTop;
		    console.log("ELEMOFFTOP: " + elemOffsetTop);

		    // BottomMargin
		    var bottomMargin = 30;

		    var diameter = viewportH - elemOffsetTop - bottomMargin;
		    
		    var bView = bubblesView()
			.data(bubblesView.node(processData(resp.data)))
			.value("values")
			.key("key")
			.diameter(diameter)
		    var ga = geneAssociations();
		    ga(bView, elem[0]);
		});		
	    }
	}
    })


    .directive('ebiExpressionAtlasBaselineSummary', function () {
	return {
	    restrict: 'EA',
	    templateUrl: "partials/expressionAtlas.html",
	    link: function (scope, elem, attrs) {
		var instance = new Biojs.ExpressionAtlasBaselineSummary ({
		    geneQuery : attrs.target,
		    proxyUrl : "",
		    rootContext : "http://www.ebi.ac.uk/gxa",
		    geneSetMatch : false,
		    target : "expressionAtlas"
		})
	    },
	}
    })


    .directive('cttvSearchSuggestions', function(){
    	return {
        	restrict:'EA',
        	templateUrl: 'partials/search-suggestions.html',
        	link: function(scope, elem, attrs){

        	}
        }	
    })


    .directive('cttvGeneDiseaseAssociation', function(){
    	return {
    		restrict:'EA',
    		scope: {
    			associationData: '='
    		},
        	link: function(scope, elem, attrs){
        		console.log("link()");
        		console.log(scope);
        		console.log(attrs.associationData);
        		var flower = flowerView().values(scope.associationData);
        		flower(elem[0]);
        		/*setTimeout(function(){
        			console.log("changing values...")
        			flower.values([3,4,5,6,7,8]);
        			//flower(elem[0]);
        		}, 4000);*/
        	}
    	}
    })
/*
angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
  */
