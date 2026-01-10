import { Bytecode, Instruction, OpCode } from "../../shared/bytecode.js";
import { TemplateTokenType } from "../../shared/template-token-type.js";
import { TemplateToken } from "../../shared/template-token.js";


export default class BytecodeGenerator {
    private readonly targetFilePath: string;
    private readonly templateTokens: TemplateToken[];
    
    constructor(targetFilePath: string, templateTokens: TemplateToken[]) {
        this.targetFilePath = targetFilePath;
        this.templateTokens = templateTokens;
    }
    
    public generateBytecode(): Bytecode {
        let instructions: Instruction[] = [];
        
        for (const templateToken of this.templateTokens) {
            switch (templateToken.type) {
                case TemplateTokenType.Html:
                    instructions.push({
                        op: OpCode.APPEND_STATIC_HTML,
                        html: templateToken.value
                    });
                    break;
                case TemplateTokenType.Var:
                    instructions.push({
                        op: OpCode.APPEND_VAR,
                        varName: templateToken.value
                    });
                    break
                default:
                    break;
            }
        }
        
        return {
            targetFilePath: this.targetFilePath,
            instructions: instructions
        };
    }
}
