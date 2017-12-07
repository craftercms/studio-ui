#!/bin/bash
set -ev
if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
body='{
"request": {
"message": "StudioUI Build Request",
  "branch":"develop"
}}'
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Travis-API-Version: 3" \
  -H "Authorization: token $TRAVIS_ACCESS_TOKEN" \
  -d "$body" \
  https://api.travis-ci.org/repo/craftercms%2Fstudio/requests
fi
