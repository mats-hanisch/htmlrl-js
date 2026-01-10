import HtmlUtils from "../utils/html-utils.js";

import { Bytecode, Instruction, OpCode } from "../shared/bytecode.js";
import { RntmValue, RntmVars } from "../shared/rntm-types.js";
import RntmValueConverter from "../shared/rtnm-value-converter.js";

import { LegacyMissingRenderArgError } from "../diagnostics/legacy/shared/legacy-render-arg-errors.js";


export default class BytecodeInterpreter {
    private readonly bc: Bytecode;
    private readonly rntmVars: RntmVars;
    
    constructor(bc: Bytecode, rntmVars: RntmVars) {
        this.bc = bc;
        this.rntmVars = rntmVars;
    }
    
    public run(): string {
        const instructions: Instruction[] = this.bc.instructions;
        const INSTRUCTIONS_LEN: number = instructions.length;
        
        let i: number = 0;
        let result: string = "";
        
        for (; i < INSTRUCTIONS_LEN; i++) {
            const inst: Instruction = instructions[i]!;
            
            switch (inst.op) {
                case OpCode.APPEND_STATIC_HTML:
                    result += inst.html; // inline because its really simple
                    break;
                case OpCode.APPEND_VAR:
                    result += this.appendVar(inst.varName);
                    break;
                default:
                    break;
            }
        }
            
        return result;
    }
    
    private appendVar(varName: string): string {
        // try to get value from var name
        const value: RntmValue | undefined = this.rntmVars[varName];
        
        if (value === undefined) {
            // missing var
            throw new LegacyMissingRenderArgError(varName, this.bc.targetFilePath);
        }
        
        // convert value and html-escape it
        return HtmlUtils.escapeHtml(RntmValueConverter.toHtmlString(value));
    }
}
