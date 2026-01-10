import CharTraits from "../utils/char-traits.js";
import FileSystemUtils from "../utils/fs-utils.js";
import StringUtils from "../utils/string-utils.js";


export type LibContext = Readonly<{
    stringUtils: StringUtils;
    fsUtils: FileSystemUtils;
    charTraits: CharTraits;
}>;
