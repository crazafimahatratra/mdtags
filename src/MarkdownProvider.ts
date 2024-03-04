import * as vscode from 'vscode';
import { MdFileItem } from './MdFileItem';
import { Tag } from './types/Tag';

export class MarkdownProvider implements vscode.TreeDataProvider<MdFileItem> {
    private tags: Tag[] = [];
    private _onDidChangeTreeData: vscode.EventEmitter<MdFileItem | undefined | null | void> = new vscode.EventEmitter<MdFileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MdFileItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(tags: Tag[]) {
        this.tags = tags;
    }

    getTreeItem(element: MdFileItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: MdFileItem | undefined): vscode.ProviderResult<MdFileItem[]> {
        if (!element) {
            return(this.getRootElement());
        }

        if (element?.type === 'ROOT') {
            return(this.getTags());
        }

        if (element?.type === 'TAG') {
            return(this.getFilesInTag(element.getTag()));
        }

        if (element?.type === 'FILE') {
            return(this.getLocations(element.getTag(), element.getFilePath()));
        }
    }

    private getRootElement(): MdFileItem[] {
        return [new MdFileItem('Tags', 'ROOT')];
    }

    private getTags(): MdFileItem[] {
        const items: MdFileItem[] = [];
        for (const tag of this.tags) {
            const item = new MdFileItem(tag.label.substring(1), 'TAG');
            item.setTag(tag.label, tag.color);
            items.push(item);
        }
        return (items);
    }

    private getFilesInTag(tag: string): MdFileItem[] {
        const files = this.tags.find(t => t.label === tag)?.locations;
        if (!files) {
            return [];
        }
        const items: MdFileItem[] = [];
        for (const file of files) {
            const item = new MdFileItem(file.label, 'FILE');
            item.setFilePath(file.file);
            item.setTag(tag, '');
            items.push(item)
        }
        return items;
    }

    private getLocations(tagName: string, file: string): MdFileItem[] {
        const tag = this.tags.find(t => t.label === tagName);
        if (!tag) {
            return [];
        }

        const chars = tag.locations.find(l => l.file === file)?.chars ?? [];

        const items: MdFileItem[] = [];
        for (let c of chars) {
            const item = new MdFileItem(`${c.extract}`, 'LOCATION');
            item.setAnchor(file, c);
            items.push(item);
        }
        return items;
    }

    public getTagsInFile(fileName: string) {
        const tags: Tag[] = [];
        for(let tag of this.tags) {
            const location = tag.locations.find(l => l.file === fileName);
            if(!location) continue;
            tags.push({...tag, locations: [location]});
        }
        return tags;
    }

    public getAllTags() {
        return this.tags;
    }

    refresh(tags: Tag[]) {
        this.tags = tags;
        this._onDidChangeTreeData.fire();
    }
}
