#!/bin/bash
# a bit of a hacky to store resources under static/
set -e
shopt -s globstar
HOMEPAGE_PATH=$(jq -r '.homepage | sub("https://29a.ch/";"")' package.json)
DEST="x.29a.ch:/var/www/static/$HOMEPAGE_PATH"

find dist -iname *.map -delete
gzip -fk dist/**/*.{js,css,html,svg}

rsync -rv dist/static/ "${DEST}static/"
rsync -rv dist/ "$DEST"
