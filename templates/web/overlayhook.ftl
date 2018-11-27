document.domain = '${cookieDomain}';

requirejs.config({
    baseUrl: '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/scripts',
    paths: {
        'libs': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/',
        'jquery': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/jquery/dist/jquery',
        'jquery-ui': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/jquery-ui/jquery-ui',
        'amplify': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/amplify/lib/amplify.core',
        'noty': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/notify/notify.min',
        'cache': '${envConfig.authoringServer!''}/${envConfig.studioContext!''}/static-assets/libs/js-cache/cache'
    }
});

require(['guest'], function (guest) {
    guest.init({
        hostOrigin: '${envConfig.authoringServer!''}',  // example: http://localhost:8080
        studioContext: '${envConfig.studioContext!''}', // example: studio
        studioStaticAssets: 'static-assets'
    });
});