function getFocused() {
    return $(".focused").first();
}

function setFocusedRight() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().left;
    var other = $(".focusable");
    var mr = 10000, no = null;

    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().left;
        if (nr > r && nr < mr) {
            mr = nr;
            no = o;
        }
    });

    if (no) {
        setNav($(no));
    }
}

function setFocusedDown() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().top;
    var other = $(".focusable");
    var mr = 100000, no = null;

    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().top;
        if (nr > r + 5 && nr < mr) {
            mr = nr;
            no = o;
        }
    });

    if (no) {
        setNav($(no));
    }
}

function setFocusedUp() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().top;
    var other = $(".focusable");
    var mr = -100, no = null;

    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().top;
        if (nr < r && nr > mr) {
            mr = nr;
            no = o;
        }
    });

    if (no) {
        setNav($(no));
    }
}

function setFocusedLeft() {
    var o = getFocused();
    var r = o.get(0).getBoundingClientRect().left;
    var other = $(".focusable");
    var mr = -100, no = null;

    other.each(function(i) {
        // console.log(o);
        var o = other.get(i);
        var nr = o.getBoundingClientRect().left;
        if (nr < r && nr > mr) {
            mr = nr;
            no = o;
        }
    });

    if (no) {
        setNav($(no));
    }
}

function enterFocused(){
    getFocused().trigger("click");
    resetNav();
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