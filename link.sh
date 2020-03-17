#!/usr/bin/env bash

DEFAULT_SITE=/Users/hungtsou/Documents/craftersoftware/craftercms/crafter-authoring/bin/apache-tomcat/webapps/studio/default-site
STATIC_ASSETS=${DEFAULT_SITE}/static-assets
TEMPLATES=${DEFAULT_SITE}/templates
BACKUP=${DEFAULT_SITE}/backup

SRC=/Users/hungtsou/Documents/craftersoftware/studio-ui

rm -rf ${STATIC_ASSETS}/modules
rm -rf ${STATIC_ASSETS}/components
rm -rf ${STATIC_ASSETS}/next
rm -rf ${STATIC_ASSETS}/scripts
rm -rf ${STATIC_ASSETS}/styles
rm -rf ${TEMPLATES}
rm -rf ${STATIC_ASSETS}/themes
rm -rf ${STATIC_ASSETS}/ng-views
rm -rf ${STATIC_ASSETS}/libs
rm -rf ${STATIC_ASSETS}/images
rm -rf ${DEFAULT_SITE}/site
rm -rf ${STATIC_ASSETS}/yui

ln -s ${SRC}/static-assets/modules ${STATIC_ASSETS}/
ln -s ${SRC}/static-assets/components ${STATIC_ASSETS}/
ln -s ${SRC}/static-assets/next ${STATIC_ASSETS}/
ln -s ${SRC}/static-assets/scripts ${STATIC_ASSETS}/
ln -s ${SRC}/static-assets/styles ${STATIC_ASSETS}/
ln -s ${SRC}/templates ${DEFAULT_SITE}
ln -s ${SRC}/static-assets/themes ${STATIC_ASSETS}/themes
ln -s ${SRC}/static-assets/ng-views ${STATIC_ASSETS}/ng-views
ln -s ${SRC}/static-assets/libs ${STATIC_ASSETS}/libs
ln -s ${SRC}/static-assets/images ${STATIC_ASSETS}/images
ln -s ${SRC}/site ${DEFAULT_SITE}/site
ln -s ${SRC}/static-assets/yui ${STATIC_ASSETS}/yui
