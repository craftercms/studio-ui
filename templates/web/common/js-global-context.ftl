<#--
~ Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

<#assign env_config = envConfig???then(envConfig + _csrf, {})/>
<script type="text/plain" id="xsrfHeader">${env_config.headerName!_csrf.headerName!'X-XSRF-TOKEN'}</script>
<script type="text/plain" id="xsrfArgument">${env_config.parameterName!_csrf.parameterName!'_csrf'}</script>
<script type="text/plain" id="useBaseDomain">${env_config.useBaseDomain!'false'}</script>
