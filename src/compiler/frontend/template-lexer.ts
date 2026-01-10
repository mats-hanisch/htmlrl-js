import { LibContext } from "../../shared/lib-context.js";
import SourceLocation from "../../shared/source-location.js";
import { TemplateTokenType } from "../../shared/template-token-type.js";
import { TemplateToken } from "../../shared/template-token.js";

import LexingUtils from "./lexing-utils.js";

import { CompilationSyntaxError } from "../../diagnostics/legacy/compiler/legacy-compiler-errors.js";



export default class TemplateLexer {
    private readonly ctx: LibContext;
    private readonly utils: LexingUtils;
    private readonly srcGraphemes: string[];
    private pos: number;
    private srcLocation: SourceLocation;
    
    constructor(ctx: LibContext, utils: LexingUtils, filePath: string, src: string) {
        this.ctx = ctx;
        this.utils = utils;
        this.srcGraphemes = ctx.stringUtils.toGraphemes(src);
        this.pos = 0;
        this.srcLocation = new SourceLocation(filePath, 1, 1);
    }
    
    public tokenize(): TemplateToken[] {
        let tokens: TemplateToken[] = [];
        
        let htmlBegin: SourceLocation = this.srcLocation.copy();
        let html: string = "";
        
        while (this.pos < this.srcGraphemes.length) {
            let ch: string = this.peek()!;
            
            this.pos++;
            
            this.advanceSrcLocationFor(ch);
            
            if (ch === "@") {
                let next: string | undefined = this.peek();
                
                if (next === undefined || next === "@") {
                    this.pos++;
                    this.srcLocation = this.srcLocation.advanceColumn();
                    html += "@";
                    continue;
                }
                
                if (!this.utils.isIdentifierStart(next!)) {
                    throw new CompilationSyntaxError(`Invalid html escape sequence: Expected identifier after '@', got '${next}'.\n\nHint: To display a literal '@' in html, use '@@'.`, this.srcLocation.copy());
                }
                
                // finalize and push html token
                tokens.push({
                    type: TemplateTokenType.Html,
                    value: html,
                    srcLocation: htmlBegin
                });
                
                // extract and push next token
                tokens.push(this.extractEscapeSequenceToken());
                
                // reset html vars
                htmlBegin = this.srcLocation.copy();
                html = "";
                
                // continue with next char
                continue;
            }
            
            // append to html
            html += ch;
        }
        
        // push final html token
        if (html.length > 0) {
            tokens.push({
                type: TemplateTokenType.Html,
                value: html,
                srcLocation: htmlBegin
            });
        }

        return tokens;
    }
    
    private extractEscapeSequenceToken(): TemplateToken {
        // no other escape sequence yet, extract var (or statement)
        return this.extractVarOrStatement();
    }
    
    private extractVarOrStatement(): TemplateToken {
        // save src location
        const srcLocationSaved: SourceLocation = this.srcLocation.copy();
        
        // no statements yet, extract var
        const identifierStr: string = this.extractIdentifierString();
        
        return {
            type: TemplateTokenType.Var,
            value: identifierStr,
            srcLocation: srcLocationSaved
        };
    }
    
    private extractIdentifierString(): string {
        let identifierStr: string = "";
        
        while (this.pos < this.srcGraphemes.length) {
            let ch: string = this.peek()!;
            
            if (this.utils.isIdentifierPart(ch)) {
                // still part of identifier
                
                // append to str
                identifierStr += ch;
                
                // advance
                this.pos++;
                this.advanceSrcLocationFor(ch);
            }
            else {
                // not part of identifier anymore, finished extracting
                break;
            }
        }
        
        return identifierStr;
    }
    
    private peek(n = 0): string | undefined {
        return this.srcGraphemes[this.pos + n];
    }
    
    private advanceSrcLocationFor(ch: string): void {
        // handle unicode newline ("\r\n" is treated as a single grapheme)
        if (ch === "\n" || ch === "\r\n" || ch === "\r") {
            // newline
            
            // update src location
            this.srcLocation = this.srcLocation.newline();
        }
        else {
            // no newline, simply advance the column
            this.srcLocation = this.srcLocation.advanceColumn();
        }
    }
}
