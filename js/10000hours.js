(function () {

    var startTime = 4218;

    HumbleFinance.trackFormatter = function (obj) {
        
        var x = Math.floor(obj.x),
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
    };
    
    HumbleFinance.yTickFormatter = function (n) {
        n = parseFloat(n) + startTime;
        return n+'h';
    };
    
    HumbleFinance.xTickFormatter = function (n) { 
        if (n == 0) return '';
        var tickDate = (new Date(Date.parse(dates[1]) + n * 1000 * 60 * 60 * 24));
        return tickDate.getMonth()+'/'+tickDate.getDate()+'/'+tickDate.getFullYear();
    };
    
    HumbleFinance.init('humblefinance', totals, practices, totals, {startTime : startTime});

    var message, flagData;

    message = '<div>'+(startTime + Math.round(totals[totals.length-1][1]))+' Total Hours, ';
    message += dates[totals.length-1]+'</div>';
    flagData = [[totals.length-1, message]];

    HumbleFinance.setFlags(flagData);
})();
