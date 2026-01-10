
export default class SourceLocation {
    public readonly filePath: string;
    public readonly line: number;
    public readonly column: number;
    
    constructor(filePath: string, line: number, column: number) {
        this.filePath = filePath;
        this.line = line;
        this.column = column;
    }
    
    public advanceColumn(): SourceLocation {
        return new SourceLocation(
            this.filePath,
            this.line,
            this.column + 1
        );
    }
    
    public newline(): SourceLocation {
        return new SourceLocation(
            this.filePath,
            this.line + 1,
            1
        );
    }
    
    public copy(): SourceLocation {
        return new SourceLocation(this.filePath, this.line, this.column);
    }
}
