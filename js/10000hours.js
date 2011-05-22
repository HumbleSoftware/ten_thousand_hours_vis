
Event.observe(document, 'dom:loaded', function() {

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
        
        if (n == this.max) {
            return false;
        }
        
        return n+'h';
    };
    
    HumbleFinance.xTickFormatter = function (n) { 
        if (n == 0) return '';
        return dates[n];
    };
    
    HumbleFinance.init('humblefinance', totals, practices, totals);
//    HumbleFinance.setFlags(flagData);
});
