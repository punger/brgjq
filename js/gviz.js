/**
 * Created by paul on 2/3/14.
 */

function GoogleVisualizations () {
    var q = $({});
    var gvizinited = false;
    var vizs = [];
    var debug = function (msg) {
        if (q) {
            console.log('At '+msg+', Queue has '+ q.queue().length+' items\nQ='+ q.queue());
        } else {
            console.log('At '+msg+', no q');
        }
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
                alert('age poll chart error: '+ e+'\nData:\n'+JSON.stringify(apdata));
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
                    console.error("Invalid data to age poll="+data);
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
                alert('num players poll chart error: '+ e+'\nData:\n'+JSON.stringify($nppdata));
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

        var options = {
            chart: {
                title: 'Ratings over time'
            },
            width: 900,
            height: 500
        };

        var drawrathist = function (rhdata) {

            // Update and draw the visualization.
            try {
                var data = new google.visualization.DataTable();
                data.addColumn('date', 'Date');
                data.addColumn('number', 'Average');
                data.addColumn('number', 'BGGAvg');
                rhdata.forEach(function (cur, index, arr) {
                    var d = new Date(cur.date.slice(0,4), parseInt(cur.date.slice(4,6))-1, cur.date.slice(6,8));
                    var avg = parseFloat(cur.average);
                    var bavg =  parseFloat(cur.bayesaverage);
                    if (avg > 0) {
                        if (bavg === 0)
                            data.addRow([d, avg, null]);
                        else
                            data.addRow([d, avg, bavg]);
                    }
                });
                var $root = $('#'+currtarget);
                $root.addClass('chartdisplay');
                gvnrathist.draw(data, options);
                $root.removeClass('chartdisplay');
            } catch (e) {
                alert('ratings history chart error: '+ e+'\nData:\n'+JSON.stringify(rhdata));
            }

        };

        return {
            "initialize": function (targetid) {
                debug('rh init');
                q.queue(function (next) {
                    debug('rh init 2');
                    if (!initialized) {
                        currtarget = targetid;
                        gvnrathist = new google.charts.Line(document.getElementById(targetid));
                        initialized = true;
                    }
                    next();
                });
            },
            "draw": function(data, targetid) {
                if (!this.validateinput(data)) {
                    console.error("Invalid data to ratings history="+data);
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

//    q.queue(function (next) {
//        debug("google load start");
//        google.load("visualization", "1",
//            {
//                "packages": ["gauge", "corechart"],
//                "callback": q.queue(function() {
//                    debug("GV onload");
//                    var dg =  new DiffGauge();
//                    vizs[dg.name] = dg;
//                    var ap = new AgePollChart();
//                    vizs[ap.name] = ap;
//                    var npp = new NPPollChart();
//                    vizs[npp.name] = npp;
//                    debug("GV objs created");
//                    gvizinited = true;
//                    next();
//                })
//            });
//    });


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