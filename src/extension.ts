import * as vscode from 'vscode';

/*
 * CS Curly Formatter
 *
 * Build Commands:
 * 1. Install VSCE globally: npm install -g @vscode/vsce
 * 2. Package the extension: vsce package
 */


const extensionName = "cscurlyformatter";


enum CursorDirection {
	up = "cursorUp",
	down = "cursorDown",
	left = "cursorLeft",
	right = "cursorRight"
}


interface EditorSettings {
	languages: string[];
	tabSize: number;
	autoTabIndentation: boolean;
	acceptSuggestionOnEnter: boolean;
}


let cachedSettings: EditorSettings = getEditorSettings();


// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Subscribe to the onDidChangeConfiguration event
	const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(extensionName) || event.affectsConfiguration("editor")) {
			cachedSettings = getEditorSettings();
		}
	  });
	  
	  context.subscriptions.push(configChangeListener);
	
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(`${extensionName}.formatCurlyBracesOnNewLine`, () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return false;            
		}

		if (canFormatCurlyBraces(editor)) {
			formatCurlyBraces();
		}
		else {
			autoCompleteOrNewLine(editor);
		}
	});
	context.subscriptions.push(disposable);
}

async function autoCompleteOrNewLine(editor: vscode.TextEditor) {
	var cursorPos = editor.document.offsetAt(editor.selection.active);
	if (cachedSettings.acceptSuggestionOnEnter) {
		await execute("acceptSelectedSuggestion");

		if (cursorPos !== editor.document.offsetAt(editor.selection.active)) {
			return;   
		}
	}
	await type('\n');
	await convertIndentation();
}

export function deactivate() { }


// *************** //
// Text formatting //
// *************** //

async function formatCurlyBraces() {
	await move(CursorDirection.left);
	await type('\n');
	await move(CursorDirection.right);
	await type('\n\n');
	await move(CursorDirection.up);
	await indent();
}

async function indent() {
	await type(cachedSettings.autoTabIndentation ? '\t' : ' '.repeat(cachedSettings.tabSize));
}

async function convertIndentation() {
	var action = cachedSettings.autoTabIndentation ? "indentationToTabs" : "indentationToSpaces";
	await execute(`editor.action.${action}`);
}


// ******************* //
// Commands shorthands //
// ******************* //

async function move(dir: CursorDirection) {
	await execute(dir);
}

async function type(text: string) {
	await vscode.commands.executeCommand('type', { "text": text });
}

async function execute(cmd: string) {
	await vscode.commands.executeCommand(cmd);
}


// ************* //
// Configuration //
// ************* //

function getEditorSettings(): EditorSettings {
	let config = vscode.workspace.getConfiguration();
	return {
		languages: getLanguages(config),
		tabSize: getTabSize(config),
		autoTabIndentation: hasAutoTab(config),
		acceptSuggestionOnEnter: hasSuggestionOnEnter(config)
	};
}

function getLanguages(config : vscode.WorkspaceConfiguration) {
	return config.get<string[]>(`${extensionName}.languages`) || [];
}

function getTabSize(config : vscode.WorkspaceConfiguration) {
	return config.get<number>("editor.tabSize") ?? 4;
}

function hasAutoTab(config : vscode.WorkspaceConfiguration) {
	return config.get<boolean>(`${extensionName}.autoTabIndentation`) ?? false;
}

function hasSuggestionOnEnter(config : vscode.WorkspaceConfiguration) {
	return config.get<boolean>("editor.acceptSuggestionOnEnter") ?? true;
}


// ************** //
// Helper methods //
// ************** //

function canFormatCurlyBraces(editor: vscode.TextEditor) {
	return isActiveLanguage(editor)
		&& !isCursorAtZeroPosition(editor)
		&& isCursorBetweenCurly(editor)
		&& !isNewLine(editor);
}

function isActiveLanguage(editor: vscode.TextEditor) {
	return cachedSettings.languages.includes(editor.document.languageId);
}

function isCursorAtZeroPosition(editor: vscode.TextEditor) {
	return editor.selection.active.character === 0;
}

function isCursorBetweenCurly(editor: vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	const line = editor.document.lineAt(cursorPosition.line).text;
	
	const leftChar = line[cursorPosition.character - 1];
	const rightChar = line[cursorPosition.character];

	return leftChar === "{" && rightChar === "}";
}

function isNewLine(editor: vscode.TextEditor) { 
	const cursorPosition = editor.selection.active;
	const line = editor.document.lineAt(cursorPosition.line).text;

	return isWhitespace(line.substring(0, cursorPosition.character - 1));
}

function isWhitespace(text: string) {
	return !text.trim();
}
