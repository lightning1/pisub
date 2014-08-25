/*
 * @author: Felix Kluge <felix_kluge@wh2.tu-dresden.de>
 *
 * This file contains all settings related to bootsub
 *
 */

var config = {
    "subsonic_url": "https://subsonic.othala.de/",
    "active_path": [
    ]
};

var menu = {
    "Kluge-Mixe": {
        "onLoad": "submenu_function_display_klugemixes()"
    },
    "Interpreten": {
        "onLoad": "submenu_function_list_artists()",
        "submenus": {
            "Interpret": {
                "type": "catchall",
                "display": "none",
                "onLoad": "submenu_function_display_artist(arguments);",
                "submenus": {
                    "Album": {
                        "type": "catchall",
                        "display": "none",
                        "onLoad": "submenu_function_display_album(arguments);"
                    }
                }
            }
        }
    },
    "Genres": {
        "onLoad": "submenu_function_display_genres()"
    },
    "Suche": {
        "display": "none"
    }
};
