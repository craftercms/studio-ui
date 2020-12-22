#!/bin/bash
set -ev
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
body='{
"request": {
"message": "Studio UI Build Triggers Studio Build",
  "branch":"develop"
}}'
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token ${env.CI_TOKEN}" \
  -d "$body" \
  https://api.travis-ci.com/repo/craftercms%2Fstudio/requests
fi
