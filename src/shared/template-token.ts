import SourceLocation from "./source-location.js";

import { TemplateTokenType } from "./template-token-type.js";


export type TemplateToken = Readonly<{
    type: TemplateTokenType;
    value: string;
    srcLocation: SourceLocation;
}>;
