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
<!doctype html>
<html lang="en">
<head>
  <title>Crafter CMS - Resume Session</title>
</head>
<body>
<script>
  setTimeout(() => {
    const el = document.createElement('h1');
    el.innerHTML = 'Bye!';
    document.body.appendChild(el);
  }, 1000);
  setTimeout(() => {
    window.close();
  }, 2000);
</script>
</body>
</html>
