/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/log-view.css");
CStudioAdminConsole.Tool.LogView = CStudioAdminConsole.Tool.LogView ||  function(config, el)  {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    this.currMillis = new Date().getTime();
    return this;
}

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.LogView, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        CStudioAdminConsole.Tool.LogView.ticks = 0;
        CStudioAdminConsole.Tool.LogView.currMillis = 0
        CStudioAdminConsole.Tool.LogView.pause = false;
        CStudioAdminConsole.Tool.LogView.history =
            "<th class='cs-loglist-heading'>Timestamp</th>" +
            "<th class='cs-loglist-heading'>Message</th>" +
            "<th class='cs-loglist-heading'>Details</th>";

        var workareaEl = document.getElementById("cstudio-admin-console-workarea");

        workareaEl.innerHTML =
            "<div id='log-view'>" +
            "<table id='logTable' class='cs-loglist'>" +
            "<tr>" +
            "</tr>" +
            "</table>" +
            "</div>";

        var actions = [
            { name: "Play/Pause", context: this, method: this.playPauseToggleClick, icon: "fa-pause" },
            { name: "Clear", context: this, method: this.clear }
        ];

        CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);

        this.renderLogView();
    },

    clear:function () {
        var tailEl = document.getElementById('logTable');
        tailEl.innerHTML= "";
        CStudioAdminConsole.Tool.LogView.history =
            "<th class='cs-loglist-heading'>Timestamp</th>" +
            "<th class='cs-loglist-heading'>Message</th>" +
            "<th class='cs-loglist-heading'>Details</th>";
        CStudioAdminConsole.Tool.LogView.currMillis = new Date().getTime();
    },

    playPauseToggleClick: function() {
        CStudioAdminConsole.Tool.LogView.pause = (!CStudioAdminConsole.Tool.LogView.pause);
        var element = document.querySelector("#activeContentActions .fa");
        if(!CStudioAdminConsole.Tool.LogView.pause ){
            YDom.removeClass(element, "fa-caret-right");
            YDom.removeClass(element, "fa-2x");
            YDom.addClass(element, "fa-pause");
        }else{
            YDom.removeClass(element, "fa-pause");
            YDom.addClass(element, "fa-2x");
            YDom.addClass(element, "fa-caret-right");
        }
    },

    renderLogView: function() {
        this.appendLogs();
        window.setTimeout(function(console) {
            CStudioAdminConsole.Tool.LogView.ticks += 1;
            console.renderLogView();
        }, 5000, this);
    },

    appendLogs: function() {
        var tailEl = document.getElementById('logTable');

        var cb = {
            success:function(response) {
                CStudioAdminConsole.Tool.LogView.currMillis = new Date().getTime();
                if(CStudioAdminConsole.Tool.LogView.ticks > 100) {
                    // can't grow the DOM forever
                    CStudioAdminConsole.Tool.LogView.ticks = 0;
                    CStudioAdminConsole.Tool.LogView.history = "";
                }

                var entries = eval("(" + response.responseText + ")");

                for(var i=0; i<entries.length; i++) {
                    var entry = entries[i];

                    if(entry.message != "") {


                        CStudioAdminConsole.Tool.LogView.history += "<tr class='entry "+entry.level+"' >"+
                            "<td class='timestamp'>"+entry.timestamp+"</td>"+
                            "<td class='message'>"+entry.message+"</td>"+
                            "<td class='exception'>"+entry.exception+"</td>"+
                            "</tr>";
                    }

                    if(CStudioAdminConsole.Tool.LogView.pause == false) {
                        this.el.innerHTML = CStudioAdminConsole.Tool.LogView.history;
                        var viewEl = document.getElementById("log-view")
                        viewEl.scrollTop = viewEl.scrollHeight;
                    }

                }


            },
            failure: function() {
            },

            el: tailEl
        }

        if(tailEl) {
            var since = CStudioAdminConsole.Tool.LogView.currMillis;
            var serviceUri = "/api/1/monitoring/log.json?since="+since+"&site="+CStudioAuthoringContext.site;
            YConnect.asyncRequest("GET", serviceUri, cb);
        }
        else {
            if(CStudioAdminConsole.Tool.LogView.refreshFn) {
                window.clearTimeout(CStudioAdminConsole.Tool.LogView.refreshFn);
            }
        }
    }
});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-log-view",CStudioAdminConsole.Tool.LogView);