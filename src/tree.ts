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
        const config = sharedFunctions.getConfig();
		const eyamlPath = config.get('eyamlPath', '');
		const publicKeyPath = sharedFunctions.getFirstExistingFile(config.get('publicKeyPath', []));
		const privateKeyPath = sharedFunctions.getFirstExistingFile(config.get('privateKeyPath', []));
		
		if (!eyamlPath || !publicKeyPath || !privateKeyPath) {
			vscode.window.showInformationMessage('Please set the eyamlPath, publicKeyPath, and privateKeyPath settings');
            return [];
		}

        if (editor) {
            const document = editor.document;
            let yamlData: DecryptObj[];
            try {
                yamlData = yaml.load(document.getText()) as DecryptObj[];
            } catch (e) {
                console.error(e);
                return [];
            }
            const regex = /ENC\[PKCS7,(.*?)\]/s;
            const matches: DecryptObj[] = await sharedFunctions.searchNestedKeys(yamlData, eyamlPath, privateKeyPath, publicKeyPath, sharedFunctions, regex);
            return matches;
        }
        return [];
    }
}