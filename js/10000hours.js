(function () {

  // Configuraiton
  var
    H = Humble.Vis,
    E = Flotr.EventAdapter,

    container = document.getElementById('vis'),

    start = 4218,
    ymax = 10000 - start,
    xmax = 10000 - start,

    cumulativeOptions = {
      name    : 'cumulative',
      height  : 240,
      width   : 600,
      data    : totals,
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

          /*,
          tickFormatter : function (n) {
            return (n == this.max ? false : '$'+n);
          }
          */
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

    practiceOptions = {
      name    : 'practice',
      height  : 80,
      width   : 600,
      data    : practices,
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

    summaryOptions = {
      name    : 'summary',
      height  : 80,
      width   : 600,
      data    : totals,
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
            /*
            var data = jsonData[o.nearest.x];
            return data.date + " Price: " + data.close + " Vol: " + data.volume;
            */
          },
          position: 'ne'
        },
        xaxis : {
          noTicks: 5,
          showLabels : true
          /*,
          tickFormatter : function (n) {
            return jsonData[n].date.split(' ')[2];
            return (parseInt(n) === 0 ? false : jsonData[n].date.split(' ')[2]);
          }
          */
        },
        handles   : { show : true },
        selection : { mode : 'x'},
        grid : {
          verticalLines : false
        }
      }
    },

    vis, price, volume, summary, selection, hit;

  // Application

  vis = new H.Visualization();
  cumulative = new H.Child(cumulativeOptions);
  practice = new H.Child(practiceOptions);
  summary = new H.Child(summaryOptions);
  selection = new H.Interaction({leader : summary});
  hit = new H.Interaction();

  vis.add(cumulative);
  vis.add(practice);
  vis.add(summary);
  vis.render(container);

  selection.add(H.Action.Selection);
  selection.follow(practice);

  hit.add(H.Action.Hit);
  hit.group([practice, summary]);
})();

