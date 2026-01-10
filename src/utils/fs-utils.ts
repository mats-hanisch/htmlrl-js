import path from "node:path";
import { promises as fs } from 'node:fs'


class FileSystemError extends Error {
    public readonly filePath: string;
    public readonly originalError: Error | undefined;
    public readonly originalErrorCode: string | undefined;
    
    constructor(msg: string, filePath: string, originalError?: Error) {
        super(msg);
        
        this.name = "FileSystemError";
        this.filePath = filePath;
        this.originalError = originalError;
        this.originalErrorCode = typeof (originalError as any)?.code === "string" ? (originalError as any).code : undefined;
    }
}


export default class FileSystemUtils {
    private readonly rootDir: string; // absolute paths
    private readonly fileContentCache: Map<string, string>; // file path -> file content
    
    constructor(rootDir: string) {
        this.rootDir = rootDir;
        this.fileContentCache = new Map();
    }
    
    public async getFileContentAsync(filePath: string): Promise<string> {
        // create absolute path
        filePath = path.resolve(this.rootDir, filePath);
        
        // make sure file is inside sandbox
        if (
            filePath !== this.rootDir &&
            !filePath.startsWith(this.rootDir + path.sep)
        ) {
            throw new FileSystemError(`Access denied: File '${filePath}' is outside the configured root directory. The sandboxing security policy forbids this.`, filePath);
        }
        
        // check if content is in cache
        const cachedContent: string | undefined = this.fileContentCache.get(filePath);
        
        if (cachedContent !== undefined) {
            // content found
            return cachedContent;
        }
        
        // load file and cache it
        return this.loadAndCacheAsync(filePath);
    }
    
    private async loadAndCacheAsync(filePath: string): Promise<string> {
        
        let stat;
        
        try {
            stat = await fs.stat(filePath);
        }
        catch(error: unknown) {
            throw new FileSystemError(`Failed to access path '${filePath}'. Please ensure the file exists and the app has permission to access it.`, filePath, error instanceof Error ? error : undefined);
        }
        
        if (!stat.isFile()) {
            throw new FileSystemError(`Path ${filePath} is not a file.`, filePath);
        }

        let content: string;
        
        try {
            content = await fs.readFile(filePath, "utf8");
        }
        catch(error: unknown) {
            throw new FileSystemError(`Unable to read file '${filePath}'.`, filePath, error instanceof Error ? error : undefined);
        }

        this.fileContentCache.set(filePath, content);
        
        return content
    }
}
