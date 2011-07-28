////////////////////////////////////////////////////////////////////
// Copyright (c) 2010 Humble Software Development
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
////////////////////////////////////////////////////////////////////

/**
 * HumbleFinance Flotr Financial Charts
 *
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @author Carl Sutherland
 * @version 1.1.0
 */
(function () {
var D = Flotr.DOM, E = Flotr.EventAdapter;
window.HumbleFinance = {

    /**
     * ID of element to attach chart
     *
     * @member String
     */
    id: null,
    /**
     * Graphs used to display data
     *
     * @member Object
     */
    graphs: {price: null, volume: null, summary: null},
    /**
     * Div containers for graphs
     *
     * @member Object
     */
    containers: {price: null, volume: null, summary: null, flags: null},
    /**
     * Div handles for interaction with graphs
     *
     * @member Object
     */
    handles: {left: null, right: null, scroll: null},
    /**
     * Bounds on data
     *
     * @member Object
     */
    bounds: {xmin: null, xmax: null, ymin: null, ymax: null},
    /**
     * Array of data displayed in first graph.
     *
     * @member Array
     */
    priceData: [],
    /**
     * Array of data displayed in second graph
     *
     * @member Array
     */
    volumeData: [],
    /**
     * Array of data to serve as a visual summary of the above graphs
     *
     * @member Array
     */
    summaryData: [],
    /**
     * An array of data to be used to display flags.
     *
     * @member Array
     */
    flagData: [],
    /**
     * Formatter for x axis ticks
     *
     * @member function
     */
    xTickFormatter: Flotr.defaultTickFormatter,
    /**
     * Formatter for y axis ticks
     *
     * @member function
     */
    yTickFormatter: Flotr.defaultTickFormatter,
    /**
     * Formatter for mouse tracking
     *
     * @member function
     */
    trackFormatter: Flotr.defaultTrackFormatter,


    /**
     * Initialization function
     *
     * @param String id
     * @param Array priceData
     * @param Array volumeData
     * @param Array summaryData
     */
    init: function(id, priceData, volumeData, summaryData, o) {

        // Set members
        this.o = o;
        this.id = id;
        this.priceData = priceData;
        this.volumeData = volumeData;
        this.summaryData = summaryData;

        // Set bounds to scale automatically in the y direction
        this.bounds.xmin = 0;
        this.bounds.xmax = this.priceData.length - 1;
        this.bounds.ymin = null;
        this.bounds.ymax = null;

        // Set up DOM
        this.buildDOM();
        this.attachEventObservers();

        // Initialize graphs, setting selection on summary
        var area = {
            x1: 0,
            y1: this.bounds.ymin,
            x2: 100,
            y2: this.bounds.ymax
        };
        this.graphs.summary = this.summaryGraph(this.summaryData, this.bounds);
        this.graphs.price = this.priceGraph(this.priceData, this.bounds);
        this.graphs.price.setSelection(area);
    },

    clearContainer: function() {
        /*
        var elems = ['priceGraph', 'volumeGraph', 'summaryGraph',
            'flagContainer', 'leftHandle', 'rightHandle', 'scrollHandle'];
        var id = this.id;
        elems.each(function(e) {
            el = $$("#" + id + " #" + e);
            if( el[0] && el[0].remove )
                el[0].remove();
        });
        */
    },

    /**
     * Build DOM elements and insert into container.
     */
    buildDOM: function () {

        var container = document.getElementById(this.id);
        this.clearContainer();

        // Build DOM element
        this.containers.price = D.node('<div id="priceGraph" style="width: 100%; height: 80px;"></div>');
            //new Element('div', {id: 'priceGraph', style: 'width: 100%; height: 80px;'});
        this.containers.volume = D.node('<div id="volumeGraph" style="width: 100%; height: 80px;"></div>');
            //new Element('div', {id: 'volumeGraph', style: 'width: 100%; height: 80px;'});
        this.containers.summary = D.node('<div id="summaryGraph" style="width: 100%; height: 240px;"></div>');
            //new Element('div', {id: 'summaryGraph', style: 'width: 100%; height: 240px;'});
        this.containers.flags = D.node('<div id="flagContainer"></div>');
            //new Element('div', {id: 'flagContainer'/*, style: 'width: 0px; height: 0px;'*/});
        this.handles.left = D.node('<div id="leftHandle" class="handle zoomHandle" style="display: none;"></div>');
            //new Element('div', {id: 'leftHandle', 'class': 'handle zoomHandle', style: 'display: none;'});
        this.handles.right = D.node('<div id="rightHandle" class="handle zoomHandle" style="display: none;"></div>'); 
            //new Element('div', {id: 'rightHandle', 'class': 'handle zoomHandle', style: 'display: none;'});
        this.handles.scroll = D.node('<div id="scrollHandle" class="handle scrollHandle" style="display: none;"></div>');
            //new Element('div', {id: '', 'class': 'handle scrollHandle', style: 'display: none;'});

        this.handles.left.onselectstart = function () { return false; };
        this.handles.right.onselectstart = function () { return false; };
        this.handles.scroll.onselectstart = function () { return false; };

        // Insert into container
        D.insert(container, this.containers.summary);
        D.insert(container, this.containers.volume);
        D.insert(container, this.containers.price);
        D.insert(container, this.containers.flags);
        D.insert(container, this.handles.left);
        D.insert(container, this.handles.right);
        D.insert(container, this.handles.scroll);
    },

    /**
     * Attach event observers
     */
    attachEventObservers: function() {

        // Attach summary click event to clear selection
        E.observe(this.containers.summary, 'flotr:click', _.bind(this.reset, this));

        // Attach observers for hit tracking on price and volume points
        E.observe(this.containers.volume, 'flotr:hit', _.bind(this.volumeHitObserver, this)).
            observe(this.containers.volume, 'flotr:clearhit', _.bind(this.clearHit, this)).
            observe(this.containers.price, 'flotr:hit', _.bind(this.priceHitObserver, this)).
            observe(this.containers.price, 'flotr:clearhit', _.bind(this.clearHit, this));

        // Handle observers
        E.observe(this.containers.price, 'flotr:select', _.bind(this.positionScrollHandle, this)).
            observe(this.containers.price, 'flotr:select', _.bind(this.positionZoomHandles, this)).
            observe(this.handles.left, 'mousedown', _.bind(this.zoomObserver, this)).
            observe(this.handles.right, 'mousedown', _.bind(this.zoomObserver, this)).
            observe(this.handles.scroll, 'mousedown', _.bind(this.scrollObserver, this));

        // On manual selection, hide zoom and scroll handles
        E.observe(this.containers.price, 'mousedown', _.bind(this.hideSelection, this));

        // Attach summary selection event to redraw price and volume charts
        E.observe(this.containers.price, 'flotr:select', _.bind(this.selectObserver, this));
    },

    /**
     * Summary Graph Selection Observer
     *
     * @param e MouseEvent
     */
    selectObserver: function (area, graph) {

        var xmin = Math.floor(area.x1),
            xmax = Math.ceil(area.x2),
            newBounds = {'xmin': xmin, 'xmax': xmax, 'ymin': null, 'ymax': null};

        var volumeData = [];
        for (var i = 0; i < this.volumeData.length; i++) {
            volumeData[i] = {
                label : this.volumeData[i].label,
                data  : this.volumeData[i].data.slice(xmin, xmax+1)
            };
        }

        this.graphs.volume = this.volumeGraph(volumeData, newBounds);

        this.drawFlags();
    },

    /**
     * Reset to null selection
     */
    reset: function () {
        this.graphs.price = this.priceGraph(this.priceData, this.bounds);
        this.graphs.volume = this.volumeGraph(this.volumeData, this.bounds);
        this.handles.left.hide();
        this.handles.right.hide();
        this.handles.scroll.hide();

        this.drawFlags();
    },

    /**
     * Hide selection and handles
     */
    hideSelection: function () {

        // Hide handles
        D.hide(this.handles.left);
        D.hide(this.handles.right);
        D.hide(this.handles.scroll);

        // Clear selection
        this.graphs.summary.clearSelection();
    },

    /**
     * Set the position of the scroll handle
     *
     * @param e MouseEvent
     */
    positionScrollHandle: function (position, graph) {

        var x1          = position.x1,
            x2          = position.x2,
            xaxis       = graph.axes.x,
            plotOffset  = graph.plotOffset,
            offsetX     = this.containers.price.offsetLeft,
            offsetY     = this.containers.price.offsetHeight,
            graphHeight = D.size(this.containers.price).height,
            height      = D.size(this.handles.scroll).height,
            width, xPosLeft, yPos;

        // Set width
        width = Math.floor(xaxis.d2p(x2) - xaxis.d2p(x1)) + 8;
        width = (width < 10) ? 18 : width;

        // Set positions
        xPosLeft = Math.floor(offsetX + plotOffset.left + xaxis.d2p(x1) + (xaxis.d2p(x2) - xaxis.d2p(x1) - width)/2);
        yPos     = Math.ceil(offsetY + graphHeight - 2);

        D.setStyles(this.handles.scroll, {position: 'absolute', left: xPosLeft+'px', width: width+'px'});
        D.show(this.handles.scroll);
    },

    /**
     * Begin scrolling observer
     *
     * @param e MouseEvent
     */
    scrollObserver: function (e) {

        var x             = e.clientX,
            offset        = D.position(this.handles.scroll), //cumulativeOffset(),
            prevSelection = this.graphs.price.prevSelection;

        /**
         * Perform scroll on handle move, observer
         *
         * @param e MouseEvent
         */
        var handleObserver = _.bind(function (e) {

            E.stopObserving(document, 'mousemove', handleObserver);

            var deltaX = e.clientX - x,
                xAxis  = this.graphs.price.axes.x,
                x1     = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x) + deltaX),
                x2     = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x) + deltaX),
                area;

            // Check and handle boundary conditions
            if (x1 < this.bounds.xmin) {
                x2 = this.bounds.xmin + (x2 - x1);
                x1 = this.bounds.xmin;
            }
            if (x2 > this.bounds.xmax) {
                x1 = this.bounds.xmax - (x2 - x1);
                x2 = this.bounds.xmax;
            }

            // Set selection area object
            area = {
                x1: x1,
                y1: prevSelection.first.y,
                x2: x2,
                y2: prevSelection.second.y
            };

            // If selection varies from previous, set new selection
            if (area.x1 != prevSelection.first.x) {
                this.graphs.price.setSelection(area);
            }

            E.observe(document, 'mousemove', handleObserver);
        }, this);

        /**
         * End scroll observer to detach event listeners
         *
         * @param e MouseEvent
         */
        function handleEndObserver (e) {
            E.stopObserving(document, 'mousemove', handleObserver).
              stopObserving(document, 'mouseup', handleEndObserver);
        };

        // Attach scroll handle observers
        E.observe(document, 'mousemove', handleObserver).
          observe(document, 'mouseup', handleEndObserver);
        // Event.observe(document, 'mousemove', handleObserver);
        // Event.observe(document, 'mouseup', handleEndObserver);
    },

    /**
     * Begin zooming observer
     *
     * @param e MouseEvent
     */
    zoomObserver: function (e) {

        var zoomHandle    = e.target,
            x             = e.clientX,
            offset        = D.position(zoomHandle),
            prevSelection = this.graphs.price.prevSelection;

        /**
         * Perform zoom on handle move, observer
         *
         * @param e MouseEvent
         */
        var handleObserver = _.bind(function (e) {

            E.stopObserving(document, 'mousemove', handleObserver);

            var deltaX = e.clientX - x,
                xAxis  = this.graphs.price.axes.x,
                x1,
                x2;

            // Set initial new x bounds
            if (zoomHandle.id == 'rightHandle') {
                x1 = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x));
                x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x) + deltaX);
            } else if (zoomHandle.id == 'leftHandle') {
                x1 = xAxis.p2d(Math.min(prevSelection.first.x, prevSelection.second.x) + deltaX);
                x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x));
            }

            // Check and handle boundary conditions
            if (x1 < this.bounds.xmin) {
                x1 = this.bounds.xmin;
            }
            if (x2 > this.bounds.xmax) {
                x2 = this.bounds.xmax;
            }
            if (x1 > this.bounds.xmax) {
                x1 = this.bounds.xmax;
            }
            if (x2 < this.bounds.xmin) {
                x2 = this.bounds.xmin;
            }

            // Set selection area object
            var area = {
                x1: x1,
                y1: prevSelection.first.y,
                x2: x2,
                y2: prevSelection.second.y
            };

            // If selection varies from previous, set new selection
            if (area.x1 != prevSelection.first.x || area.x2 != prevSelection.second.x) {
                this.graphs.price.setSelection(area);
            }

            E.observe(document, 'mousemove', handleObserver);
        }, this);

        /**
         * End zoom observer to detach event listeners
         *
         * @param e MouseEvent
         */
        function handleEndObserver (e) {
            E.stopObserving(document, 'mousemove', handleObserver).
              stopObserving(document, 'mouseup', handleEndObserver);
        };

        // Attach handler slide event listeners
        E.observe(document, 'mousemove', handleObserver).
          observe(document, 'mouseup', handleEndObserver);
    },

    /**
     * Perform a manual zoom.
     *
     * Zoom backwards from the right zoom handle.  If no selection or handles
     * are present, zoom backwards from the right hand side.
     *
     * @param integer x
     */
    zoom: function (x) {

        var prevSelection = this.graphs.price.prevSelection,
            xAxis = this.graphs.price.axes.x,
            x1, x2, y1, y2, area;

        // Check for previous selection
        if (!prevSelection) {
            x1 = Math.max(this.bounds.xmax - Number(x), this.bounds.xmin);
            x2 = this.bounds.xmax;
            y1 = 0;
            y2 = 0;
        } else {
            x2 = xAxis.p2d(Math.max(prevSelection.first.x, prevSelection.second.x));
            x1 = Math.max(x2 - Number(x), this.bounds.xmin);
            y1 = prevSelection.first.y;
            y2 = prevSelection.second.y;
        }

        area = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };

        this.graphs.price.setSelection(area);
    },

    /**
     * Set the position of the zoom handles
     *
     * @param e MouseEvent
     */
    positionZoomHandles: function (position, graph) {

        var x1         = position.x1,
            x2         = position.x2,
            xaxis      = graph.axes.x,
            plotOffset = graph.plotOffset,
            height     = D.size(this.containers.price).height,
            offsetX    = this.containers.price.offsetLeft,
            offsetY    = this.containers.price.offsetTop,
            dimensions, xPosOne, xPosTwo, xPosLeft, xPosRight, yPos;

        D.show(this.handles.left);
        dimensions = D.size(this.handles.left);

        // Set positions
        xPosOne   = Math.floor(offsetX+plotOffset.left+xaxis.d2p(x1)-dimensions.width/2+1);
        xPosTwo   = Math.ceil(offsetX+plotOffset.left+xaxis.d2p(x2)-dimensions.width/2);
        xPosLeft  = Math.min(xPosOne, xPosTwo);
        xPosRight = Math.max(xPosOne, xPosTwo);
        yPos      = Math.floor(height - offsetY/2 - dimensions.height/2);//offsetY+height/2 - dimensions.height/2);
        yPos      = Math.floor(offsetY+height/2 - dimensions.height/2);

        D.setStyles(this.handles.left, {position: 'absolute', left: xPosLeft+'px', top: yPos+'px'});
        D.setStyles(this.handles.right, {position: 'absolute', left: xPosRight+'px', top: yPos+'px'});
        D.show(this.handles.left);
        D.show(this.handles.right);
    },

    /**
     * Clear point hits for price and volume graphs.
     *
     * @param e MouseEvent
     */
    clearHit: function(e) {
        this.graphs.price.clearHit();//.mouseTrack.hide();
        this.graphs.volume.clearHit();
    },

    /**
     * Observer for volume hit to set price hit
     *
     * @param e MouseEvent
     */
    volumeHitObserver: function (e) {

        var point = this.priceData[e.memo[0].x];

        // Hide mouse track on volume graph
        this.graphs.volume.mouseTrack.hide();

        // Display hit on price graph
        Event.stopObserving(this.containers.volume, 'flotr:hit');
        this.doHit(this.graphs.price, point, this.containers.volume);
        Event.observe(this.containers.volume, 'flotr:hit', this.volumeHitObserver.bind(this));
    },

    /**
     * Observer for price hit to set volume hit
     *
     * @param e MouseEvent
     */
    priceHitObserver: function (e) {

        // Display hit on volume graph
        var point = this.volumeData[e.memo[0].x];
        Event.stopObserving(this.containers.price, 'flotr:hit');
        if( point ) this.doHit(this.graphs.volume, point, this.containers.price);
        Event.observe(this.containers.price, 'flotr:hit', this.priceHitObserver.bind(this));

        // Hide mouse track on volume graph
        if( this.graphs.volume.mouseTrack ) this.graphs.volume.mouseTrack.hide();
    },

    /**
     * Calculate hit location from one graph and perform hit on another
     *
     * @param Flotr.Graph graph  Destination graph.
     * @param Array point  The coordinates of the hit as [x, y].
     * @param Element container  The container of the source graph.
     */
    doHit: function (graph, point, container) {

        var offset = container.cumulativeOffset(),
            xaxis  = graph.axes.x,
            yaxis  = graph.axes.y,
            relX   = xaxis.d2p(point[0]),
            relY   = yaxis.d2p(point[1]),
            absX   = offset[0]+relX,
            absY   = offset[1]+relY,
            mouse  = {'relX': relX, 'relY': relY, 'absX': absX, 'absY': absY};

        graph.hit(mouse);
    },

    /**
     * Add flags to the graph.
     *
     * @param Array  An array of flags.
     */
    setFlags: function (flags) {
        this.flagData = flags;
        this.drawFlags();
    },

    /**
     * Draw flags on top of the graph.
     */
    drawFlags: function () {

        var graph = this.graphs.summary,
            div   = this.containers.price,
            xAxis = graph.axes.x,
            yAxis = graph.axes.y,
            min   = xAxis.datamin,
            max   = xAxis.datamax;

        D.empty(this.containers.flags);

        for (var i = 0; i < this.flagData.length; i++) {

            var x = this.flagData[i][0];

            if (x < min) {
                continue;
            } else if (x >= min && x <= max) {

                // Draw the flag
                var point       = this.priceData[x],
                    flagContent = this.flagData[i][1],
                    xPos        = xAxis.d2p(point[0]),
                    yPos        = yAxis.d2p(point[1]),
                    offset      = D.position(div),
                    left        = Math.floor(xPos + graph.plotOffset.left),
                    top         = Math.floor(yPos - 40 + graph.plotOffset.top);

                flag = D.node('<div class="flag" style="position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10"></div>');
                    //new Element('div', {'class': 'flag', 'style': 'position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10;'});
                D.insert(flag, flagContent);
                flagpole = D.node('<div class="flagpole" style="position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10; height: 40px;"></div>');
                    //new Element('div', {'class': 'flagpole', 'style': 'position: absolute; top: '+top+'px; left: '+left+'px; z-index: 10; height: 40px;'});
                D.insert(this.containers.flags, flag);
                D.insert(this.containers.flags, flagpole);

            } else if (x >= xmax) {
                break;
            }
        }
    },

    /**
     * Draw the price graph
     *
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    priceGraph: function (data, bounds) {

        var xmin = bounds.xmin,
            xmax = bounds.xmax,
            ymin = bounds.ymin,
            ymax = bounds.ymax,
            p, xAxis, yAxis;

        xAxis = {
            min        : xmin,
            max        : xmax, 
            margin     : false,
            showLabels : false
        };

        yAxis = {
            min             : ymin,
            max             : ymax, 
            margin          : false,
            tickFormatter   : this.yTickFormatter, 
            noTicks         : 4, 
            autoscaleMargin : .5, 
            tickDecimals    : 0
        };

        p = Flotr.draw(
            //$$('#' + this.id + ' #priceGraph')[0],
            this.containers.price,
            [data],
            {
                lines: {show: true, fill: true, fillOpacity: .1, lineWidth: 1},
                xaxis: xAxis,
                yaxis: yAxis,
                grid: {verticalLines: false, outlineWidth: 0, labelMargin: 0},
                mouse: {track: true, trackY: false, sensibility: 1, trackDecimals: 4, trackFormatter: this.trackFormatter, position: 'ne'},
                selection: {mode: 'x'},
                shadowSize: false,
                HtmlText: true
            }
        );

        return p;
    },

    /**
     * Draw the volume graph
     *
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    volumeGraph: function (data, bounds) {

        var legend = document.getElementById('legend'),
            xmin = bounds.xmin,
            xmax = bounds.xmax,
            ymin = bounds.ymin,
            ymax = bounds.ymax,
            v, xAxis, yAxis;

        xAxis = {
            min         : xmin,
            max         : xmax,
            margin      : false,
            showLabels  : false,
            labelsAngle : 60
        };

        yAxis = {
            min             : ymin, 
            max             : ymax, 
            margin          : false,
            autoscaleMargin : .5, 
            showLabels      : false, 
            tickDecimals    : 0
        };

        // HACK
        legend.innerHTML = '';

        v = Flotr.draw(
            //$$('#' + this.id + ' #volumeGraph')[0],
            this.containers.volume,
            data,
            {
                bars: {show: true, stacked: true, 'barWidth': .5, 'fill': true, 'lineWidth': 2, 'fillOpacity': 1},
                xaxis: xAxis,
                yaxis: yAxis,
                legend: {show: true, container : legend},
                grid: {verticalLines: false, horizontalLines: false, outlineWidth: 0, labelMargin: 0},
                mouse: {track: true, trackY: false, position: 'ne', trackDecimals: 0},
                shadowSize: false,
                HtmlText: true
            }
        );

        return v;
    },

    /**
     * Draw the summary graph
     *
     * @param Array data
     * @param Array bounds
     * @return Flotr.Graph
     */
    summaryGraph: function (data, bounds) {

        var xmin = bounds.xmin,
            xmax = bounds.xmax,
            ymin = bounds.ymin,
            ymax = bounds.ymax,
            noticks = xmax > 5 ? 5 : xmax,
            start = this.o.startTime,
            p, xAxis, yAxis, ticks;

        ymax = 10000 - start;
        xmax = 10000 - start;

        ticks = [
            [0, '<div class="start">'+start+'h</div>'],
            [ymax - 4000, '<div class="end">6000h</div>'],
            [ymax - 2000, '<div class="end">8000h</div>'],
            [ymax, '<div class="end">10000h</div>']
        ];

        xAxis = {
            min: 0, 
            max: xmax,
            noTicks: noticks,
            margin: false,
            tickFormatter: this.xTickFormatter, 
            labelsAngle: 60
        };

        yAxis = {
            min: ymin, 
            max: ymax,
            autoscaleMargin: .5,
            margin: false,
            tickDecimals: 0,
            ticks: ticks
        };

        p = Flotr.draw(
            //$$('#' + this.id + ' #summaryGraph')[0],
            this.containers.summary,
            [
                data
            ],
            {
                colors: ['#00A8F0', '#cccccc', '#cccccc'],
                lines: {show: true, fill: true, fillOpacity: .1, lineWidth: 1},
                xaxis: xAxis,
                yaxis: yAxis,
                grid: {verticalLines: false, horizontalLines: false,
                       labelMargin: 0, outlineWidth: 0},
                shadowSize: false,
                HtmlText: true
            }
        );

        return p;
    }
};

})();
