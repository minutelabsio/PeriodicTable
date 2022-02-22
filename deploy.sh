#!/usr/bin/env sh

REPO="PeriodicTable.git"

# abort on errors
set -e

# build
# yarn run build

# navigate into the build output directory
cd app

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:minutelabsio/$REPO master:gh-pages

cd -

