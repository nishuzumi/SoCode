// fork from old version hardhat solidity compiler
import { getOpcodeKey, getOpcodeLength, getPushLength, isJump, isPush, Opcode } from "./opcodes";

export enum JumpType {
    NOT_JUMP,
    INTO_FUNCTION,
    OUTOF_FUNCTION,
    INTERNAL_JUMP,
}

export interface Location {
    offset: number;
    length: number;
    content?: string
}

export class Instruction {
    constructor(
        public readonly pc: number,
        public readonly opcode: Opcode,
        public readonly jumpType: JumpType,
        public readonly byteOffset: number,
        public readonly pushData?: Buffer,
        public readonly location?: Location
    ) { }

    toBytecode() {
        return this.opcode.toString(16).padStart(2, "0") + (this.pushData ? this.pushData.toString("hex") : "")
    }
}

export interface SourceMapLocation {
    offset: number;
    length: number;
    file: number;
}

export interface SourceMap {
    location: SourceMapLocation;
    jumpType: JumpType;
}

function jumpLetterToJumpType(letter: string): JumpType {
    if (letter === "i") {
        return JumpType.INTO_FUNCTION;
    }

    if (letter === "o") {
        return JumpType.OUTOF_FUNCTION;
    }
    return JumpType.NOT_JUMP;
}

function uncompressSourcemaps(compressedSourcemap: string): SourceMap[] {
    const mappings: SourceMap[] = [];

    const compressedMappings = compressedSourcemap.split(";");

    for (let i = 0; i < compressedMappings.length; i++) {
        const parts = compressedMappings[i].split(":");

        const hasParts0 = parts[0] !== undefined && parts[0] !== "";
        const hasParts1 = parts[1] !== undefined && parts[1] !== "";
        const hasParts2 = parts[2] !== undefined && parts[2] !== "";
        const hasParts3 = parts[2] !== undefined && parts[3] !== "";

        const hasEveryPart = hasParts0 && hasParts1 && hasParts2 && hasParts3;

        // See: https://github.com/nomiclabs/hardhat/issues/593
        if (i === 0 && !hasEveryPart) {
            mappings.push({
                jumpType: JumpType.NOT_JUMP,
                location: {
                    file: -1,
                    offset: 0,
                    length: 0,
                },
            });

            continue;
        }

        mappings.push({
            location: {
                offset: hasParts0 ? +parts[0] : mappings[i - 1].location.offset,
                length: hasParts1 ? +parts[1] : mappings[i - 1].location.length,
                file: hasParts2 ? +parts[2] : mappings[i - 1].location.file,
            },
            jumpType: hasParts3
                ? jumpLetterToJumpType(parts[3])
                : mappings[i - 1].jumpType,
        });
    }

    return mappings;
}

export function decodeInstructions(
    bytecode: Buffer,
    compressedSourcemaps: string,
    fileIdToSourceFile: Map<number, string>,
    isDeployment: boolean
): Instruction[] {
    const sourceMaps = uncompressSourcemaps(compressedSourcemaps);

    const instructions: Instruction[] = [];

    let bytesIndex = 0;

    // Solidity inlines some data after the contract, so we stop decoding
    // as soon as we have enough instructions as uncompressed mappings. This is
    // not very documented, but we manually tested that it works.
    while (instructions.length < sourceMaps.length) {
        const pc = bytesIndex;
        const opcode = bytecode[pc];
        const sourceMap = sourceMaps[instructions.length];
        let pushData: Buffer | undefined;
        let location: Location | undefined;

        const jumpType =
            isJump(opcode) && sourceMap.jumpType === JumpType.NOT_JUMP
                ? JumpType.INTERNAL_JUMP
                : sourceMap.jumpType;

        if (isPush(opcode)) {
            const length = getPushLength(opcode);
            pushData = bytecode.slice(bytesIndex + 1, bytesIndex + 1 + length);
        }

        if (sourceMap.location.file !== -1) {
            const file = fileIdToSourceFile.get(sourceMap.location.file);

            if (file !== undefined) {
                location = {
                    offset: sourceMap.location.offset,
                    length: sourceMap.location.length,
                    content: file.slice(sourceMap.location.offset, sourceMap.location.offset + sourceMap.location.length)
                };
            }
        }

        const instruction = new Instruction(
            pc,
            opcode,
            jumpType,
            bytesIndex,
            pushData,
            location
        );

        instructions.push(instruction);

        bytesIndex += getOpcodeLength(opcode);
    }

    // // See: https://github.com/ethereum/solidity/issues/9133
    // if (isDeployment) {
    //   addUnmappedInstructions(instructions, bytecode, bytesIndex);
    // }

    return instructions;
}