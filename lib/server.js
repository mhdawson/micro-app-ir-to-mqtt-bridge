// Copyright 2015-2017 the project authors as listed in the AUTHORS file.
// All rights reserved. Use of this source code is governed by the
// license that can be found in the LICENSE file.
const dgram = require('dgram');
const dgramSocket = dgram.createSocket('udp4');
const fs = require('fs');
const mqtt = require('mqtt');
const net = require('net');
const socketio = require('socket.io');
const max16Int = Math.pow(2,15);

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 200;

var eventSocket = null;

const Server = function() {
}


Server.getDefaults = function() {
  return { 'title': 'ir to bridge' };
}

var replacements;
Server.getTemplateReplacments = function() {
  if (replacements === undefined) {
    let config = Server.config;

    replacements = [{ 'key': '<DASHBOARD_TITLE>', 'value': Server.config.title },
                    { 'key': '<UNIQUE_WINDOW_ID>', 'value': Server.config.title },
                    { 'key': '<PAGE_WIDTH>', 'value': PAGE_WIDTH },
                    { 'key': '<PAGE_HEIGHT>', 'value': PAGE_HEIGHT }];

  }
  return replacements;
}


const recentActivity = new Array()
const pushActivity = function(entry) {
  var newEntry = new Date() + ':' + entry;
  recentActivity.push(newEntry);
  console.log(newEntry);
  eventSocket.emit('recent_activity', newEntry);
  if (recentActivity.length > Server.config.MaxRecentActivity) {
    recentActivity.splice(0,1);
  }
}

Server.startServer = function(server) {
  eventSocket = socketio.listen(server);

  eventSocket.on('connection', function(client) {
    for (var i = 0; i < recentActivity.length; i++) {
      eventSocket.to(client.id).emit('recent_activity', recentActivity[i]);
    }
  });

  // setup mqtt
  var mqttOptions;
  if (Server.config.mqttServerUrl.indexOf('mqtts') > -1) {
    mqttOptions = { key: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.key')),
                    cert: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.cert')),
                    ca: fs.readFileSync(path.join(__dirname, 'mqttclient', '/ca.cert')),
                    checkServerIdentity: function() { return undefined }
    }
  }

  var mqttClient = mqtt.connect(Server.config.mqttServerUrl, mqttOptions);
  mqttClient.on('connect', function() {
    mqttClient.subscribe(Server.config.topic);
  });


  // lirc sends the decoded key on a unix domain socket which
  // is '/var/run/lirc/lircd' by default;
  let inputSocket;
  if (Server.config.lirc.domainSocket) {
    inputSocket = Server.config.lirc.domainSocket;
  } else {
    inputSocket = net.createConnection('/var/run/lirc/lircd');
  }
  inputSocket.on('data', (data) => {
    let messages = data.toString().split('\n');
    for (let i = 0; i < messages.length; i++) {
      if (messages[i] !== '') {  
        // now convert the key to the topic/message
        let parts = messages[i].split(' ');
        const remote = parts[3];
        const key = parts[2];
        let entry;
        try {
          entry = Server.config.keymap[remote][key]
        } catch(err) {};

        // publish the mqtt message
        if ((entry) && (entry.topic) && (entry.message)) {
          mqttClient.publish(entry.topic, entry.message); 
          pushActivity('remote: ' + remote +
                       ' key:' + key +
                       ' topic:' + entry.topic +
                       ' message:' + entry.message);
        } else {
          pushActivity('No or bad map entry for remote: ' + remote + ' key:' + key);
        }
      }
    }
  });


  // we receive the raw IR data through mqtt.  When a message
  // comes in, convert it to the required format and send
  // it to lirc over UDP
  mqttClient.on('message', function(topic, message) {
    const parts = message.toString().split(',');
    for (let i = 0; i < parts.length; i++) {
      let value = parseInt(parts[i], 16)/61;
      let buffer;
      if (value > max16Int) {
        buffer = Buffer.alloc(6);
        if (i%2 == 0) {
          buffer.writeInt16LE(0x8000, 0)
        } else {
          buffer.writeInt16LE(0, 0)
        }
        buffer.writeInt32LE(value, 2);
      } else {
        buffer = Buffer.alloc(2);
        if (i%2 == 0) {
          value = value | 0x8000; 
        }
        buffer.writeUInt16LE(value, 0);
      }
      dgramSocket.send(buffer, Server.config.lirc.port, Server.config.lirc.host);
    }
  });
}


if (require.main === module) {
  const path = require('path');
  const microAppFramework = require('micro-app-framework');
  microAppFramework(path.join(__dirname), Server);
}

module.exports = Server;
