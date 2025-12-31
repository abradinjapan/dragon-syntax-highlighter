"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    // show extension activated
    console.log("DragonForge extension activated.");
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
        documentSelector: [{ scheme: 'file', language: 'dragon' }]
    };
    client = new node_1.LanguageClient('dragonLanguageServer', 'Dragon Language Server', serverOptions, clientOptions);
    client.start();
}
function deactivate() {
    console.log("DragonForge extension deactivated.");
    return client?.stop();
}
