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

/* Functions for onload events */
/* These say the are global but want to double check if they can be removed and applied exactly that's better.
 * so far it looks like this is only used on the login page
 */

$(document).ready(function () {
  /* dashboard tree table row color change on mouseover and reset on mouseout */
  if ($('table.ttTable').length > 0) {
    $('.ttTable tbody tr:not(.avoid)')
      .mouseover(function () {
        $(this).addClass('rowHighLight');
      })

      .mouseout(function () {
        $(this).removeClass('rowHighLight');
      });
  }

  /* change the search box value and color on focus and reset back on blur if its empty */
  if ($('input.searchBox').length > 0) {
    var searchBox = $('input.searchBox');
    var searchBoxDefault = 'Search';

    searchBox.focus(function (e) {
      if ($(this).attr('value') == searchBoxDefault) $(this).attr('value', '');
      $(this).css({ color: '#444' });
    });

    searchBox.blur(function () {
      if ($(this).attr('value') == '') {
        $(this).attr('value', searchBoxDefault);
        $(this).css({ color: '#ccc' });
      }
    });
  }

  /* Login form value changes on user events*/

  if ($('#loginForm').length > 0) {
    var nameBox = $('input#username');
    var nameBoxDefault = 'Citrite Username';

    nameBox.focus(function (e) {
      if ($(this).attr('value') == nameBoxDefault) $(this).attr('value', '');
      $(this).css({ color: '#444' });
    });

    nameBox.blur(function () {
      if ($(this).attr('value') == '') {
        $(this).attr('value', nameBoxDefault);
        $(this).css({ color: '#ccc' });
      }
    });

    var passBox = $('input#password');
    var passDummyBox = $('input#pwDummy');
    var passBoxDefault = 'Password';

    passDummyBox.focus(function (e) {
      $(this).css({ display: 'none' });
      passBox.css({ display: 'block', color: '#444' });
      passBox.focus();
    });

    passBox.blur(function () {
      if ($(this).attr('value') == '') {
        $(this).css({ display: 'none' });
        passDummyBox.css({ display: 'block' });
        passDummyBox.attr('value', passBoxDefault);
        passDummyBox.css({ color: '#ccc' });
      }
    });

    nameBox.blur();

    var disableLogin = function (loginInfo) {
      if ($('#verticalContainer')) {
        $('<div id="loginInfoContainer"><p id="loginInfo">' + loginInfo + '</p></div>').insertBefore(
          '#verticalContainer'
        );
      } else {
        alert(loginInfo);
      }
      $('input#username').attr('disabled', 'disabled');
      $('input#password').attr('disabled', 'disabled');
      $('input#btn-login').attr('disabled', 'disabled');
      $('input#pwDummy').attr('disabled', 'disabled');
      $('input#username').addClass('loginInputDisable');
      $('input#password').addClass('loginInputDisable');
      $('input#pwDummy').addClass('loginInputDisable');
      $('input#btn-login').addClass('loginInputDisable');
    };

    if (navigator && navigator.userAgent) {
      var userAgent = navigator.userAgent;
      if (userAgent.indexOf('Firefox') != -1) {
        var fullVersion = userAgent.substring(userAgent.indexOf('Firefox') + 8);
        try {
          if (parseInt(fullVersion, 10) <= 2) {
            disableLogin(
              'This application only supports Firefox 3.x. Please ' +
                '<a href="http://www.mozilla.com/en-US/firefox/all-older.html">' +
                'download</a> the proper version of firefox.'
            );
          }
        } catch (e) {}
      } else {
        disableLogin(
          'This application only supports Firefox 3.x. Please ' +
            '<a href="http://www.mozilla.com/en-US/firefox/all-older.html">' +
            'download</a> the proper version of firefox.'
        );
      }
    }
  }
});
