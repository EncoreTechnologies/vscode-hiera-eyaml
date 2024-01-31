import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as sharedFunctions from './sharedFunctions';

interface DecryptObj {
    key: string;
    value: string;
}

export class hieraEyamlViewProvider implements vscode.TreeDataProvider<DecryptObj> {
    private _onDidChangeTreeData: vscode.EventEmitter<void | DecryptObj | DecryptObj[] | null | undefined> = new vscode.EventEmitter<void | DecryptObj | DecryptObj[] | null | undefined>();
    readonly onDidChangeTreeData: vscode.Event<void | DecryptObj | DecryptObj[] | null | undefined> = this._onDidChangeTreeData.event;

    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: DecryptObj): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(`${element.key}: ${element.value}`);
        treeItem.tooltip = `Key: ${element.key}\nValue: ${element.value}`;
        return treeItem;
    }

    getChildren(element?: DecryptObj): Thenable<DecryptObj[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.getRootNodes());
        }
    }

    private async getRootNodes(): Promise<DecryptObj[]> {
        const editor = vscode.window.activeTextEditor;
        const { config, folderUri } = sharedFunctions.getConfig();
		const eyamlPath = config.get('eyamlPath', '');
		const publicKeyPath = sharedFunctions.getFirstExistingFile(config.get('publicKeyPath', []), folderUri);
		const privateKeyPath = sharedFunctions.getFirstExistingFile(config.get('privateKeyPath', []), folderUri);
		
		if (!eyamlPath || !publicKeyPath || !privateKeyPath) {
			vscode.window.showInformationMessage('Please set the eyamlPath, publicKeyPath, and privateKeyPath settings');
			this.outputChannel.appendLine(`eyamlPath: ${eyamlPath}`);
			this.outputChannel.appendLine(`publicKeyPath: ${publicKeyPath}`);
			this.outputChannel.appendLine(`privateKeyPath: ${privateKeyPath}`);
            return [];
		}

        if (editor) {
            const document = editor.document;
            let yamlData: DecryptObj[];
            try {
                yamlData = yaml.load(document.getText(), {json: true}) as DecryptObj[];
            } catch (e) {
                console.error(e);
			    this.outputChannel.appendLine(`error loading yaml: ${e}`);
                return [];
            }
            const regex = /ENC\[PKCS7,(.*?)\]/s;
            const matches: DecryptObj[] = await sharedFunctions.searchNestedKeys(yamlData, eyamlPath, privateKeyPath, publicKeyPath, sharedFunctions, regex, this.outputChannel);
            return matches;
        }
        return [];
    }
}