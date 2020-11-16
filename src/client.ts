import * as net from "net";
import fs from "fs";
import { ConfigItem, ClientConfig, DatabaseConfig } from "./types";
import { processCmd, mqttInit } from "./processCmd";
import { sendCmdBuilder } from "./sendCmd";
require("dotenv").config();


export const config: ClientConfig = loadConfig("./config/client.json");
export const ChannelDefinition: any = loadConfig("./config/config.json");

var client = new net.Socket();
client.connect(config.rct);

mqttInit(config);

//sql.migrate();

client.on("connect", function () {
  var address = client.address() as net.AddressInfo;
  console.log(`Connected to Host ${address.address}:${address.port}`);

  let requestItems:string[]=[];
  for(let id of Object.keys(ChannelDefinition)) {
        const item: ConfigItem = ChannelDefinition[id];
        if (item.request) {
            console.log("Requesting ",item);
            requestItems.push(id);
        }
  };

  let requestItemPointer=0;
  const poll=()=>{
     //console.log("Requesting for ",requestItemPointer); //,requestItems[requestItemPointer]);

      while(ChannelDefinition[requestItems[requestItemPointer]].requestRatio>0 && ChannelDefinition[requestItems[requestItemPointer]].requestRatioCounter>0) // In case we need to skip a few rounds here...
      {
          ChannelDefinition[requestItems[requestItemPointer]].requestRatioCounter--;
          //console.log("Skipping ",ChannelDefinition[requestItems[requestItemPointer]]);
          requestItemPointer++;
          if (requestItemPointer>=requestItems.length)
              requestItemPointer=0;
      }
      client.write(
              Uint8Array.from(Buffer.from(sendCmdBuilder(requestItems[requestItemPointer]), "hex"))
      );

      if (ChannelDefinition[requestItems[requestItemPointer]].requestRatio>0)
        ChannelDefinition[requestItems[requestItemPointer]].requestRatioCounter=ChannelDefinition[requestItems[requestItemPointer]].requestRatio;


      requestItemPointer++;
      if (requestItemPointer>=requestItems.length)
          requestItemPointer=0;

      setTimeout(poll,100);
    };
    poll();
});

client.on("close", function () {
    console.warn("Reconnecting to RCT")
  client.connect(config.rct);
});

client.on("data", function (response) {
  let data = Uint8Array.from(response);

  let indexArray: number[] = [];
  data.forEach((e: number, index: number, array: Uint8Array) => {
    if (e == 43) {
      indexArray.push(index);
    }
  });

  indexArray.map((e: number, index: number) => {
    //Plain cmd without 0x2b
    processCmd(
      data.slice(
        e,
        indexArray[index + 1] ? indexArray[index + 1] : data.length
      ),
    ChannelDefinition
    );
  });
});

function loadConfig(configPath: string) {
  const data = fs.readFileSync(configPath);
  return JSON.parse(data.toString());
}
