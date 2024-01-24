// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hiera-eyaml" is now active!');
	// const eyamlSettings = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
	let config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
	if (vscode.workspace.workspaceFolders) {
		console.log('loading workspace folder settings');
		console.log('vscode.workspace.workspaceFolders: ', vscode.workspace.workspaceFolders);
		config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml', vscode.workspace.workspaceFolders[3].uri);
	}
	console.log('config: ', config);
	const eyamlPath = config.get('eyamlPath');
	const publicKeyPath = config.get('publicKeyPath');
	const privateKeyPath = config.get('privateKeyPath');
	// const eyamlPath = eyamlSettings['eyamlPath'];
	// const publicKeyPath = eyamlSettings['publicKeyPath'];
	// const privateKeyPath = eyamlSettings['privateKeyPath'];

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('hiera-eyaml.helloWorld', () => {
		console.log('hiera-eyaml.helloWorld command has been run!');

		let config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml');
		if (vscode.workspace.workspaceFolders && vscode.window.activeTextEditor) {
			console.log('There is an active text editor');
			console.log('There are multiple workspace folders');
			const currentFileUri = vscode.window.activeTextEditor.document.uri;
			vscode.workspace.workspaceFolders.forEach(folder => {
				if (currentFileUri.path.includes(folder.uri.path)) {
					console.log('The current file is in the workspace folder: ', folder.name);
					config = vscode.workspace.getConfiguration('EncoreTechnologies.heira-eyaml', folder.uri);
					return true;
				}
			});
		}

		console.log('config: ', config);
		const eyamlPath = config.get('eyamlPath');
		const publicKeyPath = config.get('publicKeyPath');
		const privateKeyPath = config.get('privateKeyPath');
		
		console.log('eyamlPath: ', eyamlPath);
		console.log('publicKeyPath: ', publicKeyPath);
		console.log('privateKeyPath: ', privateKeyPath);
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from hiera-eyaml!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
