export type tTextLocation = { line: number, col: number, extract: string };
export type TagLocation = {
    label: string;
    file: string;
    chars: tTextLocation[];
}
