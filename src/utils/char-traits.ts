import assert from "../diagnostics/internal/assert.js";

import StringUtils from "./string-utils.js";


export default class CharTraits {
    private readonly stringUtils: StringUtils;
    
    constructor(stringUtils: StringUtils) {
        this.stringUtils = stringUtils;
    }
    
    public isWhitespace(ch: string): boolean {
        assert(this.stringUtils.isSingleGrapheme(ch), `CharTraits: The input string '${ch}' must be a single character (grapheme).`);
        return /\p{White_Space}/u.test(ch);
    }
    
    public isAlpha(ch: string): boolean {
        assert(this.stringUtils.isSingleGrapheme(ch), `CharTraits: The input string '${ch}' must be a single character (grapheme).`);
        // L = letter
        return /\p{L}/u.test(ch);
    }
    
    public isDigit(ch: string): boolean {
        assert(this.stringUtils.isSingleGrapheme(ch), `CharTraits: The input string '${ch}' must be a single character (grapheme).`);
        // Nd = decimal number
        return /\p{Nd}/u.test(ch);
    }
    
    public isAlnum(ch: string): boolean {
        assert(this.stringUtils.isSingleGrapheme(ch), `CharTraits: The input string '${ch}' must be a single character (grapheme).`);
        return this.isAlpha(ch) || this.isDigit(ch);
    }
}
