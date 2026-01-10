import assert from "../../diagnostics/internal/assert.js";

import { LibContext } from "../../shared/lib-context.js";


export default class LexingUtils {
    private readonly ctx: LibContext;
    
    constructor(ctx: LibContext) {
        this.ctx = ctx;
    }
    
    // identifier must start with a letter or _
    public isIdentifierStart(ch: string): boolean {
        assert(this.ctx.stringUtils.isSingleGrapheme(ch), `LexingUtils: The input string '${ch}' must be a single character (grapheme).`);
        
        return this.ctx.charTraits.isAlpha(ch) || ch === "_";
    }
    
    // identifier body can consis of letters, digits and _
    public isIdentifierPart(ch: string): boolean {
        assert(this.ctx.stringUtils.isSingleGrapheme(ch), `LexingUtils: The input string '${ch}' must be a single character (grapheme).`);
        
        return this.ctx.charTraits.isAlnum(ch) || ch === "_";
    }
}
