/**
 *
 * @returns {{update: Function, reinit: Function}}
 * @constructor
 */
function GoogleVisualizations () {
    var q = $({});
    var gvizinited = false;
    var vizs = [];
    var debug = function (msg) {
        //if (q) {
        //    console.log('At '+msg+', Queue has '+ q.queue().length+' items\nQ='+ q.queue());
        //} else {
        //    console.log('At '+msg+', no q');
        //}
    };

    function DiffGauge () {
        var gvgauge;
        var data;
        var initialized = false;

        var options = {
            max: 5,
            min: 1,
            yellowFrom: 1,
            yellowTo: 2,
            greenFrom: 2,
            greenTo: 4,
            redFrom: 4,
            redTo: 5,
            majorTicks: ["easy", "moderate", "hard"],
            minorTicks: 4,
            animation: {
                duration: 1000
            },
            height: 160,
            width: 160
        };
        var drawgauge = function (diff) {
            // Update and draw the visualization.
            try {
                data.setValue(0, 1, diff);
                gvgauge.draw(data, options);
            } catch (e) {
                alert('gauge error: '+ e);
            }

        };

        return {
            "initialize": function (targetid) {
                debug('dg init');
                q.queue(function (next) {
                    debug('dg init 2');
                    if (!initialized) {
                        gvgauge = new google.visualization.Gauge(document.getElementById(targetid));
                        data = google.visualization.arrayToDataTable([
                            ['Label', 'Value'],
                            ['', 1.0]
                        ]);
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.error("Invalid data to gauge="+data);
                    return;
                }
                debug('dg draw 1');
                this.initialize(targetid);
                q.queue(function (next) {
                    debug('dg draw 2');
                    drawgauge(data);
                    next();
                });
            },
            "validateinput": function (value) {
                if (typeof value === "string") {
                    var diff = parseFloat(value);
                    if (diff >= 1 && diff <= 5) {
                        return true;
                    }
                } else if (typeof value === "number") {
                    if (value >= 1 && value <= 5) {
                        return true;
                    }
                }
                return false;
            },
            "reinit": function () {
                initialized = false;
            },
            "name": "gauge"
        };

    }

    function AgePollChart (title, quantity, type) {
        var gvagepoll;
        var initialized = false;

        var options = {
            height: 200,
            width: 320,
            title: title,
            hAxis: {title: 'Votes'},
            legend: {position: 'none'}
        };
        var drawagepoll = function (apdata) {

            // Update and draw the visualization.
            try {
                var data = new google.visualization.DataTable();
                //var data = new google.visualization.DataTable();
                data.addColumn('string', quantity);
                data.addColumn('number', 'Votes');
                $.each(apdata, function(i, val) {
                    var $val = $(val);
                    var age = $val.attr('value');
                    var votes = $val.attr('numvotes');
                    data.addRow([age, parseInt(votes)]);
                });
                gvagepoll.draw(data, options);
            } catch (e) {
                console.error('age poll chart error: '+ e+'\nData:\n'+JSON.stringify(apdata));
            }

        };

        return {
            "initialize": function (targetid) {
                debug('ap init');
                q.queue(function (next) {
                    debug('ap init 2');
                    if (!initialized) {
                        gvagepoll = new google.visualization.BarChart(document.getElementById(targetid));
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.log('%s %o', "Invalid data to age poll=", data);
                    return;
                }
                debug('ap draw 1');
                this.initialize(targetid);
                q.queue(function (next) {
                    debug('ap draw 2');
                    drawagepoll(data);
                    next();
                });
            },
            "validateinput": function (data) {
                if (typeof data === "object") {
                    if (data.length > 0) {
                        return true;
                    }
                }
                return false;
            },
            "reinit": function () {
                initialized = false;
            },
            "name": type
        };

    }

    function NPPollChart () {
        var gvnppoll;
        var initialized = false;
        var currtarget;

        var options = {
            height: 200,
            width: 400,
            isStacked: true,
            colors: ['red', 'green', 'yellow'],
            hAxis: {
                title: "Votes"
            },
            vAxis: {
                title: 'Number of Players'
            },
            title: 'Best with'
//            ,
//            legend: {
//                position: 'top'
//            }
        };
        var drawnppoll = function ($nppdata) {

            // Update and draw the visualization.
            try {
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Players');
                data.addColumn('number', 'Bad');
                data.addColumn('number', 'Best');
                data.addColumn('number', 'Good');
                $nppdata.each( function(i, val) {
                    var $val = $(val);
                    var players = $val.attr('numplayers');
//                    var votes = $val.attr('numvotes');
                    var nr = $val.find("[value='Not Recommended']").attr('numvotes');
                    var b = $val.find("[value='Best']").attr('numvotes');
                    var r = $val.find("[value='Recommended']").attr('numvotes');
                    data.addRow([players, -parseInt(nr), parseInt(b), parseInt(r)]);
                });
                var $root = $('#'+currtarget);
                $root.addClass('chartdisplay');
                gvnppoll.draw(data, options);
                $root.removeClass('chartdisplay');
            } catch (e) {
                console.error('num players poll chart error: '+ e+'\nData:\n'+JSON.stringify($nppdata));
            }

        };

        return {
            "initialize": function (targetid) {
                debug('npp init');
                q.queue(function (next) {
                    debug('npp init 2');
                    if (!initialized) {
                        currtarget = targetid;
                        gvnppoll = new google.visualization.BarChart(document.getElementById(targetid));
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.error("Invalid data to num players poll="+data);
                    return;
                }
                debug('npp draw 1');
                this.initialize(targetid);
                q.queue(function (next) {
                    debug('npp draw 2');
                    drawnppoll(data);
                    next();
                });
            },
            "validateinput": function (data) {
                if (typeof data === "object") {
                    if (data.length > 0) {
                        return true;
                    }
                }
                return false;
            },
            "reinit": function () {
                initialized = false;
            },
            "name": "nppoll"
        };

    }
    function RatingsHistoryChart () {
        var gvnrathist;
        var initialized = false;
        var currtarget;
        //var $ratingtooltiptemplate;
        var ratingttstring;
        var tags = ['type', 'date', 'raters', 'rank', 'value'];
        var template = [];

        var options = {
            chart: {
                title: 'Ratings over time'
            },
            tooltip: {isHtml: true},
            width: 900,
            height: 500,
            hAxis: {format: "MMM yyyy"},
            vAxis: { format: '#0.0', title: 'Rating'},
            allowHtml: true,
            colors: ['#0F8056', '#C4CC33'],
            explorer: {}
        };

        q.queue(function(next) {
            debug('rh template');
            $.get('html-frag/ratingtooltip.html',
                function(r) {
                    var dollarloc = 0;
                    var remaining = r;
                    var piececount = 0;
                    var replacer = function(cur, index, arr) {
                        if (remaining.substring(0, cur.length) === cur) {
                            template[piececount++] =
                            {
                                'type': 'val',
                                'val': cur
                            };
                            tag = cur;
                        }
                    };
                    while (remaining.length > 0) {
                        var nextloc = remaining.indexOf('$$');
                        if (nextloc < 0) {
                            template[piececount++] =
                            {
                                'type': 'frag',
                                'val': remaining
                            };
                            remaining = '';
                        } else {
                            template[piececount++] =
                            {
                                'type': 'frag',
                                'val': remaining.substring(0, nextloc)
                            };
                            remaining = remaining.substr(nextloc+2);
                            var tag = "";
                            tags.forEach(replacer);
                            remaining = remaining.substr(tag.length);
                        }
                    }
                    ratingttstring = r;
                    next();
                }
            );
        });

        var gettooltip = function (date, value, ratings, rank, type) {
            //return '<span>yay</span>';
            //var tt = ratingttstring.substr(0);
            //var tt = new String(ratingttstring);
            var ttarr = [];
            for (var i = 0; i < template.length; i++) {
                var t = template[i];
                if (t.type === 'frag') {
                    ttarr[i] = t.val;
                } else {
                    switch (t.val) {
                        case 'type':   ttarr[i] = type; break;
                        case 'date':   ttarr[i] = date; break;
                        //case 'date':   ttarr[i] = date.toLocaleDateString('en-US'); break;
                        case 'raters': ttarr[i] = ratings; break;
                        case 'rank':   ttarr[i] = rank; break;
                        case 'value':  ttarr[i] = value.toFixed(2); break;
                    }
                }
            }
            return ttarr.join('');
            //    .replace('$$type', type)
            //    .replace('$$date', date.toLocaleDateString('en-US'))
            //    .replace('$$raters', ratings)
            //    .replace('$$rank', rank)
            //    .replace('$$value', value.toFixed(2))
            //;
            /*
            var $tt = $ratingtooltiptemplate.clone();
            $tt.find('.rating-tooltip-date').text(date.toLocaleDateString('en-US'));
            $tt.find('.rating-tooltip-type').text(type);
            $tt.find('.rating-tooltip-numraters-value').text(ratings);
            $tt.find('.rating-tooltip-rank').text(rank);
            $tt.find('.rating-tooltip-value').text(value.toFixed(2));
            return $tt[0].outerHTML;
            */
        };
        var composeDataTable = function (rhdata) {
            var cols = [
                {"id": "rhdate", "label": "Date", "type": "date", "pattern": "M\/d\/yy"},
                {"id": "rhavg", "label": "Average", "type": 'number', "pattern": "#0.00"},
                {"id": "rhttp", 'type': 'string', 'role': 'tooltip', 'p': {'html': true}},
                {"id": "rhbavg", "label": "BGGAvg", "type": 'number', "pattern": "#0.00"},
                {"id": "rhbttp", 'type': 'string', 'role': 'tooltip', 'p': {'html': true, "role": "tooltip"}}
                //{"id": "rhraters", "label": "Raters", "type": 'string'},
                //{"id": "rhrank", "label": "Rank", "type": 'string'}

            ];
            var rows = [];
            var rowcount = 0;
            var thinner = (rhdata.length / 500 + 1).toFixed(0);
            rhdata.forEach(function (cur, index, arr) {
                if (thinner === 1 || index % thinner === 0) {
                    var yr = cur.date.slice(0, 4);
                    var mo =  parseInt(cur.date.slice(4, 6));
                    var dy = cur.date.slice(6, 8);
                    var d = new Date(yr,mo - 1, dy);
                    var ds = mo+'/'+dy+'/'+yr;

                    var avg = parseFloat(cur.average);
                    var bavg = parseFloat(cur.bayesaverage);
                    if (avg > 0) {
                        var avgtt = gettooltip(ds, avg, cur.usersrated, cur.rank, 'Average');
                        var c;
                        if (bavg === 0) {
                            c = {
                                "c": [
                                    {"v": d},
                                    {"v": avg, "f": avg.toFixed(2)},
                                    {'v':avgtt}
                                    //,null, null
                                    //{"v": cur.usersrated},
                                    //{"v": cur.rank}
                                ]
                            };
                        }
                        else {
                            var bavgtt = gettooltip(ds, bavg, cur.usersrated, cur.rank, 'BBGAvg');
                            c = {
                                "c": [
                                    {"v": d},
                                    {"v": avg, "f": avg.toFixed(2)},
                                    {'v':avgtt},
                                    {"v": bavg, "f": avg.toFixed(2)},
                                    {'v':bavgtt}
                                    //,{"v": cur.usersrated},
                                    //{"v": cur.rank}
                                ]
                            };
                        }
                        rows[rowcount] = c;
                        rowcount++;
                    }
                }
            });
            return {
                "cols": cols, "rows": rows
            };

        };
        //var gettooltip = function (date, value, ratings, rank, type) {
        var calctooltip = function(dt, row, type) {
            return gettooltip(
                dt.getValue(row, 0),
                type === "Average" ? dt.getValue(row, 1) : dt.getValue(row,2),
                dt.getValue(row, 3),
                dt.getValue(row, 4),
                type
            );
        };
        var drawrathist = function (rhdata) {

            // Update and draw the visualization.
            try {
                var starttime = Date.now();
                var dt = composeDataTable(rhdata);
                var lasttime = Date.now();
                //console.log("Took "+(lasttime - starttime) + "ms to compose data");
                var data = new google.visualization.DataTable(dt);
                var newtime = Date.now();
                //console.log("Took "+(newtime - lasttime) + "ms to instantiate table");
                lasttime = newtime;
                //var dv = new google.visualization.DataView(data);
                //dv.setColumns(
                //    [0, 1,
                //        {
                //            "calc": function(dt, row) {
                //                //return '<span>yay</span>>';
                //                return calctooltip(dt, row, "Average");
                //            },
                //            "type": "string",
                //            "properties": {
                //                "html": true,
                //                "role": "tooltip"
                //            },
                //            "role": "tooltip"
                //        },
                //    2,
                //        {
                //            "calc": function(dt, row) {
                //                if (dt.getValue(row, 2)) {
                //                    return calctooltip(dt, row, "BBGAvg");
                //                }
                //                return null;
                //            },
                //            "type": "string",
                //            "properties": {
                //                "html": true,
                //                "role": "tooltip"
                //            },
                //            "role": "tooltip"
                //        }
                //    ]
                //);
                //console.log("Ratings history data table\n"+data.toJSON());
                var $root = $('#'+currtarget);
                $root.addClass('chartdisplay');
                // ignore the dataview, for now
                gvnrathist.draw(data, options);
                //gvnrathist.draw(dv, options);
                $root.removeClass('chartdisplay');
                newtime = Date.now();
                //console.log("Took "+(newtime - lasttime) + "ms to draw the chart with "+ dt.rows.length+" rows");
                //console.log("Took "+(newtime - starttime) + "ms to draw entire ratings chart");
            } catch (e) {
                console.error('ratings history chart error: '+ e+'\nData:\n'+JSON.stringify(rhdata));
            }

        };

        return {
            "initialize": function (targetid) {
                debug('rh init');
                q.queue(function (next) {
                    debug('rh init 2');
                    if (!initialized) {
                        currtarget = targetid;
                        gvnrathist = new google.visualization.LineChart(document.getElementById(targetid));
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.log('%s %O', "Invalid data to ratings history=", data);
                    return;
                }
                debug('rh draw 1');
                this.initialize(targetid);
                q.queue(function (next) {
                    debug('rh draw 2');
                    drawrathist(data);
                    next();
                });
            },
            "validateinput": function (data) {
                if (typeof data === "object") {
                    if (data.length > 0) {
                        return true;
                    }
                }
                return false;
            },
            "reinit": function () {
                initialized = false;
            },
            "name": "rathist"
        };

    }

    var dg = new DiffGauge();
    vizs[dg.name] = dg;
    var ap = new AgePollChart('No Younger Than', 'Age', 'agepoll');
    vizs[ap.name] = ap;
    var rp = new AgePollChart('Rating Distribution', 'Rating', 'ratingpoll');
    vizs[rp.name] = rp;
    var npp = new NPPollChart();
    vizs[npp.name] = npp;
    var wp = new AgePollChart('Weight', 'Weight', 'weightpoll');
    vizs[wp.name] = wp;
    var rh = new RatingsHistoryChart();
    vizs[rh.name] = rh;
    debug("GV objs created");
    gvizinited = true;

    var updfunc = function (name, value, targetid) {
        debug('u 1');
        q.queue(function(next) {
            debug('u 2');
            if (!vizs || !vizs[name]) {
                if (gvizinited) {
                    debug('bad name: ' + name);
                } else {
                    debug('retry update');
                    updfunc(name, value, targetid);
                }
            } else {
                vizs[name].draw(value, targetid);
            }
            next();
        });
        debug('u 3');
        q.dequeue();

    };

    return {
        update: updfunc,
        reinit: function (name) {
            q.queue(function (n) {
                if (vizs && vizs[name]) {
                    vizs[name].reinit();
                }
                n();
            });
            return this;
        }
    };

}