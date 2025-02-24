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
	acceptSuggestionOnEnter: boolean;
	insertSpaces: boolean;
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

		if (shouldFormatCurlyBraces(editor)) {
			formatCurlyBraces(editor);
		}
		else {
			autoCompleteOrNewLine(editor);
		}
	});
	context.subscriptions.push(disposable);
}

async function autoCompleteOrNewLine(editor: vscode.TextEditor) {
	const line = editor.document.lineAt(editor.selection.active.line).text;
	const indent = getIndentation(line);
	const didAutocomplete = cachedSettings.acceptSuggestionOnEnter && await acceptSelectedSuggestionAsync(editor);
	
	if (!didAutocomplete) {
		let insertText = '\n';
		if (isActiveLanguage(editor)) {
			insertText = '\n' + indent;
		}
		
		editor.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, insertText);
		});
	}
}

async function acceptSelectedSuggestionAsync(editor: vscode.TextEditor) {
	var cursorPos = editor.document.offsetAt(editor.selection.active);
	await execute("acceptSelectedSuggestion");
	return cursorPos !== editor.document.offsetAt(editor.selection.active);
}

export function deactivate() { }


// *************** //
// Text formatting //
// *************** //

async function formatCurlyBraces(editor: vscode.TextEditor) {
    const cursorPosition = editor.selection.active;
    const line = editor.document.lineAt(cursorPosition.line).text;

	// Get the current indentation
	const indent = getIndentation(line);

	// Determine one indentation step
    const indentUnit = cachedSettings.insertSpaces ? " ".repeat(cachedSettings.tabSize) : "\t";

	// Format new line to insert
	const newLine = `\n${indent}{\n${indent + indentUnit}\n${indent}}`;

    // Define the range where the changes should be applied
    const rangeToEdit = new vscode.Range(
		cursorPosition.line,
		cursorPosition.character - 1,
		cursorPosition.line,
		cursorPosition.character + 1
	);

    // Apply the newlines and indentation directly
    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, rangeToEdit, newLine);

    // Apply the edit to the document
    await vscode.workspace.applyEdit(edit);

	// Reposition cursor
	const targetLine = cursorPosition.line + 2;
	const targetLineText = editor.document.lineAt(targetLine).text;
	const newPosition = new vscode.Position(targetLine, targetLineText.length);
	editor.selection = new vscode.Selection(newPosition, newPosition);
}

async function editRange(editor: vscode.TextEditor, text: string, range: vscode.Range) {
	// Apply the newlines and indentation directly
    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, range, text);

    // Apply the edit to the document
    await vscode.workspace.applyEdit(edit);
}

function getIndentation(line: string): string {
    const currentIndentMatch = line.match(/^(\s*)/);
	return currentIndentMatch ? currentIndentMatch[0] : "";
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
		acceptSuggestionOnEnter: hasSuggestionOnEnter(config),
		insertSpaces: getInsertSpaces(config),
	};
}

function getLanguages(config : vscode.WorkspaceConfiguration) {
	return config.get<string[]>(`${extensionName}.languages`) || [];
}

function getTabSize(config : vscode.WorkspaceConfiguration) {
	return config.get<number>("editor.tabSize") ?? 4;
}

function hasSuggestionOnEnter(config : vscode.WorkspaceConfiguration) {
	return config.get<boolean>("editor.acceptSuggestionOnEnter") ?? true;
}

function getInsertSpaces(config : vscode.WorkspaceConfiguration) {
	return config.get<boolean>("editor.insertSpaces") ?? true;
}


// ************** //
// Helper methods //
// ************** //

function shouldFormatCurlyBraces(editor: vscode.TextEditor) {
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
