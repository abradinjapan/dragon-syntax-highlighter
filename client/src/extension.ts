import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // show extension activated
    console.log("DragonForge extension activated.");
    const serverModule = context.asAbsolutePath('server/out/server.js');
    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc
        }
    };
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'dragon' }]
    };
    client = new LanguageClient(
        'dragonLanguageServer',
        'Dragon Language Server',
        serverOptions,
        clientOptions
    );
    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    console.log("DragonForge extension deactivated.");
    return client?.stop();
}
