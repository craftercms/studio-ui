<#assign locationOrigin = '${request.scheme}://${request.serverName}:${request.serverPort?c}' />

<#assign authoringServer = locationOrigin + '/studio'!''/>
<#assign studioContext = envConfig.studioContext!''/>
<#assign hostOrigin = locationOrigin />
<#assign staticAssets = "${authoringServer}/static-assets"/>

crafterRequire.config({
  baseUrl: '${staticAssets}/scripts',
  paths: {
    'libs': '${staticAssets}/libs/',
    'jquery': '${staticAssets}/libs/jquery/dist/jquery',
    'jquery-ui': '${staticAssets}/libs/jquery-ui/jquery-ui',
    'amplify': '${staticAssets}/libs/amplify/lib/amplify.core',
    'noty': '${staticAssets}/libs/notify/notify.min'
  }
});

crafterRequire(['guest'], function (guest) {
  guest.init({
    hostOrigin: '${hostOrigin}',
    studioContext: '${studioContext}',
    studioStaticAssets: 'static-assets'
  });
});
