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

YAHOO.tool.TestRunner.add(
  new YAHOO.tool.TestCase({
    name: 'Input-Counted',

    company1: YAHOO.util.Dom.get('company1').getElementsByTagName('input')[0],
    company2: YAHOO.util.Dom.get('company2').getElementsByTagName('input')[0],

    testValueCompare1: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          this.company1.focus();
        },
        function () {
          YAHOO.util.Assert.areEqual('foo', this.company1.value, "Value doesn't match, 'foo' Expected");
        }
      );
    },

    testValueCompare2: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          this.company1.focus();
        },
        function () {
          YAHOO.util.Assert.areEqual('bar', this.company1.value, "Value doesn't match, 'foo' Expected");
        }
      );
    },

    testSizeCompare1: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          this.company1.focus();
        },
        function () {
          YAHOO.util.Assert.areSame(6, this.company1.value.length, "Size doesn't match");
        }
      );
    },

    testSizeCompareMax1: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          // YAHOO.util.UserAction.keyup(this.company2);
        },
        function () {
          YAHOO.util.Assert.areSame(5, this.company2.value.length, "Size doesn't match");
        }
      );
    },

    testSizeCompareMax2: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          YAHOO.util.UserAction.keyup(this.company2);
        },
        function () {
          YAHOO.util.Assert.areSame(5, this.company2.value.length, "Size doesn't match");
        }
      );
    },

    testSizeDisplay1: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          this.company2.value = 'Hello Company!';
          // YAHOO.util.UserAction.keyup(this.company2);
          this.displayElement = YAHOO.util.Dom.getElementsByClassName(
            'cstudio-xforms-counter',
            null,
            YAHOO.util.Dom.get('company2')
          )[0];
          this.maxLength = YAHOO.util.Dom.getElementsByClassName(
            'xbl-fr-input-counted-max',
            null,
            YAHOO.util.Dom.get('company2')
          )[0];
        },
        function () {
          YAHOO.util.Assert.areSame(
            this.displayElement.innerHTML,
            this.company2.value.length + ' / ' + this.maxLength.innerHTML,
            "Size doesn't match"
          );
        }
      );
    },

    testSizeDisplay2: function () {
      ORBEON.util.Test.executeCausingAjaxRequest(
        this,
        function () {
          this.company2.value = 'Hello Company!';
          YAHOO.util.UserAction.keyup(this.company2);
          this.displayElement = YAHOO.util.Dom.getElementsByClassName(
            'cstudio-xforms-counter',
            null,
            YAHOO.util.Dom.get('company2')
          )[0];
          this.maxLength = YAHOO.util.Dom.getElementsByClassName(
            'xbl-fr-input-counted-max',
            null,
            YAHOO.util.Dom.get('company2')
          )[0];
        },
        function () {
          YAHOO.util.Assert.areSame(
            this.displayElement.innerHTML,
            this.company2.value.length + ' / ' + this.maxLength.innerHTML,
            "Size doesn't match"
          );
        }
      );
    }
  })
);

ORBEON.xforms.Events.orbeonLoadedEvent.subscribe(function () {
  if (parent && parent.TestManager) {
    parent.TestManager.load();
  } else {
    new YAHOO.tool.TestLogger();
    YAHOO.tool.TestRunner.run();
  }
});
