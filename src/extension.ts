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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
		//console.log('Congratulations, your extension is now active!');

		// The command has been defined in the package.json file
		// Now provide the implementation of the command with registerCommand
		// The commandId parameter must match the command field in package.json
		let disposable = vscode.commands.registerCommand('cscurlyformatter.curlyformat', () => {
		//vscode.window.showInformationMessage('Extension started!');
	
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return false;
		}

		if(!isCursorAtZeroPosition(editor) && isCursorBetweenCurly(editor)){
			manualFormat();
		}
		else{
			//newLineAndTab(editor);
			type('\n');
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function manualFormat() {
	vscode.commands.executeCommand(Cursor.Left);
	type('\n');
	vscode.commands.executeCommand(Cursor.Right);
	type('\n\n');
	vscode.commands.executeCommand(Cursor.Up);
	type('\t');
}

function newLineAndTab(editor : vscode.TextEditor){
	type('\n');
	var lineToCursor = getLineToCursor(editor);
	vscode.commands.executeCommand("deleteAllLeft");
	type(lineToCursor);
}

function isCursorBetweenCurly(editor : vscode.TextEditor){
	const nearCursor = getAdjacentText(editor);

	if(nearCursor[0] == "{" && nearCursor[1] == "}")
		return true;
	else
		return false;
}

function isCursorAtZeroPosition(editor : vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	return cursorPosition.character == 0;
}

function getAdjacentText(editor : vscode.TextEditor) {
	const cursorPosition = editor.selection.active;

	return editor.document.getText(
		vsRange(cursorPosition.line, cursorPosition.character -1, cursorPosition.character + 1)
	);
}

function getLineToCursor(editor : vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	return editor.document.getText(
		vsRange(cursorPosition.line, 0, cursorPosition.character)
	);
}

function vsRange(line : number, from : number, to : number){
	return new vscode.Range(line, from, line, to);
}

function type(text : string) {
	vscode.commands.executeCommand('type', { "text": text });
}
