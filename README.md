### CI-NPM-PUBLISH

You are a great developer. You write tests and run your builds through a CI and only publish to npm if all of your tests pass.

But there is a problem, your CI of choice (outside of Jenkins), doesn't support publishing to npm...

Now you can!

Install this package globally on your CI and when ready to deploy, run `npm-publish`.

This command can take args as well as env variables.

```bash

$ npm-publish --npmuser <username> --npmemail <email> --npmpassword <password>

```

Environment variables are NPMUSER, NPMEMAIL, and NPMPASSWORD.

Mix and match if you like!
