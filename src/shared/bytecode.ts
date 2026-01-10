
export enum OpCode {
    APPEND_STATIC_HTML,
    APPEND_VAR
}


export type Instruction = 
    | { op: OpCode.APPEND_STATIC_HTML, html: string }
    | { op: OpCode.APPEND_VAR, varName: string }
;


export type Bytecode = Readonly<{
    targetFilePath: string;
    instructions: Instruction[];
}>;
