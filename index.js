var Npm = require("npm"),
    Path = require("path"),
    Fs = require("fs"),
    Semver = require("semver"),
    RegClient = require("npm-registry-client"),
    _ = require("underscore"),
    client = new RegClient(),
    config = require(Path.join(process.cwd(), "package.json")),
    uri = "https://registry.npmjs.org/"
    user = process.env.NPMUSER,
    password = process.env.NPMPASSWORD,
    email = process.env.NPMEMAIL,
    auth = {},
    tarball = config.name + "-" + config.version + ".tgz",
    bodyPath = Path.join(process.cwd(), tarball);
    // <name>-<version>.tgz


// require tarball
if (!Fs.existsSync(bodyPath)) {
  console.log("no tarball! can't stream publish")
  return
}

var body = Fs.createReadStream(bodyPath, "base64");

// require user, password, and email
if (user && password && email) {
  auth = {
    auth: {
      username: user,
      password: password,
      email: email
    }
  }
} else {
  console.log("no auth variables set!")
  return
}


// create user and publish
var publish = function() {
  console.log("trying to publish to npm");
  // console.log(Npm.registry.adduser.toString())
  client.adduser(uri, auth, function(err, data, raw, res){
    if (err) {
      console.log(err);
      throw err
    }

    // authenticated or created, ready to publish
    if (data.ok) {
      publishParams = {
        access: "public",
        body: body,
        metadata: config
      }

      publishParams = _.extend(publishParams, auth);
      client.publish(uri, publishParams, function(err, response){
        if (err) {
          console.log(err);
          throw err
        }

        console.log(response.ok || "package published!")

      })
    }

  })

}


/*

  Get tags and compare versions

*/
var distTagsParams = {
  package: "normajs"
}

distTagsParams = _.extend(distTagsParams, auth)
client.distTags.fetch(uri, distTagsParams, function(err, tags){
  if (err) {
    console.log(err);
    throw err;
  }

  // set versions
  currentVersion = config.version;
  availableVersion = tags.latest;

  // see if this version is newer than npm
  if (Semver.gte(currentVersion, availableVersion)) {
    publish();
  } else {
    process.exit(0);
    return
  }


})
