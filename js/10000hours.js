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

// Options


// Vis declaration
function Vis (container, data) {
  this.container = container;
  this.data = data;
  this.draw();
}
ten.Vis = Vis;

var
  start = 4218,
  ymax = 10000 - start,
  xmax = 10000 - start;

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
        max : ymax,
        ticks : [
            [0, '<div class="start">'+start+'h</div>'],
            [ymax - 4000, '<div class="end">6000h</div>'],
            [ymax - 2000, '<div class="end">8000h</div>'],
            [ymax, '<div class="end">10000h</div>']
        ]
      },
      xaxis : {
        max : xmax,
        min: 0,
        showLabels : true,
        tickFormatter : function (n) { 
          if (n == 0) return '';
          var tickDate = (new Date(Date.parse(dates[1]) + n * 1000 * 60 * 60 * 24)); // Double check this index please
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
          var x = Math.floor(o.x),
              text = descriptions[x];

          if (!text) {
              var t = 0;
              for (var i = 0; i < practices.length; i++) {
                  t += parseFloat(practices[i].data[x][1]);
              }
              t = Math.round(t * 100) / 100;
              text = t + ' hours';
          }
          
          text = dates[x] + ': ' + text;

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
      config    = this.getConfig(),
      vis       = new H.Visualization();
      summary   = new H.Child(config.summary);
      entries   = new H.Child(config.entries);
      totals    = new H.Child(config.totals);
      selection = new H.Interaction({leader : totals});
      hit       = new H.Interaction();

      console.log(config);

    vis.add(summary);
    vis.add(entries);
    vis.add(totals);
    vis.render(this.container);

    selection.add(H.Action.Selection);
    selection.follow(entries);

    hit.add(H.Action.Hit);
    hit.group([entries, totals]);
  },
  getConfig : function () {
    var
      data    = this.data,
      config  = Vis.config,
      summary = _.clone(config.summary),
      entries = _.clone(config.entries),
      totals  = _.clone(config.totals);

    summary.data  = data.totals;
    entries.data  = data.entries;
    totals.data   = data.totals;

    return {
      summary : summary,
      entries : entries,
      totals : totals
    };
  }
};

});
