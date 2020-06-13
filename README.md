## socket-io-game ##
A proof-of-concept multiplayer server/client built with Typescript using socket.io and phaser. 

![screenshot](screenshot.png)

To get started: `npm install`.
To run in development mode: `npm run dev`
To run normally: `npm run build && npm start`

Hosted on AWS Elastic Beanstalk using EC2 and an nginx load balancer. 
[Play now](http://samplegame-env.eba-x3p2ipvd.us-east-2.elasticbeanstalk.com/)

In the pipeline:
- Better transcoding (protobuf?)
- Authoritative server (for preventing cheating)
- Entity Interpolation
- Client Prediction/Server Reconciliation