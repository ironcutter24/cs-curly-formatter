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

		if (canFormatCurlyBraces(editor)) {
			formatCurlyBraces(editor);
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
}

export function deactivate() { }


// *************** //
// Text formatting //
// *************** //

async function formatCurlyBraces(editor: vscode.TextEditor) {
    const cursorPosition = editor.selection.active;
    const line = editor.document.lineAt(cursorPosition.line);

    // Define the range where the changes should be applied
    const editRange = new vscode.Range(
		cursorPosition.line,
		cursorPosition.character - 1,
		cursorPosition.line,
		cursorPosition.character + 1
	);
    
	// Detect existing indentation in the current line
    const currentIndentMatch = line.text.match(/^(\s*)/);
	const indent = currentIndentMatch ? currentIndentMatch[0] : "";

    // Determine one indentation step
    const indentUnit = cachedSettings.insertSpaces ? " ".repeat(cachedSettings.tabSize) : "\t";

	const newLine = `\n${indent}{\n${indent + indentUnit}\n${indent}}`;

    // Apply the newlines and indentation directly
    const edit = new vscode.WorkspaceEdit();
    edit.replace(editor.document.uri, editRange, newLine);

    // Apply the edit to the document
    await vscode.workspace.applyEdit(edit);

	// Reposition cursor
	const targetLine = cursorPosition.line + 2;
	const targetLineText = editor.document.lineAt(targetLine).text;
	const newPosition = new vscode.Position(targetLine, targetLineText.length);
	editor.selection = new vscode.Selection(newPosition, newPosition);
}

function getLineIndentationLevel(lineText: string): number {
    const indentation = lineText.match(/^(\s*)/); // Match leading whitespace
    return indentation ? indentation[0].length : 0;
}

function getIndentation(level: number) {
	const indentChar = cachedSettings.insertSpaces ? ' ' : '\t';
	return indentChar.repeat(level);
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
