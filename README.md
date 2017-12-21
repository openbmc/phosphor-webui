# openbmc
UX Design repo for OpenBMC
=======
# OpenBMC
TODO: Write a project description

## Requirement
nodejs
npm

## Installation
`npm install`

## Running
`npm run-script server`

This will run it locally in `http://localhost:8080`.

## Example Usage with OpenBMC
1. Browse to `https://<bmc-ip>` and bypass the secure warning.
You will see a JSON response with `Login required` message.
2. In the same session, navigate to `http://localhost:8080`. Enter the BMC
IP, Username and Password (defaults: `root`/`0penBmc`).

Now you are logged in.
