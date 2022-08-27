#build
yarn install
yarn build

# checkout gh-pages
git checkout gh-pages

# remove folders
rm -rf configs tests src

#remove files
rm -rf express.js LICENSE package.json README.md tsconfig.json yarn.lock

# move files from dist
mv dist/* .

# publish
git add .
git commit -m "Publish website"
git push origin HEAD
