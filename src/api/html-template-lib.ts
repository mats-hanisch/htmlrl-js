import path from "path";

import Meta from "../meta.js";

import assert, { AssertionFailedError } from "../diagnostics/internal/assert.js";

import CharTraits from "../utils/char-traits.js";
import FileSystemUtils from "../utils/fs-utils.js";
import StringUtils from "../utils/string-utils.js";

import { LibContext } from "../shared/lib-context.js";
import { TemplateToken } from "../shared/template-token.js";
import RenderArgs from "../shared/render-args.js";
import { Bytecode } from "../shared/bytecode.js";
import { RntmVars } from "../shared/rntm-types.js";
import RntmValueConverter from "../shared/rtnm-value-converter.js";

import LexingUtils from "../compiler/frontend/lexing-utils.js";
import TemplateLexer from "../compiler/frontend/template-lexer.js";
import BytecodeGenerator from "../compiler/backend/bytecode-generator.js";

import BytecodeInterpreter from "../runtime/bytecode-interpreter.js";


interface HtmlTemplateLibOptions {
    readonly rootDir: string;
}


class MissingOptionError extends Error {
    constructor(optionKey: string) {
        super(`Missing required option '${optionKey}'.`);
        
        this.name = "MissingOptionError";
    }
}

class BadOptionError extends Error {
    constructor(optionKey: string, value: any, msg: string) {
        super(`Invalid value for option '${optionKey}': '${value}'\n\n${msg}`);
        
        this.name = "BadOptionError";
    }
}



class LibInitializationError extends Error {
    constructor(originalError: Error) {
        super(`Error occured while initializing '${Meta.LIB_NAME}': \n\n${JSON.stringify(originalError, null, 2)}`);
    }
}


export default class HtmlTemplateLib {
    private readonly ctx: LibContext;
    private readonly lexingUtils: LexingUtils;
    private bcCache: Map<string, Bytecode>; // relative file path -> bc
    
    constructor(options: HtmlTemplateLibOptions) {
        // validate options
        
        // rootDir
        if (typeof options.rootDir === "undefined") {
            throw new MissingOptionError("rootDir");
        }
        if (typeof options.rootDir !== "string") {
            throw new BadOptionError("rootDir", options.rootDir, `Expected a string, got '${typeof options.rootDir}'.`);
        }
        if (!path.isAbsolute(options.rootDir)) {
            throw new BadOptionError("rootDir", options.rootDir, "'rootDir' must be an absolute path!");
        }
        
        // init
        try {
            this.ctx = HtmlTemplateLib.createContext(options);
            this.lexingUtils = new LexingUtils(this.ctx);
            this.bcCache = new Map();
        }
        catch(error) {
            if (error instanceof AssertionFailedError) {
                // pass to user directly
                throw error;
            }
            else if (error instanceof Error) {
                // throw init error
                throw new LibInitializationError(error);
            }
            
            // invalid error - should never happen
            assert(false, `An unexpected error occured while initializing '${Meta.LIB_NAME}':\n\n ${JSON.stringify(error, null, 2)}`);
        }
    }
    
    public async compileAsync(filePath: string): Promise<void> {
        try {
            // check if bytecode already exists in cache
            if (this.bcCache.has(filePath)) {
                // bytecode exists - no compilation needed
                return;
            }
            
            // create lexer
            const templateLexer: TemplateLexer = new TemplateLexer(this.ctx, this.lexingUtils, filePath, await this.ctx.fsUtils.getFileContentAsync(filePath));
            
            // tokenize template
            const tokens: TemplateToken[] = templateLexer.tokenize();
            
            // create bytecode generator
            const bcGenerator: BytecodeGenerator = new BytecodeGenerator(filePath, tokens);
            
            // generate bytecode
            const bc: Bytecode = bcGenerator.generateBytecode();
            
            // store bytecode in cache
            this.bcCache.set(filePath, bc);
        }
        catch(error) {
            // pass to user
            throw error;
        }
    }
    
    public async renderAsync(filePath: string, args: RenderArgs): Promise<string> {
        try {
            // try to get bytecode from cache
            let cachedBc: Bytecode | undefined = this.bcCache.get(filePath);
            
            if (cachedBc === undefined) {
                // no bytecode in cache
                
                // compile template file
                await this.compileAsync(filePath);
                
                // update bytecode
                cachedBc = this.bcCache.get(filePath);
            }
            
            // validate and convert args to runtime vars
            const rntmVars: RntmVars = RntmValueConverter.validateAndConvertToRtnmVars(args, filePath);
            
            // create interpreter
            const interpreter: BytecodeInterpreter = new BytecodeInterpreter(cachedBc!, rntmVars);
            
            // run interpreter and return generated string
            return interpreter.run();
        }
        catch (error: unknown) {
            // pass to user
            throw error;
        }
    }
    
    private static createContext(validatedOptions: HtmlTemplateLibOptions): LibContext {
        const stringUtils: StringUtils = new StringUtils();
        const fsUtils: FileSystemUtils = new FileSystemUtils(validatedOptions.rootDir);
        const charTraits: CharTraits = new CharTraits(stringUtils);
        
        return {
            stringUtils: stringUtils,
            fsUtils: fsUtils,
            charTraits: charTraits
        }
    }
}
