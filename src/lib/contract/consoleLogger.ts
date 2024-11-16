
import { Message } from '@ethereumjs/evm';
import {
    type Address, bytesToHex, bytesToNumber, decodeAbiParameters, type Hex,
    hexToBigInt, hexToString
} from "viem";
import {
    AddressTy,
    BoolTy,
    BytesTy,
    ConsoleLogs,
    Int256Ty,
    StringTy,
    Uint256Ty,
} from "./logger";

const CONSOLE_ADDRESS = "0x000000000000000000636f6e736f6c652e6c6f67"; // toHex("console.log")

export function parseConsoleLog(call: Message) {
    if (call.to?.toString() !== CONSOLE_ADDRESS) {
        return;
    }

    const sig = bytesToNumber(call.data.slice(0, 4));
    const parameters = call.data.slice(4);

    const types = ConsoleLogs[sig];
    if (types === undefined) {
        return;
    }

    return _decode(Buffer.from(parameters), types);
}

function _decode(data: Buffer, types: string[])  {
    return types.map((type, i) => {
        const position: number = i * 32;
        const slice = data.slice(position, position + 32);
        
        try {
            switch (type) {
                case Uint256Ty:
                case Int256Ty: {
                    const decoded = decodeAbiParameters(
                        [{ type: type === Uint256Ty ? 'uint256' : 'int256' }],
                        bytesToHex(slice)
                    )[0];
                    return decoded.toString();
                }

                case BoolTy: {
                    const decoded = decodeAbiParameters(
                        [{ type: 'bool' }],
                        bytesToHex(slice)
                    )[0];
                    return decoded.toString();
                }

                case StringTy: {
                    const start = Number(hexToBigInt(bytesToHex(slice)));
                    const lenSlice = data.slice(start, start + 32);
                    const len = Number(hexToBigInt(bytesToHex(lenSlice)));
                    const strSlice = data.slice(start + 32, start + 32 + len);
                    return hexToString(bytesToHex(strSlice));
                }

                case AddressTy: {
                    const decoded = decodeAbiParameters(
                        [{ type: 'address' }],
                        bytesToHex(slice)
                    )[0] as Address;
                    return decoded;
                }

                case BytesTy: {
                    const start = Number(hexToBigInt(bytesToHex(slice)));
                    const lenSlice = data.slice(start, start + 32);
                    const len = Number(hexToBigInt(bytesToHex(lenSlice)));
                    const bytesSlice = data.slice(start + 32, start + 32 + len);
                    return bytesToHex(bytesSlice);
                }

                default: {
                    // 处理 bytes1 到 bytes32
                    const match = type.match(/^bytes(\d+)$/i);
                    if (match) {
                        const size = parseInt(match[1]);
                        if (size >= 1 && size <= 32) {
                            const decoded = decodeAbiParameters(
                                [{ type: `bytes${size}` }],
                                bytesToHex(slice)
                            )[0] as Hex;
                            return decoded;
                        }
                    }
                    throw new Error(`Unsupported type: ${type}`);
                }
            }
        } catch (error) {
            throw new Error(`Failed to decode ${type} at position ${position}: ${error.message}`);
        }
    });
}