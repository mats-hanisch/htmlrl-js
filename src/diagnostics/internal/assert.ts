export class AssertionFailedError extends Error {
    
    constructor(msg: string) {
        const outputMsg: string = `[Internal Error] Assertion failed: ${msg}`;
        
        super(outputMsg);
        
        this.name = "AssertionFailedError";
    }
}

export default function assert(expr: unknown, msg: string): asserts expr {
    if (!expr) {
        throw new AssertionFailedError(msg);
    }
}
