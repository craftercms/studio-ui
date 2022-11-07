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
    #root {
      display: flex;
    }

    * {
      box-sizing: border-box;
    }

    .craftercms-error-state {
      max-width: 420px;
      margin: 40px auto;
    }

    .craftercms-error-state-image {
      width: 300px;
    }

    .craftercms-error-state-message {
      margin-top: 20px;
      word-break: break-word !important;
    }
  </style>

</head>
<body>
<div id="root"></div>
<#include "/templates/web/common/js-next-scripts.ftl" />
<script>
  (function(ui) {
    const { formatMessage } = ui.i18n.intl;
    const { clusterReplicaLandingMessages } = ui.i18n.messages;
    const elem = document.querySelector('#root');
    ui.render(elem, 'ErrorState', {
      imageUrl: '/studio/static-assets/images/warning_state.svg',
      classes: {
        root: 'craftercms-error-state',
        image: 'craftercms-error-state-image',
        message: 'craftercms-error-state-message'
      },
      message: formatMessage(clusterReplicaLandingMessages.replicaReached)
    });
  })(CrafterCMSNext);
</script>
</body>
</html>
