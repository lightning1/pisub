/**
 * @author: Felix Kluge <felix_kluge@wh2.tu-dresden.de>
 *
 * Here are all side-related scripts. These scripts are only used once on the specific page.
 *
 */

/* This is the module for the Musik -> Interpreten menu */
function submenu_function_list_artists(){
    $.ajax({
        url: getRestUrl("getArtists", ""),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data){
            if(data["subsonic-response"]["status"] == "ok"){
                var tmp = "";

                var artists = data["subsonic-response"]["artists"]["index"];

                var sorted_artists = {};

                $.each(artists, function(key,value){
                    var t = "";
                    var c = {};
                    $.each(value,function(key2,value2){
                        if(key2 == "name")
                            t = value2;
                        else if(key2 == "artist")
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
function submenu_function_display_artist(params){
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getArtist", "&id="+user['active_arguments']['artist_id']),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data){
            if(data["subsonic-response"]["status"] == "ok"){
                var tmp = "";

                var artist = data["subsonic-response"]["artist"];

                console.log(artist);

                var alben = new Array();

                if(artist["albumCount"] == "1"){
                    alben[0] = artist["album"];
                } else {
                    alben = artist["album"];
                }

//                if(user['display_browser_albums'] == "list"){
                    for(var i=0; i<alben.length; i++){
                        tmp += "<div class=\"media\">";
                        tmp += "<a class=\"pull-left\" href=\"javascript:change_menu(['Interpreten','"+artist['name']+"','"+alben[i]['name']+"'],";
                        tmp += "{'artist_id': '"+artist['id']+"', 'album_id': '"+alben[i]['id']+"'});\">";
                        if(alben[i]['coverArt']){
                            tmp += "<img class=\"media-object\" src=\"";
                            tmp += getRestUrl('getCoverArt','&size=75&id='+alben[i]['coverArt']);
                            tmp += "\" title=\""+alben[i]['name']+"\" style=\"width:75px;height:75px;\" />";
                        } else {
                            tmp += "<div style=\"width:75px;height:75px;\" />";
                        }
                        tmp += "</a>";
                        tmp += "<div class=\"media-body\">";
                        tmp += "<h4 class=\"media-heading\">";
                        tmp += "<a href=\"javascript:change_menu(['Interpreten','"+artist['name']+"','"+alben[i]['name']+"'],";
                        tmp += "{'artist_id': '"+artist['id']+"', 'album_id': '"+alben[i]['id']+"'});\">"+alben[i]['name']+"</a>";
                        tmp += "</h4>";
                        tmp += "Songs: "+alben[i]['songCount']+"<br />";
                        tmp += "Länge: "+display_duration(alben[i]['duration']);
                        tmp += "</div>";
                        tmp += "</div>";
                    }
                    $('#container_Interpreten_Interpret').html(tmp);
//                } else {
//                    // display mode: coverflow!
//                    alert('cover!');
//                    $('#container_Interpreten_Interpret').html(tmp);
//
//                }
            } else {
                display_subsonic_response(data['subsonic-response']);
            }
            mutex = false;
        });
}

/* Here comes the view for one single album */
function submenu_function_display_album(params){
    mutex = true;
    user['active_arguments'] = params;
    $.ajax({
        url: getRestUrl("getAlbum", "&id="+user['active_arguments']['album_id']),
        dataType: "jsonp",
        type: "GET"
    }).done(function(data){
            if(data["subsonic-response"]["status"] == "ok"){
                var tmp = "";

                var album = data["subsonic-response"]["album"];

                var songs = new Array();

                if(album["songCount"] == "1"){
                    songs[0] = album["song"];
                } else {
                    songs = album["song"];
                }

                tmp += "<table class=\"table\">";
                tmp += "<thead>";
                tmp += "<tr><th>#</th><th>Song</th><th>Künstler</th><th>Länge</th><th>Aktion</th></tr>";
                tmp += "</thead>";
                tmp += "<tbody>";
                for(var i=0; i<songs.length; i++){
                    tmp += "<tr>";
                    tmp += "<td>"+songs[i]['track']+"</td><td>"+songs[i]['title']+"</td><td style=\"white-space:nowrap;\">"+songs[i]['artist']+"</td>";
                    tmp += "<td>"+display_duration(songs[i]['duration'])+"</td>";
                    tmp += "<td style=\"white-space:nowrap;\">";
                    tmp += "<span class=\"glyphicon glyphicon-play\" /> ";
                    tmp += "<span class=\"glyphicon glyphicon-plus\" /> ";
                    tmp += "<span class=\"glyphicon glyphicon-star\" /> ";
                    tmp += "</td>";
                    tmp += "</tr>";
                }
                tmp += "</tbody>";
                tmp += "</table>";

                $('#container_Interpreten_Interpret_Album').html(tmp);
            } else {
                display_subsonic_response(data['subsonic-response']);
            }
            mutex = false;
        });
}