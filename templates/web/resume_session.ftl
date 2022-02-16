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
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>CrafterCMS - Resume Session</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script>
    setTimeout(() => {
      document.querySelector('.banner').style.display = '';
    }, 1000);
    window.close();
  </script>
  <style>
    html, body {
      height: 100%;
      text-align: center;
      background: #f3f3f3;
      font-family: sans-serif;
    }
    .banner {
      display: flex;
      height: 100%;
      flex-direction: column;
      align-items: center;
      place-content: center;
    }
    .banner__image {
      max-width: 300px;
      margin: 1em 0;
    }
  </style>
</head>
<body>
<section class="banner" style="display: none">
  <h1>Session Renewed</h1>
  <img class="banner__image" src="/studio/static-assets/images/content_creation.svg" alt="">
  <p>You may now return to your other tab to resume your session.</p>
</section>
</body>
</html>
