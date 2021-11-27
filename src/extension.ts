import { moveCursor } from 'readline';
import { start } from 'repl';
import * as vscode from 'vscode';

const Cursor = {
	Up: "cursorUp",
	Down: "cursorDown",
	Left: "cursorLeft",
	Right: "cursorRight"
};
Object.freeze(Cursor);

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
		//console.log('Your extension is now active!');

		// The commandId parameter must match the command field in package.json
		let disposable = vscode.commands.registerCommand('cscurlyformatter.curlyformat', () => {
	
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			return false;
		}

		if(!isCursorAtZeroPosition(editor) && isCursorBetweenCurly(editor)) {
			manualFormat();
		}
		else {
			newLineAndTab(editor);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function manualFormat() {
	vscode.commands.executeCommand(Cursor.Left);
	type('\n');
	vscode.commands.executeCommand(Cursor.Right);
	type('\n\n');
	vscode.commands.executeCommand(Cursor.Up);
	type('\t');
}

function newLineAndTab(editor : vscode.TextEditor) {
	type('\n');
	indent();
}

function type(text : string) {
	vscode.commands.executeCommand('type', { "text": text });
}

function indent() {
	vscode.commands.executeCommand("indent");
	vscode.commands.executeCommand("editor.action.indentationToTabs");
}

function isCursorAtZeroPosition(editor : vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	return cursorPosition.character == 0;
}

function isCursorBetweenCurly(editor : vscode.TextEditor) {
	const nearCursor = getAdjacentText(editor);

	if(nearCursor[0] == "{" && nearCursor[1] == "}")
		return true;
	else
		return false;
}

function getAdjacentText(editor : vscode.TextEditor) {
	const cursorPosition = editor.selection.active;

	return editor.document.getText(
		vsRange(cursorPosition.line, cursorPosition.character -1, cursorPosition.character + 1)
	);
}

function vsRange(line : number, from : number, to : number) {
	return new vscode.Range(line, from, line, to);
}
