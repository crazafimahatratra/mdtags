import * as vscode from 'vscode';
import { NodeType } from './types/NodeType';
import { tTextLocation } from './types/TagLocation';

export class MdFileItem extends vscode.TreeItem {
    public type: NodeType;
    private filePath: string = '';
    private tag: string = '';
    private tagColor: string = 'terminal.ansiBrightGreen';

    constructor(label: string, type: NodeType) {
        super(label);
        this.type = type;
        this.collapsibleState = this.getState();
        this.iconPath = this.getIcon();
    }

    public setFilePath(filePath: string) {
        this.filePath = filePath;
    }

    public setAnchor(filePath: string, location: tTextLocation) {
        this.filePath = filePath;
        if (this.type === 'LOCATION') {
            this.command = {
                command: 'mdtags.openFile',
                arguments: [
                    this.filePath, {
                        selection: new vscode.Selection(location.line, location.col, location.line, location.col)
                    }
                ],
                title: '',
            };
        }
    }

    public getFilePath() {
        return this.filePath;
    }

    private getIcon() {
        switch (this.type) {
            case 'FILE':
                return new vscode.ThemeIcon('markdown', new vscode.ThemeColor('terminal.ansiBlue'));
            case 'ROOT':
                return new vscode.ThemeIcon('tag');
            case 'TAG':
                return new vscode.ThemeIcon('primitive-dot', new vscode.ThemeColor(this.tagColor));
        }
    }

    private getState() {
        switch(this.type) {
            case 'FILE':
                return vscode.TreeItemCollapsibleState.Collapsed;
            case 'LOCATION':
                return vscode.TreeItemCollapsibleState.None;
            case 'ROOT':
                return vscode.TreeItemCollapsibleState.Expanded;
            case 'TAG':
                return vscode.TreeItemCollapsibleState.Collapsed;
        }
    }

    public setTag(tag: string, color: string) {
        this.tag = tag;
        this.tagColor = color;
        this.iconPath = this.getIcon();
    }

    public getTag() {
        return this.tag;
    }
}
