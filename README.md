# micro-app-ir-to-mqtt-bridge - ir  to mqtt bridge

Micro app that allows ir commands to be translated into
mqtt commands.  It leverages [lirc](lirc.org) to do
the decoding.

# Usage

# Installation

Either run npm install micro-app-ir-to-mqtt-bridge or clone this repository
and then run npm install.

# Running

To run the ir-to-mqtt app, add node.js to your path (currently requires 8.x or better) and
then run:

<PRE>
npm start
</PRE>

from the directory in which the micro-app-ir-to-mqtt-bridge was installed.

If you want to view the GUI. Point your browser at the host/port for the server
(or now use the micro-app-electron-launcher). 
If you have configured your browser to allow javascript to close the current page
the original window will be closed and one with the correct size of the
bridge GUI will be created.

Note that you don't need to connect or view the GUI, the bridge can simply run
in the background.


# Example
