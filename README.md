# micro-app-ir-to-mqtt-bridge - ir  to mqtt bridge

Micro app that allows ir commands to be translated into
mqtt commands. It is configured to receive raw IR codes
through mqtt and leverages [lirc](http://lirc.org) to do
the decoding.

Raw IR codes can be received and published
to mqtt for use by the ir-to-mqtt-bridge with
[MqttIRReceiver](https://github.com/mhdawson/arduino-esp8266/tree/master/MqttIRReceiver)

The bridge works by 

* Receiving raw IR codes on an mqtt topic
* Formating the raw IR codes in the correct format and sending them
  to the lirc daemon through UDP messages.
* Receiving the decoded remote and key from lirc on a unix
  domain socket
* Mapping the remote/key value to an mqtt topic/message using the
  table in the configuration file and publishing on that topic.

# Configuration

The configuration file (lib/config.json) has the following entries:

* serverPort - the port on which the micro app will listen
* MaxRecentActivity - the maximum history to retain/display when
  a new client connects to the GUI.
* topic - the topic on which the bridge listens for raw IR data
  messages.
* mqttServerUrl - url for the mqtt server.  If it is of type
  mqtts, then certificates must be provided through the certs
  element
* certs - (optional)( directory which must contain a `ca.cert`, `client.cert`
  and `client.key` file that will be used to connect to the mqtt
  server if the connetion uses `mqtts`.
* lirc - object with port and host fields.  These must specify the port
  and host address on which the lirc daemon is listening for UDP
  messages.
* keymap - Object with the mapping between the remote/key combinations
  and mqtt topic/messages that will be posted.
  Each remote is an element in the keymap element.  The value for the
  remote element is an element which has an element for each of the keys
  supported for the remote.  Each key element has a `topic` and `message`
  elements which define the topic/message that will be published when
  a remote/key combination is received.

A sample configuration file is as follows:

```json
{
  "serverPort": 3000,
  "MaxRecentActivity": 100,
  "topic": "house/ir1",
  "mqttServerUrl": "tcp://10.1.1.186:1883",
  "lirc": { "port": 8766, "host": "0.0.0.0" },
  "keymap": { "rca1": { "one": { "topic": "house/rca1", "message": "one" },
                        "two": { "topic": "house/rca1", "message": "two" }
                      },
            { "hisense": { "KEY_1": { "topic": "house/hisense", "message": "one" },
                           "KEY_2": { "topic": "house/hisense", "message": "two" }
                      }
            }
}

```

In addition, the configuration file also supports all of the standard
micro-app-framework configuration values.  See
[micro-app-framework](https://github.com/mhdawson/micro-app-framework). 

# Installation

Either run npm install micro-app-ir-to-mqtt-bridge or clone this repository
and then run npm install.

lirc must be installed.  For example on ubuntu `apt-get install lirc`.

The lirc daemon must be started with the UDP driver as follows:

```
lircd --driver=udp --device=8766 /etc/lirc/lircd.conf

```

The value after `--device` is the port on which the lirc daemon listens
for messages.  If you change this you must update the corresponding
entry in the config.json configuration file for the bridge.  The bridge
also assumes that lircd will publish decoded key messages on the default
unix domain socket `/var/run/lirc/lircd`.  If you change this value update
the corresponding entry in the config.json configuration file.

The configuration file for the lirc daemon (/etc/lirc/lircd.conf by default
on ubuntu) needs to be configured for the remotes that you will be
receiving command from.  Please consult the lirc documentation for
how to configure remotes.  **Note:** 
[MqttIRReceiver](https://github.com/mhdawson/arduino-esp8266/tree/master/MqttIRReceiver)
can also be used with the other lirc utilities like `irrecord` in order
to learn keys for remotes for which an existing configuration file
does not exist. For example by using:

```
irrecord --driver=udp --device=8766
```

# Running

To run the ir-to-mqtt app, add node.js to your path
(currently requires 8.x or better) and then run:

<PRE>
npm start
</PRE>

from the directory in which the micro-app-ir-to-mqtt-bridge was installed.

If you want to view the GUI. Point your browser at the host/port for the server
(or now use the micro-app-electron-launcher). 
If you have configured your browser to allow javascript to close the current
page the original window will be closed and one with the correct size of the
bridge GUI will be created.

Note that you don't need to connect or view the GUI, the bridge can simply run
in the background.

The GUI shows the remote/key values received from the lirc damon and the
corresponding topic/message that it publishes in response to these values.


# Example Configuration File
