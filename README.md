Trello For Redmine
=========

Trello For Redmine is a service to use [Trello][tr] interface in the frontend supported by [Redmine][rm] in the backend.

Trello For Redmine is currently in **Development Mode**.

## Getting Started:

[Node.js][nj], [Redmine][rm] , and [Redis][re] should be installed.

1. Change `config.json.example` file

        {
            "host": YOUR_REDMINE_HOST_HERE
        }

2. Rename `config.json.example` to `config.json`.

3. Run `./install.sh`.

4. Run redis on the default port.

5. To start the application: `./start.sh`.

## Notes:

1. **Uglifier and Watcher check for the first child directory only in `stylesheets` directory and the second child directory `public/js`**
  * To track for CSS second child directory: add `public/assets/stylesheets/*/*.css` in `watch-css` and `uglify-css` tasks.
  * To track for JS third child directory: add `public/js/*.js public/js/*/*/*.js` to `watch-js` task and add `./*/*/*.js` to `uglify-js` task.

2. npm scripts:
  * `npm start`: runs forever on port 3000, use `PORT=PORT_NUMBER npm start` to change the default port.
  * `npm run watch`: runs `watch-js` and `watch-css`.
    * `npm run watch-js`: watches `/public/js/*` and `/public/js/*/*.js` then runs `npm run uglify-js` upon file change.
    * `npm run watch-css`: watches `public/assets/stylesheets/*.css` then runs `npm run uglify-css` upon file change.
  * `npm run uglify`: uglifies JS and css files once used.

3. To add a new JS library:
  * Use `bower install lib_name`
  * Add its path relative to the `/public/js/` folder in `uglify-js` task
  * Run `npm run uglify-js`

4. To add a new CSS library:
  * Add its path relative to the root folder in `uglify-css` task
  * Run `npm run uglify-css`

[tr]: https://trello.com/
[rm]: http://www.redmine.org/
[nj]: https://nodejs.org/en/
[re]: http://redis.io/