var flowerView = function () {
    "use strict";
    var conf = {
	diagonal : 100,
	values : [],
	fontsize : 12
    };

    var radius = conf.width / 2;
    var radii = conf.values.length;
    var radians = 2 * Math.PI / radii;
    // var color = d3.scale.category20c();
    
    var render = function (div) {

    	var container = d3.select(div);
    	radius = conf.diagonal / 2;

	//var valsExtent = d3.extent(conf.values);
	var sizeScale = d3.scale.linear()
	    .domain([0, d3.extent(conf.values)[1]])
	    .range([0, radius]);
		
	var colorScale = d3.scale.linear()
	    .domain([0, d3.extent(conf.values)[1]])
	    .range(["#f7fbff","#08306b"]);
		
	var origin = [~~(conf.width/2), ~~(conf.height/2)];
	var svg = container.append("svg")
	    .attr("width", conf.diagonal)
	    .attr("height", conf.diagonal)
	    .append("g")
	    .attr("transform", "translate(" + radius + "," + radius + ")");

	var label = function (l, r, d) {
	    var x = l * Math.cos(r);
	    var y = l * Math.sin(r);
	    var realx = d * Math.cos(r);
	    var realy = d * Math.sin(r);
	    
	    var rads = Math.atan2(0-x, 0-y) * 180 / Math.PI;
	    if (rads < 0) {
		rads = rads + 360;
	    }
	    var offset = 20;
	    
	    svg.append("text")
		.attr("x", origin[0])
		.attr("y", origin[1])
		.attr("font-size", conf.fontsize)
		.attr("text-anchor", (!isReversed(rads)? "start" : "end"))
	        .attr("transform", "translate(" + (0-Math.sin(r)*20) + "," + (0-Math.cos(r)*20) + ")rotate(" + (rads) + ")rotate(" + (!isReversed(rads)?0:180) + ")")
		.text("Leaf label");

	    function isReversed (d) {
		return (d>90 && d<270);
	    }
	    
	};
	
	var petal = function (l, r, d, color) {
	    var x = l * Math.cos(r);
	    var y = l * Math.sin(r);
	    var rads = Math.atan2(0-x, 0-y) * 180 / Math.PI;
	    
	    var realx = d * Math.cos(r);
	    var realy = d * Math.sin(r);

	    var rx = l * 0.8 * Math.cos(r+(radians/2));
	    var ry = l * 0.8 * Math.sin(r+(radians/2));
	    var realrx = d * 0.8 * Math.cos(r+(radians/2));
	    var realry = d * 0.8 * Math.sin(r+(radians/2));

	    var lx = l * 0.8 * Math.cos(r-(radians/2));
	    var ly = l * 0.8 * Math.sin(r-(radians/2));
	    var reallx = d * 0.8 * Math.cos(r-(radians/2));
	    var really = d * 0.8 * Math.sin(r-(radians/2));

	    // svg.append ("line")
	    // 	.attr("class", "stitches")
	    // 	.attr("x1", origin[0])
	    // 	.attr("y1", origin[1])
	    // 	.attr("x2", origin[0] + x)
	    // 	.attr("y2", origin[1] + y)

	    // svg.append("line")
	    // 	.attr("class", "stitches")
	    // 	.attr("x1", origin[0])
	    // 	.attr("y1", origin[1])
	    // 	.attr("x2", origin[0] + rx)
	    // 	.attr("y2", origin[1] + ry)

	    // svg.append("line")
	    // 	.attr("class", "stitches")
	    // 	.attr("x1", origin[0] + rx)
	    // 	.attr("y1", origin[1] + ry)
	    // 	.attr("x2", origin[0] + x)
	    // 	.attr("y2", origin[1] + y);

	    // svg.append("line")
	    // 	.attr("class", "stitches")
	    // 	.attr("x1", origin[0])
	    // 	.attr("y1", origin[1])
	    // 	.attr("x2", origin[0] + lx)
	    // 	.attr("y2", origin[1] + ly)

	    // svg.append("line")
	    // 	.attr("class", "stitches")
	    // 	.attr("x1", origin[0] + lx)
	    // 	.attr("y1", origin[1] + ly)
	    // 	.attr("x2", origin[0] + x)
	    // 	.attr("y2", origin[1] + y);

	    var line = d3.svg.line()
		.x(function (d) {return d.x;})
		.y(function (d) {return d.y;})
		.interpolate("basis");

	    // max petal size (dotted)
	    var data = [
		{x:origin[0],  y:origin[1]},
		{x:origin[0]+rx, y:origin[1]+ry},
		{x:origin[0]+x, y:origin[0]+y},
		{x:origin[0]+lx, y:origin[0]+ly},
		{x:origin[0],  y:origin[1]}
	    ];

	    // real petal size
	    var realData = [
		{x:origin[0],  y:origin[1]},
		{x:origin[0]+realrx, y:origin[1]+realry},
		{x:origin[0]+realx, y:origin[1]+realy},
		{x:origin[0]+reallx, y:origin[1]+really},
		{x:origin[0],  y:origin[1]}
	    ];
	    
	    svg.append("path")
		.attr("class", "stitches")
		.attr("d", line(data));

	    svg.append("path")
		.attr("class", "petal")
	    //.attr("d", line(realData))
		.attr("d", line(realData))
	    //.attr("fill", color(x));
		.attr("fill", function () {return color});

	};

	var petals = function () {
	    var r = 0;
	    conf.values.forEach (function (d, i) {
		var l = radius;
		//petal (l, r, scale(d));
		petal (l, r, sizeScale(d), colorScale(d));
		r += radians;
	    })

	    conf.values.forEach (function (d, i) {
		var l = radius;
		//petal (l, r, scale(d));
		label (l, r, sizeScale(d));
		r += radians;
	    })
	};
	petals();
    };

    render.values = function (vals) {
	if (!arguments.length) {
	    return conf.values;
	}
	conf.values = vals;
	radii = vals.length;
	radians = 2 * Math.PI / radii
	return this;
    };

    render.diagonal = function (d) {
	if (!arguments.length) {
	    return conf.diagonal;
	}
	conf.diagonal = d;
	return this;
    };

    render.fontsize = function (f) {
	if (!arguments.length) {
	    return conf.fontsize;
	}
	conf.fontsize = f;
	return this;
    };
    
    return render;
};



/*
Polymer('cttv-associations-overview',{
    width : "100",
    height : "100",
    target : undefined,
    disease : undefined,
    ready : function () {
	var svg = this.shadowRoot.querySelector("svg");
	flower = flowerView()
	// .values([0,5,0,18,8,0])
	    .values([0,0,5,0,18,8])
	    //.values([2,2,5,3,4,3])
	    // .target(this.target)
	    // .disease(this.disease)
	    // .width(this.width)
	    // .height(this.height);
	flower(svg);
    }
});
*/
