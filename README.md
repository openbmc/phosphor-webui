# OpenBMC Web User Interface
The OpenBMC WebUI is a Web-based user interface for the OpenBMC
firmware stack. The WebUI uses AngularJS. Features include:
*	View system overview data such as model information and serial number
*	View and manage event logs
*	View inventory data
* View sensor data
*	Power On/Off server operations
*	Reboot BMC
*	Manage and update BMC and Host firmware
*	IPv4 network settings
*	SoL console

## Requirements
nodejs
npm

## Installation
`npm install`

## Running locally
`npm run-script server`

This will start a server instance and begin listening for connections at
`http://localhost:8080`. This development server provides live reloading on
code changes.
NOTE: Browsing to https://<BMC IP> and accepting the self-signed certificate
might be required to prevent your browser from blocking traffic to the BMC.

## Logging in
Enter the BMC Host or BMC IP address, username, and password.
The default username and password are `root`/`0penBmc`.
