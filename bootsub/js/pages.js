/**
 * @author: Felix Kluge <felix_kluge@wh2.tu-dresden.de>
 *
 * Here are all side-related scripts. These scripts are only used once on the specific page.
 *
 */

var playList = []; // {"id": "xxx", "title": "xxx", "author": "xxx"}
var playBack = []; // {"id": "xxx", "title": "xxx", "author": "xxx"}
var currentlyPlaying = null;
var isPaused = false;

function stopPlayer() {
    $("#player").fadeOut();
    $("#wrap").fadeIn();
    $("#audio").get(0).pause();

    playList = [];
    currentlyPlaying = null;
    isPaused = false;
}

function startLastSong(){
    playList.unshift(currentlyPlaying);
    currentlyPlaying = playBack.shift();
    if(!currentlyPlaying){
        stopPlayer();
        return;
    }
    var audioElement = $("#audio").get(0);
    $("#cover").attr("src", getRestUrl("getCoverArt", "&id=" + currentlyPlaying.id));
    $("#curtitle").text(currentlyPlaying.title);
    $("#curartist").text(currentlyPlaying.artist);
    setTimeout(function(){
        $(".playlistitem").removeClass("danger");
        $("#p" + currentlyPlaying.id).addClass("danger");
    }, 5);
    audioElement.autoplay = true;
    audioElement.src = getRestUrl("stream", "&id=" + currentlyPlaying.id + "&format=ogg&estimateContentLength=true");
    audioElement.play();
    $("#audio").one("ended", function() {
        startNextSong();
    });
}

function startNextSong() {
    playBack.unshift(currentlyPlaying);
    currentlyPlaying = playList.shift();
    if (!currentlyPlaying) {
        stopPlayer();
        return;
    }
    var audioElement = $("#audio").get(0);
    $("#cover").attr("src", getRestUrl("getCoverArt", "&id=" + currentlyPlaying.id));
    $("#curtitle").text(currentlyPlaying.title);
    $("#curartist").text(currentlyPlaying.artist);
    setTimeout(function(){
        $(".playlistitem").removeClass("danger");
        $("#p" + currentlyPlaying.id).addClass("danger");
    }, 5);
    audioElement.autoplay = true;
    audioElement.src = getRestUrl("stream", "&id=" + currentlyPlaying.id + "&format=ogg&estimateContentLength=true");
    audioElement.play();
    $("#audio").one("ended", function() {
        startNextSong();
    });
}

function player_init() {
    var element = $("#audio").get(0);
    $("#pause").click(function() {
        $("#playspan").toggleClass("glyphicon-pause");
        $("#playspan").toggleClass("glyphicon-play");
        if (!isPaused) {
            element.pause();
        } else {
            element.play();
        }
        isPaused = !isPaused;
    });
    $("#skip").click(function() {
        startNextSong();
    });
    $("#return").click(function() {
        startLastSong();
    });
    $("#stop").click(function() {
        stopPlayer();
    });
	// document.documentElement.webkitRequestFullscreen()
}

function startPlayer() {
    $("#wrap").fadeOut();
    $("#player").fadeIn();
    var s = "<tr><th style='width: 50px;'>Nummer</th><th>Name</th></tr>";
    var i = 1;
    playList.forEach(function(o) {
        s += "<tr id='p" + o.id + "' class='playlistitem'><td>" + i + "</td><td>" + o.title + "</td></tr>";
        i++;
    });

    $("#curplaylist").html(s);
    startNextSong();
}

function playPlaylist(id) {
    $.ajax({
        url: getRestUrl("getPlaylist", "&id=" + id),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] === "ok") {
            var list = data["subsonic-response"]["playlist"];
            var entry = list.entry;
            if (!$.isArray(entry))
                entry = [entry];
            playList = entry.filter(function(e) {
                return {"id": e.id, "title": e.title, "author": e.artist};
            });
            startPlayer();
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
    });
}

// artist_id, album_id
function playAlbum(o) {
    $.ajax({
        url: getRestUrl("getAlbum", "&id=" + o.album_id),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] === "ok") {
            var list = data["subsonic-response"]["album"];
            var entry = list.song;
            if (!$.isArray(entry))
                entry = [entry];
            playList = entry.filter(function(e) {
                return {"id": e.id, "title": e.title, "author": e.artist};
            });
            startPlayer();
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
    });
}


/* This is the module for the Musik -> Interpreten menu */
function submenu_function_list_artists() {
    $.ajax({
        url: getRestUrl("getArtists", ""),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] === "ok") {
            var tmp = "";

            var artists = data["subsonic-response"]["artists"]["index"];

            var sorted_artists = {};

            $.each(artists, function(key, value) {
                var t = "";
                var c = {};
                $.each(value, function(key2, value2) {
                    if (key2 === "name")
                        t = value2;
                    else if (key2 === "artist")
                        c = value2;
                });
                sorted_artists[t] = c;
            });

            display_pagination('container_Interpreten_pager', 'container_Interpreten_pagercontent', sorted_artists);
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
        mutex = false;
    });
}

/* Here comes the view for one single artist */
function submenu_function_display_artist(params) {
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getArtist", "&id=" + user['active_arguments']['artist_id']),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] == "ok") {
            var tmp = "";

            var artist = data["subsonic-response"]["artist"];

            console.log(artist);

            var alben = new Array();

            if (artist["albumCount"] == "1") {
                alben[0] = artist["album"];
            } else {
                alben = artist["album"];
            }

            for (var i = 0; i < alben.length; i++) {
                tmp += "<div class=\"media\">";
//                tmp += "<a class=\"pull-left focusable\" href=\"#\" onClick=\"playAlbum(";
//                tmp += "{'artist_id': '" + artist['id'] + "', 'album_id': '" + alben[i]['id'] + "'});\">";
                if (alben[i]['coverArt']) {
                    tmp += "<img class=\"media-object\" src=\"";
                    tmp += getRestUrl('getCoverArt', '&size=75&id=' + alben[i]['coverArt']);
                    tmp += "\" title=\"" + alben[i]['name'] + "\" style=\"width:75px;height:75px;\" />";
                } else {
                    tmp += "<div style=\"width:75px;height:75px;\" />";
                }
//                tmp += "</a>";
                tmp += "<div class=\"media-body\">";
                tmp += "<h4 class=\"media-heading\">";
                tmp += "<a href=\"#\" class=\"focusable\" onClick=\"playAlbum(";
                tmp += "{'artist_id': '" + artist['id'] + "', 'album_id': '" + alben[i]['id'] + "'});\">" + alben[i]['name'] + "</a>";
                tmp += "</h4>";
                tmp += "Songs: " + alben[i]['songCount'] + "<br />";
                tmp += "Länge: " + display_duration(alben[i]['duration']);
                tmp += "</div>";
                tmp += "</div>";
            }
            $('#container_Interpreten_Interpret').html(tmp);
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
        mutex = false;
    });
}

/* Here comes the view for one single album */
function submenu_function_display_album(params) {
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getAlbum", "&id=" + user['active_arguments']['album_id']),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] == "ok") {
            var tmp = "";

            var album = data["subsonic-response"]["album"];

            var songs = new Array();

            if (album["songCount"] == "1") {
                songs[0] = album["song"];
            } else {
                songs = album["song"];
            }

            tmp += "<table class=\"table\">";
            tmp += "<thead>";
            tmp += "<tr><th>#</th><th>Song</th><th>Künstler</th><th>Länge</th><th>Aktion</th></tr>";
            tmp += "</thead>";
            tmp += "<tbody>";
            for (var i = 0; i < songs.length; i++) {
                tmp += "<tr>";
                tmp += "<td>" + songs[i]['track'] + "</td><td>" + songs[i]['title'] + "</td><td style=\"white-space:nowrap;\">" + songs[i]['artist'] + "</td>";
                tmp += "<td>" + display_duration(songs[i]['duration']) + "</td>";
                tmp += "<td style=\"white-space:nowrap;\">";
                tmp += "<span class=\"glyphicon glyphicon-play\" /> ";
                tmp += "<span class=\"glyphicon glyphicon-plus\" /> ";
                tmp += "</td>";
                tmp += "</tr>";
            }
            tmp += "</tbody>";
            tmp += "</table>";

            $('#container_Interpreten_Interpret_Album').html(tmp);
        } else {
            songs = album["song"];
        }
    });
}

/* Here comes the view for the Kluge-Mixes */
function submenu_function_display_klugemixes(params) {
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getPlaylists", ""),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] == "ok") {
            var tmp = "";

            var playlists = data["subsonic-response"]["playlists"]["playlist"];
            if (!$.isArray(playlists)) {
                playlists = [playlists];
            }

            tmp += "<table class=\"table\">";
            tmp += "<thead>";
            tmp += "<tr><th>Name</th><th>Länge</th></tr>";
            tmp += "</thead>";
            tmp += "<tbody>";
            for (var i = 0; i < playlists.length; i++) {
                if (playlists[i]["name"].substr(0, 9) == "Kluge-Mix") {
                    tmp += "<tr>";
                    tmp += "<td><a href=\"#\" class=\"focusable\" onClick=\"playPlaylist('" + playlists[i]['id'] + "');\">" + playlists[i]['name'] + "</a></td>";
                    tmp += "<td>" + display_duration(playlists[i]['duration']) + "</td>";
                    tmp += "</tr>";
                }
            }
            tmp += "</tbody>";
            tmp += "</table>";

            $('#container_Kluge-Mixe').html(tmp);
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
        tmp += "</tbody>";
        tmp += "</table>";

        $('#container_Interpreten_Interpret_Album').html(tmp);
        mutex = false;
    });
}

/* Here comes the view for one single album */
function submenu_function_display_klugemixes_album(params) {
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getPlaylist", "&id=" + user['active_arguments']['playlist_id']),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        var tmp = "";

        var playlist = data["subsonic-response"]["playlist"];

        if (data["subsonic-response"]["status"] === "ok") {

            var songs = new Array();

            if (playlist["songCount"] == "1") {
                songs[0] = playlist["entry"];
            } else {
                songs = playlist["entry"];
            }
            tmp += "</tbody>";
            tmp += "</table>";

            $('#container_Kluge-Mixe').html(tmp);
        }  else {
            display_subsonic_response(data['subsonic-response']);
        }

        mutex = false;
    });
}

/* Here comes the view for the genres */
function submenu_function_display_genres(params) {
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getGenres", ""),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data) {
        if (data["subsonic-response"]["status"] == "ok") {
            var tmp = "";

            var genres = data["subsonic-response"]["genres"]["genre"];

            tmp += "<table class=\"table\">";
            tmp += "<thead>";
            tmp += "<tr><th>Name</th><th>Alben</th><th>Songs</th></tr>";
            tmp += "</thead>";
            tmp += "<tbody>";
            for (var i = 0; i < genres.length; i++) {
                tmp += "<tr>";
                tmp += "<td>" + genres[i]['content'] + "</td>";
                tmp += "<td>" + genres[i]['albumCount'] + "</td>";
                tmp += "<td>" + genres[i]['songCount'] + "</td>";
                tmp += "</tr>";
            }
            tmp += "</tbody>";
            tmp += "</table>";

            $('#container_Genres').html(tmp);
        } else {
            display_subsonic_response(data['subsonic-response']);
        }
        mutex = false;
    });
}
