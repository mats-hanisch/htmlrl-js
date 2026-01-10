
export default class HtmlUtils {
    public static escapeHtml(input: string): string {
        let out: string = "";
        let last: number = 0;
        
        for (let i = 0; i < input.length; i++) {
            const ch: number = input.charCodeAt(i);
            let esc: string;
            
            switch (ch) {
                case 38: esc = "&amp;"; break;   // &
                case 60: esc = "&lt;"; break;    // <
                case 62: esc = "&gt;"; break;    // >
                case 34: esc = "&quot;"; break;  // "
                case 39: esc = "&#39;"; break;   // '
                default:
                    continue;
            }
            
            if (last !== i) {
                out += input.slice(last, i);
            }
            
            out += esc;
            last = i + 1;
        }
        
        return last === 0 ? input : out + input.slice(last);
    }
}
