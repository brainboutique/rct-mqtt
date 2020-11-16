import { calcRequestCRC } from "./processCmd";

export function sendCmdBuilder(AddresData: string) {
  const hexCmd = Uint8Array.from(Buffer.from(AddresData, "hex"));
  let hexlength = hexCmd.length;
  let cmd = new Uint8Array(6);
  cmd[0] = 1;
  cmd[1] = hexlength;

  hexCmd.forEach((a: any, index: number) => {
    cmd[2 + index] = hexCmd[index];
  });

  let crc = calcRequestCRC(cmd).toString(16);
  crc = crc.length == 3 ? "0" + crc : crc;
  let cmdHex = "2b" + Buffer.from(cmd).toString("hex") + crc;
  //console.log(crc.toString(16));
  return cmdHex;
}

//2B 01 04 4B C0 F9 74 03 88
//2b 01 04 4b c0 f9 74 03 88
//2b 01 04 4b c0 f9 74 90 4

//2b 01 04 c0 cc 81 b6
//2b 05 08 | c0 cc 81 b6  | 4a 6d f6 8b 11 2d |
//2b
//2b 05 08 | db 11 85 5b | 45 57 a9 71 cb dd
//2b 05 08 | b1 ef 67 ce | 4a 6d f6 92 ca ea
