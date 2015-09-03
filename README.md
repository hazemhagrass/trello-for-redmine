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

[tr]: https://trello.com/
[rm]: http://www.redmine.org/
[nj]: https://nodejs.org/en/
[re]: http://redis.io/