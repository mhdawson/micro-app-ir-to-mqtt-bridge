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

# Usage

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
