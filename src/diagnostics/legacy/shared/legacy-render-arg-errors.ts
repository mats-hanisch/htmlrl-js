// NOTE: Those are legacy errors and will be replaced by a better error system in the future


export class InvalidRenderArgsPassedError extends Error {
    constructor(renderArgs: unknown, templateFilePath: string) {
        super(
            `Invalid arguments passed to 'renderAsync()' for template '${templateFilePath}': ${JSON.stringify(renderArgs, null, 2)}\n\n` + 
            "Expected a plain object in the format '{ [key: string]: any }'. Each key represents a variable name and maps to the corresponding runtime value.\n\n" + 
            "Note: Only the following datatypes are allowed for values: null, boolean, number, string, array, or object."
        );
        
        this.name = "InvalidRenderArgsPassedError";
    }
}

export class MissingRenderArgError extends Error {
    constructor(missingArg: string, templateFilePath: string) {
        super(`Missing required arg '${missingArg}' to render template '${templateFilePath}'.`);
        
        this.name = "MissingRenderArgError";
    }
}

export class InvalidRenderArgError extends Error {
    constructor(msg: string, argName: unknown, templateFilePath: string) {
        super(`Found invalid argument passed to 'renderAsync()' for template '${templateFilePath}': ${JSON.stringify(argName, null, 2)}\n\n` + msg);
        
        this.name = "InvalidRenderArgError";
    }
}

export class InvalidRenderArgTypeError extends InvalidRenderArgError {
    constructor(argName: unknown, templateFilePath: string) {
        super(
            `Invalid argument type: Expected a string, got '${typeof argName}'. Each key represents a variable name and maps to the corresponding runtime value.`,
            argName,
            templateFilePath
        );
        
        this.name = "InvalidRenderArgTypeError";
    }
}

export class InvalidRenderArgValueError extends InvalidRenderArgError {
    constructor(argName: string, value: unknown, templateFilePath: string, note?: string) {
        super(
            `Value is of an invalid type '${typeof value}'. Value must be one of the following valid datatypes: null, boolean, number, string, array, or object.${note !== undefined ? `\n\nNote: ${note}` : ""}`,
            argName,
            templateFilePath
        );
    }
}

export class UninspectableRenderArgError extends Error {
    constructor(argName: string, templateFilePath: string) {
        super(
            `Invalid argument '${argName}' passed to 'renderAsync()' for template '${templateFilePath}'.\n\n` +
            `The property could not be safely inspected. This may be caused by:\n` +
            `- a Proxy with invalid behavior\n` +
            `- mutation during render()\n` +
            `- non-standard object semantics\n\n` +
            `Only plain, stable object properties are supported.`
        );

        this.name = "UninspectableRenderArgError";
    }
}

export class InvalidRenderArgsCyclicReferenceError extends Error {
    constructor(templateFilePath: string) {
        super(`A cyclic reference was detected while processing arguments passed to 'renderAsync()' for template ${templateFilePath}`);
        
        this.name = "InvalidRenderArgsCyclicError";
    }
}
