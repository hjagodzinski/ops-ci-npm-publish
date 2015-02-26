#!/usr/bin/env node
"use strict";

var Npm = require("npm"),
    Path = require("path"),
    Fs = require("fs"),
    Semver = require("semver"),
    RegClient = require("npm-registry-client"),
    _ = require("underscore"),
    Exec = require('child_process').exec,
    Flags = require("minimist")( process.argv.slice(2) ),
    client = new RegClient(),

    // local vars
    uri = "https://registry.npmjs.org/",
    user = Flags.npmuser || Flags.NPMUSER || process.env.NPMUSER,
    password = Flags.npmpassword || Flags.NPMPASSWORD || process.env.NPMPASSWORD,
    email = Flags.npmemail || Flags.NPMEMAIL || process.env.NPMEMAIL,
    config = Flags.config || process.cwd(),
    opts = {
      auth: {
        username: user,
        password: password,
        email: email
      }
    },
    configJSON = require(Path.join(config, "package.json")),
    tarball = configJSON.name + "-" + configJSON.version + ".tgz",
    bodyPath = Path.join(config, tarball);


// create user and publish
var publish = function() {
  console.log("trying to publish to npm");
  // console.log(Npm.registry.adduser.toString())
  client.adduser(uri, opts, function(err, data, raw, res){
    if (err) {
      console.log(err);
      throw err
    }
    var body = Fs.createReadStream(bodyPath, "base64");
    // authenticated or created, ready to publish
    if (data.ok) {
      publishParams = {
        access: "public",
        body: body,
        metadata: configJSON
      }

      var publishParams = _.extend(publishParams, opts);
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

var pkgeUp = function(){
  var body = Fs.createReadStream(bodyPath, "base64");

  // require user, password, and email
  if (!user || !password || !email) {
    console.log("no auth variables set!")
    return
  }

  /*

    Get tags and compare versions

  */
  var distTagsParams = {
    package: configJSON.name
  }

  distTagsParams = _.extend(distTagsParams, opts)
  client.distTags.fetch(uri, distTagsParams, function(err, tags){
    if (err) {
      console.log(err);
      throw err;
    }

    // set versions
    var currentVersion = configJSON.version,
        availableVersion = tags.latest;

    // see if this version is newer than npm
    if (Semver.gte(currentVersion, availableVersion)) {
      publish();
    } else {
      process.exit(0);
      return
    }


  })
}



// require tarball
if (!Fs.existsSync(bodyPath)) {
  // console.log("no tarball! can't stream publish")
  Exec("npm pack", {cwd: config}, function(err, stdout, stderr){

    if (err) {
      console.log(err, stderr);
      throw err
    }

    pkgeUp()
  })
} else {
  pkgeUp()
}
