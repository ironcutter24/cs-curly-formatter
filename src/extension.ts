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

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(extensionName + ".formatCurlyBracesOnNewLine", () => {
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
	if (hasSuggestionOnEnter()) {
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
	await type(hasAutoTab() ? '\t' : ' '.repeat(getTabSize()));
}

async function convertIndentation() {
	var action = hasAutoTab() ? "indentationToTabs" : "indentationToSpaces";
	await execute("editor.action." + action);
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

function getLanguages() {
	return getConfig().get<string[]>(extensionName + ".languages") || [];
}

function getTabSize() {
	return getConfig().get<number>("editor.tabSize") ?? 4;
}

function hasAutoTab() {
	return getConfig().get<boolean>(extensionName + ".autoTabIndentation") ?? false;
}

function hasSuggestionOnEnter() {
	return getConfig().get<boolean>("editor.acceptSuggestionOnEnter") ?? true;
}

function getConfig() {
	return vscode.workspace.getConfiguration();
}


// ************** //
// Helper methods //
// ************** //

function canFormatCurlyBraces(editor: vscode.TextEditor) {
    return isActiveLanguage(editor)
        && !isCursorAtZeroPosition(editor)
        && isCursorBetweenCurly(editor)
        && !isNewLine(editor)
}

function isActiveLanguage(editor: vscode.TextEditor) {
    return getLanguages().includes(editor.document.languageId)
}

function isCursorAtZeroPosition(editor: vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	return cursorPosition.character === 0;
}

function isCursorBetweenCurly(editor: vscode.TextEditor) {
	const [leftChar, rightChar] = getAdjacentText(editor);
	return leftChar === "{" && rightChar === "}";
}

function getAdjacentText(editor: vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	return editor.document.getText(
		vsRange(cursorPosition.line, cursorPosition.character - 1, cursorPosition.character + 1)
	);
}

function isNewLine(editor: vscode.TextEditor) { 
	const cursorPosition = editor.selection.active;
	var lineRange = vsRange(cursorPosition.line, 0, cursorPosition.character - 1);
	var line = editor.document.getText(lineRange);
	
	for (var i = 0; i < line.length; i++) {
		if (line[i] !== ' ' && line[i] !== '\t') {
			return false;
		}
	}
	
	return true;
}

function vsRange(line: number, from: number, to: number) {
	return new vscode.Range(line, from, line, to);
}
