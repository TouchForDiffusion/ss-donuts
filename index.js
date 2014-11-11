(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('d3'), require('underscore'));
  } else if (typeof define === 'function' && define.amd) {
    define(['d3', '_'], function (d3, _) {
      return (root.returnExportsGlobal = factory(d3, _));
    });
  } else {
    root.Donuts = factory(root.d3, root._);
  }
}(this, function (d3, _) {

  var numberFormat = function(number, dec, dsep, tsep) {
    if (isNaN(number) || number === null) return '';

    number = number.toFixed(~~dec);
    tsep = typeof tsep == 'string' ? tsep : ',';

    var parts = number.split('.'), fnums = parts[0],
      decimals = parts[1] ? (dsep || '.') + parts[1] : '';

    return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
  };

  var Donuts = function(wrapper, datas, options) {

    options = options || {};

    var width = options.width || 250;
    var height = options.width || 250;
    var hoverScale = options.hoverScale || 0.08;
    var innerRadius = options.innerRadius || Math.floor(width/4);
    var outerRadius = options.outerRadius || Math.floor(width/2) - Math.floor((width/2) * hoverScale);

    this.options = _.extend({
      width: width,
      height: height,
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      hoverScale: hoverScale,
      innerRadiusHover: innerRadius - Math.floor(innerRadius * hoverScale),
      outerRadiusHover: Math.floor(width/2),
      totalLabel : "Total",
      dataLabel: "label",
      dataValue: "value",
      ease: "linear",
      duration: 80,
      decimalNumber: 0,
      decimalSeparator: '.',
      thousandSeparator: ',',
      unitLabel: null
    }, options);
    
    this.colors = options.colors ? d3.scale.ordinal().range(options.colors) : d3.scale.category20(); 
    this.datas = datas;
    this.wrapper = wrapper;
    this.init();
  };
  
  Donuts.prototype = {

    getSum: function() {
      if (undefined === this.sum) {
        
        this.sum = 0;
        this.datas.forEach(function(d) {
          this.sum += d[this.options.dataValue];
        }.bind(this));
        
      }
      return this.sum;
    },

    format: function(n) {
      var format;
      if (typeof this.options.format === 'function') {
        format = this.options.format(n);
      } else {
        format = numberFormat(n, this.options.decimalNumber, this.options.decimalSeparator, this.options.thousandSeparator);
      }

      return format;
    },

    init: function () {
      var that = this;
      var pie = d3.layout.pie();

      pie.value(function(d, i) {
        return d[this.options.dataValue];
      }.bind(this));

      var arc = d3.svg.arc()
          .innerRadius(this.options.innerRadius)
          .outerRadius(this.options.outerRadius);

      var arcHover = d3.svg.arc()
          .innerRadius(this.options.innerRadiusHover)
          .outerRadius(this.options.outerRadiusHover);

      var svg = d3.select(this.wrapper).append("svg")
          .attr("class", "donuts")
          .attr("width", this.options.width)
          .attr("height",this.options.height);

      var textGroup = svg.append("svg:g")
          .attr("class", "ctrGroup")
          .attr("transform", "translate(" + (this.options.width / 2) + "," + (this.options.height / 2) + ")");

      var totalLabel = textGroup.append("svg:text")
          .attr("class", "donuts-total-label")
          .attr("dy", -15)
          .attr("text-anchor", "middle")
          .text(this.options.totalLabel);

      var totalValue = textGroup.append("svg:text")
          .attr("class", "donuts-total")
          .attr("dy", 7)
          .attr("text-anchor", "middle")
          .text(this.format(this.getSum()));

      var unitLabel = textGroup.append("svg:text")
          .attr("class", "donuts-unit")
          .attr("dy", 21)
          .attr("text-anchor", "middle")
          .text(this.options.unitLabel);
        
      var arcs = svg.selectAll("g.arc")
          .data(pie(this.datas))
          .enter()
          .append("g")
          .attr("class", "donits-arc")
          .attr("transform", "translate(" + (this.options.width / 2) + ", " + (this.options.height / 2) + ")");

      arcs.append("path")
          .attr("fill", function (d, i) {
            return this.colors(i);
          }.bind(this))
          .attr("d", arc)
          .on("mouseenter", function(d, i) {
            totalLabel.attr("fill", that.colors(i)).text(that.datas[i][that.options.dataLabel]);
            totalValue.text(that.format(that.datas[i][that.options.dataValue]));
            d3.select(this)
              .transition()
              .duration(that.options.duration)
              .ease(that.options.ease)
              .attr("d", arcHover);
          })
          .on("mouseleave", function() {
            totalLabel.text(that.options.totalLabel).attr("fill", "#444");
            totalValue.text(that.format(that.getSum()));
            d3.select(this)
              .transition()
              .duration(that.options.duration)
              .ease(that.options.ease)
              .attr("d", arc);
          });
      
      this.svg = svg;
    },

    config: function(name, value) {
      throw new Error('not yet implemented');
    },

    update: function(datas) {
      datas = datas || this.datas;
      throw new Error('not yet implemented');
    },

    remove: function() {
      this.svg.remove();
    }
  };
  
  return Donuts;
  
}));