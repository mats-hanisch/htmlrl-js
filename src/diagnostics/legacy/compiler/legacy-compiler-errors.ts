// NOTE: Those are legacy errors and will be replaced by a better error system in the future

import SourceLocation from "../../../shared/source-location.js";


// super class for more specfic errors
export class LegacyCompilationError extends Error {
    constructor(name: string, msg: string, srcLocation: SourceLocation) {
        super(`${srcLocation.filePath}:${srcLocation.line}:${srcLocation.column}\n\n${name}: ${msg}`);
        
        this.name = name;
    }
}

export class LegacyCompilationSyntaxError extends LegacyCompilationError {
    constructor(msg: string, srcLocation: SourceLocation) {
        super("SyntaxError", msg, srcLocation);
    }
}
