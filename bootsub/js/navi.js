function getFocused() {
    return $(".focused").first();
}

function setFocusedRight() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().left;
    var t = o.get(0).getBoundingClientRect().top;
    var mr = 10000, no = null;

    // first: search on same level
    var other = $(".focusable").filter(":visible");
    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().left;
        var nt = o.getBoundingClientRect().top;
        if (nr > r && nr < mr && nt == t) {
            mr = nr;
            no = o;
        }
    });
    if(no == null){
        // second: search on lower level
        r = 0;
        other = $(".focusable").filter(":visible");
        other.each(function(i) {
            // console.log(o);
            var o = other.get(i);
            var nr = o.getBoundingClientRect().left;
            var nt = o.getBoundingClientRect().top;
            if (nr > r && nr < mr && nt > t) {
                mr = nr;
                no = o;
            }
        });
    }

    if (no) {
        setNav($(no));
    }
}

function setFocusedDown() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().top;
    var t = o.get(0).getBoundingClientRect().left;
    var mr = 100000, no = null;

    // first: check for same level
    var other = $(".focusable").filter(":visible");
    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().top;
        var nt = o.getBoundingClientRect().left;
        if (nr > r + 5 && nr < mr && nt == t) {
            mr = nr;
            no = o;
        }
    });
    if (no == null){
        var other = $(".focusable").filter(":visible");
        other.each(function(i) {
            // console.log(o);
            var o = other.get(i);
            var nr = o.getBoundingClientRect().top;
            if (nr > r + 5 && nr < mr) {
                mr = nr;
                no = o;
            }
        });
    }

    if (no) {
        setNav($(no));
    }
}

function setFocusedUp() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().top;
    var t = o.get(0).getBoundingClientRect().left;
    var mr = -100, no = null;

    var other = $(".focusable").filter(":visible");
    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().top;
        var nt = o.getBoundingClientRect().left;
        if (nr < r && nr > mr && nt == t) {
            mr = nr;
            no = o;
        }
    });
    if(no == null){
        var other = $(".focusable").filter(":visible");
        other.each(function(i) {
            // console.log(o);
            var o = other.get(i);
            var nr = o.getBoundingClientRect().top;
            if (nr < r && nr > mr) {
                mr = nr;
                no = o;
            }
        });
    }

    if (no) {
        setNav($(no));
    }
}

function setFocusedLeft() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().left;
    var t = o.get(0).getBoundingClientRect().top;
    var mr = -100, no = null;

    // first: search on same level
    var other = $(".focusable").filter(":visible");
    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().left;
        var nt = o.getBoundingClientRect().top;
        if (nr < r && nr > mr && nt == t) {
            mr = nr;
            no = o;
        }
    });
    if (no == null){
        // second: search upper level
        var other = $(".focusable").filter(":visible");
        r = 100000;
        other.each(function(i) {
            // console.log(o);
            var o = other.get(i);
            var nr = o.getBoundingClientRect().left;
            var nt = o.getBoundingClientRect().top;
            if (nr < r && nr > mr && nt < t) {
                mr = nr;
                no = o;
            }
        });
    }

    if (no) {
        setNav($(no));
    }
}

function enterFocused(){
    getFocused().trigger("click");
}

$(function() {
    $(document).keydown(function(e) {
        if (e.keyCode === 39) {
            setFocusedRight(); e.preventDefault();
        } else if (e.keyCode === 37) {
            setFocusedLeft(); e.preventDefault();
        } else if (e.keyCode === 38) {
            setFocusedUp(); e.preventDefault();
        } else if (e.keyCode === 40) {
            setFocusedDown(); e.preventDefault();
        } else if (e.keyCode === 13) {
            enterFocused(); e.preventDefault();
        }
    });
});

function setNav(o) {
    $(".focusable").removeClass("focused");
    o.addClass("focused");
}

function resetNav() {
    setNav($(".focusable").first());
}