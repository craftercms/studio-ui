#!/usr/bin/env bash

promptForCrafterHome() {
  echo ""
  echo "A settings_local.sh with your CRAFTER_HOME is required. Let's create one 😎"
  echo "What's your craftercms build home? (the directory that container crafter-authoring, crafter-delivery, etc)"
  read -r crafterHome
  if [[ ! -d "$crafterHome" ]]; then
    echo "Oops. That directory doesn't exist. Please check and re-run this script. Bye."
    echo ""
    exit 1
  fi
  if [[ ! -d "$crafterHome/crafter-authoring" ]]; then
    echo ""
    echo "Oops. That directory doesn't appear to be a Crafter CMS. Here's what's on '$crafterHome':"
    ls -1 "$crafterHome"
    echo "Please check and re-run this script. Bye."
    echo ""
    exit 1
  fi
  echo "CRAFTER_HOME=$crafterHome" > "$localSettingsFilePath"
  echo "Sweet. Settings file was created for you @ '$currentDir/settings_local.sh'."
  echo "Moving on..."
}

singleSlash="/"
doubleSlash="//"
localSettingsFilePath="./scripts/settings_local.sh"

readonly currentDir=$(
  cd "$(dirname "$0")" || exit 1
  pwd
)

cd "$currentDir/../" || exit 1

if [[ ! -f "$localSettingsFilePath" ]]; then
  promptForCrafterHome
fi

if [[ ! -f "$localSettingsFilePath" ]]; then
  echo "Can't find the settings_local.sh file. Something went wrong. 🤔"
  exit 1
fi

# shellcheck source=/dev/null
source $localSettingsFilePath
if [[ -z "${CRAFTER_HOME}" ]]; then
  promptForCrafterHome
fi

DEFAULT_SITE=$CRAFTER_HOME/crafter-authoring/bin/apache-tomcat/webapps/studio/default-site
DEFAULT_SITE="${DEFAULT_SITE/$doubleSlash/$singleSlash}"
STATIC_ASSETS=${DEFAULT_SITE}/static-assets
TEMPLATES=${DEFAULT_SITE}/templates

SRC=$(pwd)

LINK_ONLY=false
REMOVE_ONLY=false
for ARG in "$@"; do
  case "$ARG" in
  --link)
    LINK_ONLY=true
    ;;
  --remove)
    REMOVE_ONLY=true
    ;;
  *)
    echo "Unknown option $ARG."
    exit 1
    ;;
  esac
done

echo ""

if [[ $LINK_ONLY != true ]]; then
  echo "Removing directories"
  rm -rf "$STATIC_ASSETS/modules"
  rm -rf "$STATIC_ASSETS/components"
  rm -rf "$STATIC_ASSETS/next"
  rm -rf "$STATIC_ASSETS/scripts"
  rm -rf "$STATIC_ASSETS/styles"
  rm -rf "$TEMPLATES"
  rm -rf "$STATIC_ASSETS/themes"
  rm -rf "$STATIC_ASSETS/ng-views"
  rm -rf "$STATIC_ASSETS/libs"
  rm -rf "$STATIC_ASSETS/images"
  rm -rf "$DEFAULT_SITE/site"
  rm -rf "$STATIC_ASSETS/yui"
  rm -rf "$STATIC_ASSETS/js"
fi

if [[ $REMOVE_ONLY != true ]]; then
  echo "Linking directories"
  ln -s "$SRC/static-assets/modules" "$STATIC_ASSETS/"
  ln -s "$SRC/static-assets/components" "$STATIC_ASSETS/"
  ln -s "$SRC/static-assets/next" "$STATIC_ASSETS/"
  ln -s "$SRC/static-assets/scripts" "$STATIC_ASSETS/"
  ln -s "$SRC/static-assets/styles" "$STATIC_ASSETS/"
  ln -s "$SRC/templates" "$DEFAULT_SITE"
  ln -s "$SRC/static-assets/themes" "$STATIC_ASSETS/themes"
  ln -s "$SRC/static-assets/ng-views" "$STATIC_ASSETS/ng-views"
  ln -s "$SRC/static-assets/libs" "$STATIC_ASSETS/libs"
  ln -s "$SRC/static-assets/images" "$STATIC_ASSETS/images"
  ln -s "$SRC/site" "$DEFAULT_SITE/site"
  ln -s "$SRC/static-assets/yui" "$STATIC_ASSETS/yui"
  ln -s "$SRC/static-assets/js" "$STATIC_ASSETS/js"
fi

cd "$currentDir" || exit 1

echo "Process completed. Arrivederci!"
echo ""
