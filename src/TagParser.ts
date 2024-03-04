import path from "path";
import { Tag } from "./types/Tag";
import { TextPosition } from "./TextPosition";
import { getColorAtIndex } from "./TagColors";

export class TagParser {
    private contents: Map<string, string>;

    constructor(contents: Map<string, string>) {
        this.contents = contents;
    }

    getTags(): Tag[] {
        const tags: Tag[] = []
        for (const content of this.contents.entries()) {
            this.appendContentToTags(content[0], content[1], tags);
        }
        let i = 0;
        for (let tag of tags) {
            tag.color = getColorAtIndex(i++);
        }
        return tags.sort((a, b) => {
            if (a.label > b.label) return 1;
            if (a.label < b.label) return -1;
            return 0;
        });
    }

    private appendContentToTags(file: string, content: string, tags: Tag[]) {
        const textPosition = new TextPosition();
        const matches = content.matchAll(/\B#[a-z,A-Z,0-9,\-,_]+/g);
        for (const match of matches) {
            const position = textPosition.getTagPosition(content, match.index ?? 0);
            const tag = match[0];
            const locationsForTag = tags.find(t => t.label === tag)?.locations ?? [];
            let locationForFile = locationsForTag.find(f => f.file === file);
            if (!locationForFile) {
                locationsForTag.push({ file: file, label: path.basename(file), chars: [position] });
            } else {
                locationForFile.chars.push(position);
            }
            const tagIndex = tags.findIndex(t => t.label === tag);
            if (tagIndex < 0) {
                tags.push({ label: tag, locations: locationsForTag, color: '' });
            } else {
                tags[tagIndex].locations = locationsForTag;
            }
        }
    }
}
