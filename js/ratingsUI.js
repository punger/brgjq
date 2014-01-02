/**
 * Created by paul on 12/27/13.
 */

var showRating = function(rating, $anchor) {
    var base = 5;
    var high = 9;
    var baseloc = 30;
    var rangeloc = 80;
    var lineloc = baseloc + (rangeloc *(rating - base)) / (high - base);

    var $c = $anchor.find('canvas');
//    $c.width(140).height(65);
//    $c.appendTo($anchor);
    $c.clearCanvas();
    var gradient = $c.createGradient({
        x1: 20, y1: 0,
        x2: 120, y2: 0,
        c1: 'black',	c2: 'red',	c3: 'yellow',	c4: 'green',	c5: 'black',
        s1: 0,          s2: 0.1,	s3: 0.45,        s4: 0.9,        s5: 1
    });
    $c.drawRect({
        fillStyle: gradient,
        x: 20,
        y: 5,
        width: 100,
        height: 10,
        fromCenter: false
    });
    $c.drawLine({
        strokeStyle: 'black',
        strokeWidth: 3,
        x1: lineloc, y1: 0,
        x2: lineloc, y2: 20
    });
};