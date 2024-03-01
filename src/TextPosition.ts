import { tTextLocation } from "./types/TagLocation";

const MAX_EXTRACT_LENGTH = 25;

export class TextPosition {
    public getTagPosition(text: string, charPos: number): tTextLocation {
        const lines = text.split('\n');
        let totalChars = 0;
        let linePos = 0;
        let colPos = 0;
        for(let i = 0; i < lines.length; i++) {
            if(totalChars + lines[i].length >= charPos) {
                linePos = i;
                colPos = charPos - totalChars;
                break;
            }
            totalChars += lines[i].length + 1;
        }
        return {line: linePos, col: colPos, extract: this.getTagExtract(lines[linePos], colPos)};
    }

    public getTagExtract(line: string, colNumber: number) {
        if(!line) {
            return 'EMPTY';
        }
        const tagLength = this.getWordLengthAfter(line, colNumber);
        const from = colNumber - MAX_EXTRACT_LENGTH;
        const prefix = from > 0 ? '...' : '';
        return prefix + line.substring(from, colNumber + tagLength);
    }

    public getWordLengthAfter(line: string, from: number) {
        const part = line.substring(from);
        return part.split(' ')[0].length;
    }
}
