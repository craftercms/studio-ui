<!--
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
  <meta charset="utf-8" />
  <link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <title>Replica node reached</title>
  <style>
    body {
      margin: 0;
    }
    #root {
      display: flex;
      height: 100vh;
    }

    * {
      box-sizing: border-box;
    }

    .craftercms-error-state {
      display: flex;
      height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 8px 0;
      max-width: 420px;
      margin: 0 auto;
    }

    .craftercms-error-state-image {
      width: 300px;
      margin-bottom: 8px;
    }

    .craftercms-error-state-message {
      margin-top: 20px;
      word-break: break-word !important;
      text-align: center;
      font-family: "Source Sans Pro", "Open Sans", sans-serif;
      font-weight: 400;
      font-size: 0.875rem;
      line-height: 1.43;
    }
  </style>

</head>
<body>

  <section class="craftercms-error-state">
    <img class="craftercms-error-state-image" src="/studio/static-assets/images/warning_state.svg">
    <p class="craftercms-error-state-message">
      Oops! You've reached a Replica node instead of the Primary node. Try refreshing your browser and contact your system administrator if the problem persists.
    </p>
  </section>
</body>
</html>
