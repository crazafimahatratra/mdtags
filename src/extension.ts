// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { MarkdownProvider } from './MarkdownProvider';
import { TagParser } from './TagParser';

async function getFilesInWorkspace() {
	const uris: vscode.Uri[] = [];
	const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
	const rootFolder = (vscode.workspace.getConfiguration('MDTags').get('rootFolder') ?? '.') as string;
	const exclude = (vscode.workspace.getConfiguration('MDTags').get('exclude') ?? '') as string;

	for (let workspaceFolder of workspaceFolders) {
		const p = getRelativePath(workspaceFolder, rootFolder);
		const u = await vscode.workspace.findFiles(p, exclude);
		uris.push(...u);
	}
	return uris;
}

function getRelativePath(workspaceFolder: vscode.WorkspaceFolder, rootFolder: string) {
	let base = `${workspaceFolder.uri.path}/..`;
	if(rootFolder.length === 0) {
		base = `${workspaceFolder.uri.path}`
	}
	let pattern = rootFolder;
	if(!pattern.endsWith('/') && pattern.length > 0) {
		pattern = `${pattern}/`;
	}
	return new vscode.RelativePattern(base, `${pattern}**/*.md`);
}

async function refreshData() {
	const uris = await getFilesInWorkspace();
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
	vscode.window.createTreeView('mdtags', {
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

	vscode.commands.registerCommand('mdtags.refresh', async () =>
		provider.refresh(await refreshData())
	);

	vscode.commands.registerCommand('mdtags.openFile', (path: string, options: { selection: vscode.Selection }) =>
		vscode.workspace.openTextDocument(path).then(document => {
			vscode.window.showTextDocument(document, { selection: options.selection });
		})
	);

	vscode.languages.registerCompletionItemProvider('markdown', {
		provideCompletionItems: (document, position) => {
			const tags = provider.getAllTags();

			return tags.map(tag => {
				return new vscode.CompletionItem(tag.label.substring(1), vscode.CompletionItemKind.Value);
			});
		}
	}, '#');

	return {
		extendMarkdownIt(md: any) {
		  return md.use(plugin);
		}
	};
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

function plugin(md: any) {
    const render = md.renderer.render;
    md.renderer.render = function() {
		const content = render.apply(md.renderer, arguments) as string;
		const newContent  = content.replaceAll(/\B#[a-z,A-Z,0-9,\-,_]+/g, "<span class='mdtags-pills'>$&</span>");
        return `${newContent}`;
    };
    return md;
}

// This method is called when your extension is deactivated
export function deactivate() { }
