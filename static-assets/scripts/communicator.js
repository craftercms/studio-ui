/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function(window) {
  var define =
    typeof window.crafterDefine === 'function' && window.crafterDefine.amd
      ? window.crafterDefine
      : function(a, b, f) {
          f(window.crafter, window.amplify);
        };

  define('communicator', ['crafter', 'amplify'], function(crafter, amplify) {
    'use strict';

    if (typeof amplify === 'undefined') {
      amplify = window.amplify;
    }

    var studio = crafter.studio,
      undefined;

    var SCOPE_LOCAL = 'SCOPE_LOCAL',
      SCOPE_BROADCAST = 'SCOPE_BROADCAST',
      SCOPE_EXTERNAL = 'SCOPE_EXTERNAL',
      SCOPE_REMOTE = 'SCOPE_REMOTE',
      ALL_TOPICS = '*';

    function Communicator(remotes, targetWindows, allowedOrigins) {
      if (arguments.length === 1) {
        allowedOrigins = remotes;
        targetWindows = [];
        remotes = [];
      } else if (arguments.length === 2) {
        allowedOrigins = targetWindows;
        targetWindows = remotes;
        remotes = [];
      }

      if (!remotes) {
        remotes = [];
      }

      if (!targetWindows) {
        remotes = [];
      }

      if (!allowedOrigins) {
        allowedOrigins = [];
      }

      if (typeof remotes === 'string' || !('splice' in remotes)) {
        remotes = [remotes];
      }

      if (typeof targetWindows === 'string' || !('splice' in targetWindows)) {
        targetWindows = [targetWindows];
      }

      if (typeof allowedOrigins === 'string' || !('splice' in allowedOrigins)) {
        allowedOrigins = [allowedOrigins];
      }

      var me = this;
      var privates = {
        remotes: remotes,

        targetWindows: targetWindows,

        defaultScope: SCOPE_BROADCAST,

        allowedOrigins: allowedOrigins
      };

      this.setAllowedOrigins = function(origins) {
        privates.allowedOrigins = origins;
      };

      this.getAllowedOrigins = function() {
        return privates.allowedOrigins;
      };

      this.getDefaultScope = function() {
        return privates.defaultScope;
      };

      this.setDefaultScope = function(defaultScope) {
        privates.defaultScope = defaultScope;
      };

      this.getTargetWindows = function() {
        return privates.targetWindows;
      };

      this.setTargetWindows = function(targetWindows) {
        privates.targetWindows = targetWindows;
      };

      window.addEventListener(
        'message',
        function(event) {
          receiveMessage.call(me, event);
        },
        false
      );

      return this;
    }

    Communicator.prototype = {
      addOrigin,
      addTargetWindow,
      removeTargetWindow,
      isAllowedOrigin: isAllowedOrigin,
      publish,
      pub: publish,
      subscribe,
      on: subscribe,
      unsubscribe,
      dispatch
    };

    /*public*/
    function subscribe(topic, callback, scope) {
      return amplify.subscribe(getScopeSpecificTopic(topic, scope), callback);
    }

    /*public*/
    function unsubscribe(topic, callback, scope) {
      return amplify.unsubscribe(getScopeSpecificTopic(topic, scope), callback);
    }

    /*public*/
    function addOrigin(origin) {
      this.getAllowedOrigins().push(origin);
    }

    /*public*/
    function isAllowedOrigin(origin) {
      var origins = this.getAllowedOrigins(),
        i,
        l;

      for (i = 0, l = origins.length; i < l; ++i) {
        if (origins[i] === origin) {
          return true;
        }
      }

      return false;
    }

    /*public*/
    function addTargetWindow(targetWindow) {
      var hasWindow = false,
        targetWindows = this.getTargetWindows();

      for (var i = 0; !hasWindow && i < targetWindows.length; ++i)
        hasWindow = targetWindow.window === targetWindows[i].window;

      if (!hasWindow) targetWindows.push(targetWindow);

      return !hasWindow;
    }

    /*public*/
    function removeTargetWindow(targetWindow) {
      var i,
        hasWindow = false,
        targetWindows = this.getTargetWindows();

      for (i = 0; !hasWindow && i < targetWindows.length; ++i) hasWindow = targetWindow === targetWindows[i];

      if (!hasWindow) targetWindows.push(targetWindow);

      return !hasWindow;
    }

    /*public*/
    function publish(topic, message, scope) {
      switch (message) {
        case SCOPE_LOCAL:
        case SCOPE_REMOTE:
        case SCOPE_EXTERNAL:
        case SCOPE_BROADCAST:
          scope = message;
          message = undefined;
          break;
      }

      switch (scope) {
        case SCOPE_LOCAL:
        case SCOPE_REMOTE:
        case SCOPE_EXTERNAL:
        case SCOPE_BROADCAST:
          break;
        default:
          scope = this.getDefaultScope();
      }

      // Publish event locally.
      if (scope === SCOPE_LOCAL || scope === SCOPE_BROADCAST) {
        doLocalPublish(topic, scope, message);
      }

      // Publish data externally.
      if (scope === SCOPE_BROADCAST || scope === SCOPE_EXTERNAL) {
        sendMessage.call(this, { topic: topic, message: message, scope: scope });
      }
    }

    /*private*/
    function sendMessage(message, targetWindows) {
      !targetWindows && (targetWindows = this.getTargetWindows());

      message.meta = { craftercms: true, source: 'legacy' };

      for (var i = 0, l = targetWindows.length; i < l; ++i) {
        targetWindows[i].window.postMessage(message, targetWindows[i].origin);
      }
    }

    function dispatch(action) {
      var targetWindows = this.getTargetWindows();
      for (var i = 0, l = targetWindows.length; i < l; ++i) {
        targetWindows[i].window.postMessage(action, targetWindows[i].origin);
      }
    }

    /*private*/
    function receiveMessage(event) {
      if (this.isAllowedOrigin(event.origin)) {
        var data = event.data;
        if (data != null && typeof data === 'object') {
          if ('topic' in data) {
            doLocalPublish(data.topic, data.scope, data.message);
          } else if (
            // This is the signature of PageBuilder messages
            'type' in data &&
            'meta' in data
          ) {
            doLocalPublish(data.type, null, data.payload);
          }
        }
      }
    }

    /*private*/
    function getScopeSpecificTopic(topic, scope) {
      return topic + (scope ? ':' + scope : '');
    }

    /*private*/
    function doLocalPublish(topic, scope, message) {
      amplify.publish(ALL_TOPICS, topic, message, scope);
      amplify.publish(topic, message, scope);
      if (scope) {
        const scoped = getScopeSpecificTopic(topic, scope);
        amplify.publish(scoped, message, scope);
      }
    }

    Communicator.SCOPE_LOCAL = SCOPE_LOCAL;
    Communicator.SCOPE_BROADCAST = SCOPE_BROADCAST;
    Communicator.SCOPE_EXTERNAL = SCOPE_EXTERNAL;
    Communicator.SCOPE_REMOTE = SCOPE_REMOTE;

    studio.define('Communicator', Communicator);

    return Communicator;
  });
})(window);
