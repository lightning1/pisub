/**
 * @author: Felix Kluge <felix_kluge@wh2.tu-dresden.de>
 *
 * This file contains all basic methods which are used multiple times
 * inside the page.
 *
 */

var mutex = false;
var user = {
    "name": "",
    "password": "",
    "subsonic_url": "",
    "autologin": "",
    "display_pagination_mode": "",
    "display_browser_albums": "",
    "active_path": "",
    "active_arguments": ""
}
var pagination = {
	"Musik_Interpreten": {}
};

function get_array_as_string(ar){
    var tmp = "[";
    for(var i=0; i<ar.length; i++){
        tmp += "'" + ar[i] + "'";
        if(i+1 < ar.length)
            tmp += ",";
    }
    return tmp + "]";
}
function get_object_as_string(ob){
    if(typeof ob == "object"){
        var tmp = "{";
        $.each(ob,function(key, value){
            tmp += "'"+key+"': '"+value+"',";
        });
        return tmp + "}";
    }
}

function delete_local_storage(){
    for(var i=0; i < localStorage.length; i++){
        localStorage.removeItem(localStorage.key(i));
    }
}

function get_local_storage(){
    for(var i=0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        var p = localStorage.getItem(k);
        if(p && p.indexOf("|")==-1 && k != "active_path" && k != "active_arguments")
            user[k] = p;
        else if(p)
            user[k] = p.split("|");
    }
}

function set_local_storage(){
    $.each(user, function(key,value){
        if(typeof value == "object" && value.length > 1){
            localStorage.setItem(key, value.join("|"));
        } else
            localStorage.setItem(key, value);
    });
}

function bootsub_init(){
    player_init();
    get_local_storage();
    $("#player").hide();
    
    if(config["subsonic_url"] == ""){
       $('#form_signin_url').show();
    }
    if(user["autologin"] == "yes"){
         perform_login();
    }
}

function get_menu_config(menu_path){
    var args = menu_path;
    var depth = args.length;
    var akt_elem = menu;

    for(var i=0; i < depth; i++){
        var found = false;
        $.each(akt_elem,function(key,value){
            if(key == args[i] || value["type"] == "catchall"){
                found = true;

                if(i+1 < depth){
                    akt_elem = value["submenus"];
                } else
                    akt_elem = value;
            }
        });
        if(!found){
            var menue = args.toString();
            display_message("danger", "Menükonfiguration nicht gefunden!", "Die Seite '"+menue+"' konnte nicht gefunden werden!");
            break;
        }
    }
    return akt_elem;
}

function updateMenu(){
	var tmp = "";

	$.each(menu,function(key,value){
		// iterate over main menus
		// key is the menu-name

		if(!value["display"]){
			tmp += "<li id=\"navbar_" + key + "\" class=\"bootsub_navbar";
			if(user["active_path"].slice(0, 1)[0] == key)
				tmp += " active";

			// check for submenus and their amount
            var count = 0;
            if(value["submenus"]){
                $.each(value["submenus"],function(key2,value2){
                    // iterate over all submenus
                    if(!value2["display"])
                        count++;
                });
            }
			if(count > 0){
				tmp += " dropdown\">";
				tmp += "<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"focusable\" onClick=\"change_menu(new Array('" + key + "'));\">" + key + "</span> <b class=\"caret\"></b></a>";
				tmp += "<ul class=\"dropdown-menu\">";
				$.each(value["submenus"],function(key2,value2){
					// iterate over all submenus
					if(!value2["display"])
						tmp += "<li><a href=\"#\" onClick=\"change_menu(new Array('" + key + "','" + key2 + "'));\" class=\"focusable\">" + key2 + "</a></li>";
				});
				tmp += "</ul>";
			} else {
				// no submenus present
				tmp += "\">";
				tmp += "<a href=\"#\" onClick=\"change_menu(new Array('" + key + "'));\" class=\"focusable\">" + key + "</a>";
			}

			tmp += "</li>";
		}
	});
	
	$('#main_menu').html(tmp);
        resetNav();
}


function change_menu(menu_path, menu_arguments){
    if(mutex)
       return;

    mutex = true;
    var depth = menu_path.length;
    var full_container_name = "#container";
    var full_navbar_name = "#navbar";
    var akt_elem = menu;
    for(var i=0; i<depth; i++){
        // iterate over all menulevels
        var found = false;
        $.each(akt_elem,function(key,value){
            if(menu_path[i] == key || value["type"] == "catchall"){
                found = true;
                full_container_name += "_" + key;
                if(i == 0){
                    // if this is the first menu level
                    full_navbar_name += "_" + key;
                }
                if(i+1 < depth){
                    // next step searches the submenus of the current node
                    akt_elem = value["submenus"];
                }
            }
        });
        if(!found){
            // the menupath is not valid!
            display_message("danger", "Menüeintrag nicht gefunden!", "'"+menu_path[i]+"' aus '"+menu_path+"' existiert nicht!");
            return;
        }
    }

    // get page config
    var page_config = get_menu_config(menu_path);
    // verify that everything is there
    if($(full_container_name).length > 0 || page_config["onLoad"]){
        if($(full_navbar_name).length > 0){

        } else {
            display_message("danger","Navigation nicht gefunden!","Das root-Menü-Element '"+full_navbar_name+"' konnte nicht gefunden werden!");
            return;
        }
    } else {
        display_message("danger", "Inhalt nicht gefunden!", "Der Inhaltscontainer '"+full_container_name+"' konnte nicht gefunden werden!");
        return;
    }
    // change active node of the root navbar
    $('.bootsub_navbar').removeClass('active');
    $(full_navbar_name).addClass('active');
    // change active content
    $('.bootsub_container:visible').fadeOut(250);
    $(full_container_name).delay(250).fadeIn(500, function(){ mutex = false; });
    // execute the pagefunction if there is one
    if(page_config["onLoad"]){
        // check for passing arguments
        if(page_config["onLoad"].indexOf('(arguments)')==-1)
            eval(page_config["onLoad"]);
        else {
            eval(page_config["onLoad"].replace("(arguments)","("+get_object_as_string(menu_arguments)+")"));
        }
    }
    // set the new path
    user["active_path"] = menu_path;
    // update the breadcrumb
    updateBreadcrumb();
    // save the new positioning
    set_local_storage();
}

function getRestUrl(action, params){
	var tmp = user["subsonic_url"] + "rest/";
	tmp += action;
	tmp += ".view?";
	tmp += "v=1.9.0";
	tmp += "&u=" + encodeURIComponent(user["name"]);
	tmp += "&p=" + encodeURIComponent(user["password"]);
	tmp += "&f=jsonp";
	tmp += "&c=WebPlayer";
	tmp += params;
	return tmp;
}

function display_message(mode, title, message){
	var tmp = "<div class=\"alert alert-";
	tmp += mode;
	tmp += " alert-dismissable\">";
  	tmp += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>\n";
	if(title != "")
		tmp += "<strong>" + title + "</strong> ";
	if(message != "")
		tmp += message;
	tmp += "</div>";

	if($('#content_login').css("display") == "block"){
		$('#notifications_login').slideUp(250).delay(250).html(tmp).slideDown(250);
	} else {
		/* display the notification inside the login form */
		$('#notifications').prepend(tmp);
	}
}

function display_subsonic_response(message){
	var mode = "";
	var nachricht = "";
	var title = "";

	if(message["status"]=="ok"){
		mode = "success";
		nachricht = "Login erfolgreich";
	} else {
		mode = "danger";
		title = "Fehler!";
		nachricht = message["error"]["message"];
	}
	display_message(mode, title, nachricht);
}

function perform_logout(){
    mutex = true;
    $('#form_signin_url').val(user["subsonic_url"]);
    $('#form_signin_password').val(user["password"]);
    $('#form_signin_username').val(user["name"]);
    $('#form_signin_autologin').val(user["autologin"]);
    delete_local_storage();
    $('#content_main').fadeOut(500);
    $('#footer').fadeOut(500);
    $('#content_login').delay(500).fadeIn(1000, function(){ mutex = false; });
}

function display_duration(seconds){
    var tmp = Math.floor(seconds / 60) + ":";
    var sec = seconds % 60;
    if(sec > 9)
        return tmp + sec;
    else
        return tmp + "0" + sec;
}

function perform_login(){
    // login!
    $('#content_login').fadeOut(500);
    $('#content_main').delay(500).fadeIn(1000, function(){ mutex = false; });
    $('#footer').delay(500).fadeIn(1000);
    updateMenu();
    change_menu(user["active_path"],user["active_arguments"]);
    updateBreadcrumb();
}

function login(){
	if(!mutex){
		mutex = true;
        if($('#form_signin_url').css("display") != "none")
            user["subsonic_url"] = $('#form_signin_url').val();
        else
            user["subsonic_url"] = config["subsonic_url"];
		user["password"] = $('#form_signin_password').val();
		user["name"] = $('#form_signin_username').val();
        user["autologin"] = $('#form_signin_autologin').val();
		var req_url = getRestUrl("ping", "");
		$.ajax({
			url: req_url,
			dataType: "jsonp",
			type: "GET"
		}).done(function(data){
			if(data["subsonic-response"]["status"] == "ok"){
                set_local_storage();
				perform_login();
			} else {
				display_subsonic_response(data['subsonic-response']);
			}
			mutex = false;
		});
	}
}

function updateBreadcrumb(){
	var tmp = "";
    var depth = user["active_path"].length;
    for(var i=0; i<depth; i++){
        if(i+1 < depth)
            tmp += "<li><a href=\"#\" class=\"focusable\" onClick=\"change_menu("+get_array_as_string(user["active_path"].slice(0,i+1))+");\">";
        else
            tmp += "<li class=\"active\">";
        var akt_conf = get_menu_config(user["active_path"]);
        if(akt_conf["title"])
            tmp += akt_conf["title"];
        else
            tmp += user["active_path"][i];
        if(i+1 < depth)
            tmp += "</a></li>";
        else
            tmp += "</li>";
    }
    $('#main_breadcrumb').html(tmp);
}

function display_pagination(pager_element, content_element, content){
	var tmp = "";
	var tmp_pager = "";
	if(!$('#'+pager_element).length > 0)
		display_message("danger", "Inhalt nicht gefunden!", "Der Pager '" + pager_element  +  "' konnte nicht gefunden werden!");
	if(!$('#'+content_element).length > 0)
		display_message("danger", "Inhalt nicht gefunden!", "Der Contentbrowser '"+content_element+"' vom Pager '"+pager_element+"' konnte nicht gefunden werden!");
	tmp_pager += "<ul class=\"pagination\" >";
	var count = 0;
	$.each(content,function(key,value){
		tmp_pager += "<li id=\""+pager_element+"_"+count+"\"><a href=\"#\" class=\"focusable\" onClick=\"display_pagination_select_page('"+pager_element+"','"+content_element+"','"+count+"');\">" + key + "</a></li>";
		tmp += "<div class=\"pagebrowser_content\" id=\""+content_element+"_"+count+"\" style=\"display:none;\">";
		var width = 1000;
		if($('#'+content_element).width() > width)
			width = $('#'+content_element).width();
		var max_rows = Math.floor(width / 250);
		var elements_per_row = Math.ceil(value.length / max_rows);
		var col_count = 1;
		tmp += "<table><tr>";
		$.each(value,function(key2,value2){
			tmp += "<td>";
			if(user["display_pagination_mode"] == "simple"){
				tmp += "<a href=\"#\" class=\"focusable\" onClick=\"change_menu(['Interpreten','"+value2['name']+"'], {'artist_id': '"+value2['id']+"'});\">"+value2['name']+"</a>";
			} else {
				tmp += "<div class\"media\">";
				tmp += "<a class=\"pull-left focusable\" href=\"#\" onClick=\"change_menu(['Interpreten','"+value2['name']+"'], {'artist_id': '"+value2['id']+"'});\">";
				if(value2['coverArt']){
					tmp += "<img class=\"media-object img-thumbnail\" src=\"";
					tmp += getRestUrl('getCoverArt','&size=50&id='+value2["coverArt"]);
					tmp += "\" title=\""+value2['name']+"\" />";
				} else
					tmp += "<div class=\"img_replacer\"></div>";
				tmp += "</a>";
					tmp += "<div class\"media-body\">";
					tmp += "<h4 class\"media-heading\">"+value2['name']+"</h4>";
					tmp += "Alben: "+value2['albumCount'];
					tmp += "</div>";
				tmp += "</div>";
			}
			tmp += "</td>";
			if(col_count >= max_rows){
				tmp += "</tr>";
				tmp += "<tr>";
				col_count = 1;
			} else {
				col_count++;
			}
		});
		tmp += "</table>";
		tmp += "</div>";
		count++;
	});
	tmp_pager += "</ul>";

	$('#'+pager_element).html(tmp_pager);
	$('#'+content_element).html(tmp);

	display_pagination_select_page(pager_element, content_element, '0');
}
function display_pagination_select_page(pager_element, content_element, selection){
	$('#'+pager_element).find('li').filter('.active').removeClass("active");
	$('#'+content_element).find('div.pagebrowser_content').fadeOut(500);
	$('#'+pager_element+'_'+selection).addClass("active");
	$('#'+content_element+'_'+selection).delay(500).fadeIn(500);
}
