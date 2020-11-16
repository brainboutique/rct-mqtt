# Summary
RCT Power Storage (solar inverter, potentially with add-on battery) uses a bespoke and difficult-to-use protocol to 
obtain status readings via Serial-over-TCP connection.

RCT protocol limitations:
- No security on appliance side - personally it is strongly advised AGAINST following RCT's instructions to expose inverter to 
internet by adding a port fortward on :8899 - see chapter 7.1.7.1 in RCT manual.
- Works only with RCT App
- Difficult to integrate with any home automation solution

## Solution
This RCT MQTT wrapper polls various RCT readings (loads, voltages etc.) and publishes them to a MQTT endpoint. From 
here the data can be easily consumed in home automation solutions (like FHEM, ioBroker, ...), presented in standard
dashboards typically offered by the home automation suite.

# Configuration
Update config/config.json to add RCT host name/IP and MQTT broker information.
(Limitation: Authentication not yet supported.)

All supported values are accessible in config/channels.json

Every channel is identified by the RCT defined (undocumented) hex value of the reading.
Example:

```
"959930BF": {
    "description": "Battery State of Charge (SoC)",
    "mqttTopic":"batterySOC",
    "uom":"%",
    "request": true,
    "requestRatio": 2,
    "round": true,
    "precision": 1,
    "floatOptions": "*100",
    "dbFloat": true
  },
```  

- mqttTopic: ID of topic. Post-fixed with the defined rootTopic prefix as defined in client.json
- request: Enable polling
- requestRatio: Only poll every n'th run; i.e. if requestRatio=3, only every 3rd polling round will include this reading.
- precision / floatOptions / round / precision: How to interpret the raw value
- uom: Unit of measure as exposed in MQTT JSON payload

# Getting Started
```
npm install
npm start
```

# Features
- Same-value readings are suppressed automatically. To not require the topic to use "retained", every 20th reading is 
force-published
- Any reading exposed as JSON, containing value and uom:
```
rct/powerDCB
        {"value":324,"uom":"W"}
``` 

# Advanced topics
- Wrapper is polling all values subsequently to give the appliance some time to "breath". Between two value polls, 100ms
wait time is added. Based on personal experience, this seems to be the best compromise between data actuality and reliability.
