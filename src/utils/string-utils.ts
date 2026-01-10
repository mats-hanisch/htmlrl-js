import assert from "../diagnostics/internal/assert.js";


export default class StringUtils {
    private readonly graphemeSegmenter: Intl.Segmenter;
    
    constructor() {
        // assert existance of Intl.Segmenter
        assert(typeof Intl !== "undefined" && "Segmenter" in Intl, 
            "'Intl.Segmenter' is required but not available in this environment. " +
            "Unicode grapheme segmentation cannot be performed.");
        
        // init segmenter
        this.graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    }
    
    public toGraphemes(input: string): string[] {
        const result: string[] = [];
        
        for (const seg of this.graphemeSegmenter.segment(input)) {
            result.push(seg.segment);
        }
        
        return result;
    }
    
    public isSingleGrapheme(str: string): boolean {
        const graphemes = this.toGraphemes(str);
        return graphemes.length === 1;
    }
}
