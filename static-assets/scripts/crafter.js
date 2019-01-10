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

(function (window) {
    'use strict';

    var crafter = {};

    crafter.noop = function () {};

    crafter.define = function (packageName, component) {
        var root = crafter,
            packages = packageName.split('.'),
            componentName = packages[packages.length - 1];
        for (var i = 0, l = (packages.length - 1); i < l; ++i) {
            var pkg = packages[i];
            if (!root[pkg]) root[pkg] = {};
            root = root[pkg];
        }
        root[componentName] = component;
        if (typeof define === "function" && define.amd) {
            define(dasherize(componentName), [], function () {
                return component;
            });
        }
        return ('crafter.' + packageName);
    };


    crafter.guid = function () {
        return (
            (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
            (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
            (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
            (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1));
    };

    crafter.String = CrafterString;

    crafter.studio = {
        define: function (packageName, component) {
            packageName = ('studio.' + packageName);
            return crafter.define(packageName, component);
        },
        
        marketplace: {
            Topics: {
                "ALL": "*",
                "STORE_READY": "STORE_READY",
                "INSTALL_SITE_PLUGIN": "INSTALL_SITE_PLUGIN",
                "INSTALL_COMPLETE": "INSTALL_COMPLETE",
                "INSTALLED_PLUGINS": "INSTALLED_PLUGINS"
            }
        },
        
        preview: {
            Topics: {
                "ALL": "*",

                "GUEST_CHECKIN": "GUEST_CHECKIN",
                "GUEST_CHECKOUT": "GUEST_CHECKOUT",
                "GUEST_SITE_LOAD": "GUEST_SITE_LOAD",
                "CHANGE_GUEST_REQUEST": "CHANGE_GUEST_REQUEST",
                "IS_REVIEWER": "IS_REVIEWER",

                "INIT_ICE_REGIONS": "INIT_ICE_REGIONS",
                "RESIZE_ICE_REGIONS": "RESIZE_ICE_REGIONS",
                "ICE_ZONE_ON": "ICE_ZONE_ON",
                "ICE_ZONES": "ICE_ZONES",
                "ICE_TOOLS_INDICATOR": "ICE_TOOLS_INDICATOR",
                "START_DRAG_AND_DROP": "START_DRAG_AND_DROP",
                "STOP_DRAG_AND_DROP": "STOP_DRAG_AND_DROP",
                "SAVE_DRAG_AND_DROP": "SAVE_DRAG_AND_DROP",
                "INIT_DRAG_AND_DROP": "INIT_DRAG_AND_DROP",
                "COMPONENT_DROPPED": "COMPONENT_DROPPED",
                "COMPONENT_MOVED": "COMPONENT_MOVED",
                "DND_COMPONENT_MODEL_LOAD": "DND_COMPONENT_MODEL_LOAD",
                "DND_COMPONENTS_MODEL_LOAD": "DND_COMPONENTS_MODEL_LOAD",
                "DND_ZONES_MODEL_REQUEST": "DND_ZONES_MODEL_REQUEST",
                "LOAD_MODEL_REQUEST": "LOAD_MODEL_REQUEST",
                "DND_COMPONENTS_PANEL_ON": "DND_COMPONENTS_PANEL_ON",
                "DND_COMPONENTS_PANEL_OFF": "DND_COMPONENTS_PANEL_OFF",
                "ICE_TOOLS_ON": "ICE_TOOLS_ON",
                "ICE_TOOLS_OFF": "ICE_TOOLS_OFF",
                "ICE_TOOLS_REGIONS": "ICE_TOOLS_REGIONS",
                "ICE_CHANGE_PENCIL_OFF": "ICE_CHANGE_PENCIL_OFF",
                "ICE_CHANGE_PENCIL_ON": "ICE_CHANGE_PENCIL_ON",
                "REFRESH_PREVIEW": "REFRESH_PREVIEW",
                "START_DIALOG": "START_DIALOG",
                "OPEN_BROWSE": "OPEN_BROWSE",
                "DND_CREATE_BROWSE_COMP": "DND_CREATE_BROWSE_COMP",

                "": ""
            },
            cstopic: function (topic) {
                return (crafter.studio.preview.Topics[topic] + '_cstd');
            }
        }
    };

    function CrafterString(string) {
        if (!(this instanceof CrafterString)) {
            return new CrafterString(string);
        }
        this.string = string;
    };

    CrafterString.prototype = {
        fmt: function (/* fmt1, fmt2, fmt2 */) {
            var index  = 0, formats = Array.prototype.splice.call(arguments, 0);
            return (this.string.replace(/%@([0-9]+)?/g, function(s, argIndex) {
                argIndex = (argIndex) ? parseInt(argIndex, 10) - 1 : index++;
                (index >= formats.length) && (index = 0);
                s = formats[argIndex];
                return (s === null) ? '(null)' : s;
            }));
        }
    };

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    crafter.join = function (/* path segments */) {
        // Split the inputs into a list of path commands.
        var parts = [];
        for (var i = 0, l = arguments.length; i < l; i++) {
            parts = parts.concat(arguments[i].split("/"));
        }
        // Interpret the path commands to get the new resolved path.
        var newParts = [];
        for (i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            // Remove leading and trailing slashes
            // Also remove "." segments
            if (!part || part === ".") continue;
            // Interpret ".." to pop the last segment
            if (part === "..") newParts.pop();
            // Push new path segments.
            else newParts.push(part);
        }
        // Preserve the initial slash if there was one.
        if (parts[0] === "") newParts.unshift("");
        // Turn back into a single string path.
        return newParts.join("/") || (newParts.length ? "/" : ".");
    }

    // A simple function to get the dirname of a path
    // Trailing slashes are ignored. Leading slash is preserved.
    crafter.dirname = function (path) {
        return join(path, "..");
    }

    if (typeof define === "function" && define.amd) {
        define('crafter', [], function () {
            return crafter;
        });
    } else {
        window.crafter = crafter;
    }

}) (window);
