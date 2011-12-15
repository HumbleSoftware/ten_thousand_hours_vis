(function (global, name, module) { module.apply(global, [name]); })(
this,               // Global
'TenThousandHours', // Name
function (name) {   // Module

// Namespacing
var
  H = Humble.Vis,
  E = Flotr.EventAdapter,
  ten = this[name] || {};

this[name] = ten;


// Vis declaration
function Vis (container, data) {
  this.container = container;
  this.data = data;
  setConfig.apply(this);
  this.draw();
}
ten.Vis = Vis;


// Configuration
ten.Vis.config = {

  summary : {
    name    : 'cumulative',
    height  : 240,
    width   : 600,
    flotr   : {
      lines : {
        fill : true,
        fillOpacity : .2
      },
      yaxis : { 
        noTicks : 3,
        showLabels : true,
        min : 0,
        max : 60 * 10000
      },
      xaxis : {
        max : 10000,
        min: 0,
        showLabels : true,
        tickFormatter : function (n) { 
          if (n == 0) return '';
          var tickDate = (new Date(Date.parse(this.dates[1]) + n * 1000 * 60 * 60 * 24)); // Double check this index please
          return tickDate.getMonth()+'/'+tickDate.getDate()+'/'+tickDate.getFullYear();
        }
      }
    }
  },

  entries : {
    name    : 'practice',
    height  : 80,
    width   : 600,
    skipPreprocess : true,
    flotr   : {
      title : 'Daily Time by Category:',
      bars : { show : true, stacked : true },
      mouse: {
        track: true,
        trackY: false,
        position: 'ne',
        trackDecimals: 0
      },
      legend : {
        position : 'ne',
        show : true
      }
    }
  },

  totals : {
    name    : 'summary',
    height  : 80,
    width   : 600,
    flotr   : {
      lines : {
        fill : true,
        fillOpacity : .2
      },
      mouse : {
        track: true,
        trackY: false,
        sensibility: 1,
        trackDecimals: 4,
        trackFormatter: function (o) {
          var
            x = Math.floor(o.x),
            text = this.descriptions[x],
            t = 0,
            value,
            i;

          if (!text) {
              for (i = 0; i < this.entries.length; i++) {
                value = _.find(this.entries[i].data, function (d) {
                  return d[0] == x;
                });
                if (value) t += value[1];
              }
              t = Math.round(t * 100 / 60) / 100;
              text = t + ' hours';
          }
          
          text = this.dates[x] + ': ' + text;

          return (text);
        },
        position: 'ne'
      },
      xaxis : {
        noTicks: 5,
        showLabels : true
      },
      handles   : { show : true },
      selection : { mode : 'x'},
      grid : {
        verticalLines : false
      }
    }
  }
};

Vis.prototype = {
  draw : function () {
    var
      config    = this.config,
      vis       = new H.Visualization();
      summary   = new H.Child(config.summary);
      entries   = new H.Child(config.entries);
      totals    = new H.Child(config.totals);
      selection = new H.Interaction({leader : totals});
      hit       = new H.Interaction();

    vis.add(summary);
    vis.add(entries);
    vis.add(totals);
    vis.render(this.container);

    selection.add(H.Action.Selection);
    selection.follow(entries);

    hit.add(H.Action.Hit);
    hit.group([entries, totals]);
  }
};

function setConfig () {
  var
    data    = this.data,
    config  = Vis.config,
    summary = Flotr.clone(config.summary),
    entries = Flotr.clone(config.entries),
    totals  = Flotr.clone(config.totals);

  summary.data  = data.totals;
  entries.data  = data.entries;
  totals.data   = data.totals;

  this.config = {
    summary : summary,
    entries : entries,
    totals : totals
  };

  bindFormattersToData(this.config, data);
  configureStart(this.config, data);
}

function bindFormattersToData (config, data) {
  config.totals.flotr.mouse.trackFormatter = _.bind(
    config.totals.flotr.mouse.trackFormatter,
    data
  );
  config.summary.flotr.xaxis.tickFormatter = _.bind(
    config.summary.flotr.xaxis.tickFormatter,
    data
  );
}

function configureStart (config, data) {
  var
    start = data.start || 0,
    total = data.total || 60 * 10000, // ten thousand hours
    xmax  = total - start,
    ymax  = total - start,
    flotr = config.summary.flotr;

  flotr.yaxis.ticks = [
      [0, '<div class="start">'+start+'h</div>'],
      [ymax - 4000 * 60, '<div class="end">6000h</div>'],
      [ymax - 2000 * 60, '<div class="end">8000h</div>'],
      [ymax, '<div class="end">10000h</div>']
  ];
  flotr.yaxis.max = ymax;
  flotr.xaxis.max = xmax / 60;
  console.log(flotr.yaxis.max, flotr.xaxis.max)
}

});
