// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { MarkdownProvider } from './MarkdownProvider';
import { TagParser } from './TagParser';

async function refreshData() {
	const uris = await vscode.workspace.findFiles('**/*.md', '**/node_modules/**');
	const contents = new Map<string, string>();
	uris.forEach(uri => {
		const content = fs.readFileSync(uri.path).toString();
		contents.set(uri.path, content);
	});
	return new TagParser(contents).getTags();
}

let editor: vscode.TextEditor | undefined = undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const provider = new MarkdownProvider(await refreshData());
	vscode.window.createTreeView('mdfileTags', {
		treeDataProvider: provider
	});

	editor = vscode.window.activeTextEditor;
	updateDecorations(provider);

	vscode.window.onDidChangeActiveTextEditor((event) => {
		editor = event;
		updateDecorations(provider);
	});

	vscode.workspace.onDidSaveTextDocument(async (event) => {
		if (editor && event === editor.document) {
			provider.refresh(await refreshData());
			updateDecorations(provider);
		}
	})

	vscode.commands.registerCommand('mdfileTags.refresh', async () =>
		provider.refresh(await refreshData())
	);
}

function updateDecorations(provider: MarkdownProvider) {
	if (!editor) {
		return;
	}
	if (!editor.document.fileName.endsWith('.md')) {
		return;
	}

	const tagsInFile = provider.getTagsInFile(editor.document.fileName);
	for (let tag of tagsInFile) {
		for (let chars of tag.locations[0].chars) {
			const decorationType = vscode.window.createTextEditorDecorationType({
				backgroundColor: new vscode.ThemeColor(tag.color),
				color: '#FFFFFF',
				borderRadius: '8px',
			});
			const startLine = chars.line;
			const startChar = chars.col;
			const endLine = chars.line;
			const endChar = chars.col + tag.label.length;
			editor.setDecorations(decorationType, [new vscode.Range(startLine, startChar, endLine, endChar)]);
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
