"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    const serverModule = context.asAbsolutePath('server/out/server.js');
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'dragonforge' }]
    };
    client = new node_1.LanguageClient('dragonforgeLanguageServer', 'Dragonforge Language Server', serverOptions, clientOptions);
    client.start();
}
function deactivate() {
    return client?.stop();
}
