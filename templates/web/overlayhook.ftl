<#--
~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
~
~ This program is free software: you can redistribute it and/or modify
~ it under the terms of the GNU General Public License version 3 as published by
~ the Free Software Foundation.
~
~ This program is distributed in the hope that it will be useful,
~ but WITHOUT ANY WARRANTY; without even the implied warranty of
~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
~ GNU General Public License for more details.
~
~ You should have received a copy of the GNU General Public License
~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<#assign studioContext = envConfig.studioContext/>
<#-- language=JavaScript -->
${"(function (crafterRequire, origin) {

  const authoringServer = `${'$'}{origin}/${studioContext}`;
  const staticAssets = `${'$'}{authoringServer}/static-assets`;

  crafterRequire.config({
    baseUrl: `${'$'}{staticAssets}/scripts`,
    paths: {
      'libs': `${'$'}{staticAssets}/libs/`,
      'jquery': `${'$'}{staticAssets}/libs/jquery/dist/jquery`,
      'jquery-ui': `${'$'}{staticAssets}/libs/jquery-ui/jquery-ui`,
      'amplify': `${'$'}{staticAssets}/libs/amplify/lib/amplify.core`,
      'noty': `${'$'}{staticAssets}/libs/notify/notify.min`
    }
  });

  crafterRequire(['guest'], function (guest) {
    guest.init({
      hostOrigin: origin,
      studioContext: '${studioContext}',
      studioStaticAssets: 'static-assets'
    });
  });

}) (crafterRequire, window.location.origin);"}
