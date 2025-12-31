"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const node_2 = require("vscode-languageserver/node");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize((_params) => {
    return {
        capabilities: {
            textDocumentSync: node_2.TextDocumentSyncKind.Incremental,
            hoverProvider: true
        }
    };
});
documents.onDidChangeContent(change => {
    validateDocument(change.document);
});
function validateDocument(doc) {
    const text = doc.getText();
    const diagnostics = [];
    // Example rule: warn if "curse" keyword appears
    const curseIndex = text.indexOf("curse");
    if (curseIndex !== -1) {
        diagnostics.push({
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: doc.positionAt(curseIndex),
                end: doc.positionAt(curseIndex + 5)
            },
            message: "Forbidden incantation 'curse' detected",
            source: "dragonforge-lsp"
        });
    }
    connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}
connection.onHover((_params) => {
    return {
        contents: {
            language: "dragonforge",
            value: "🔥 Dragonforge symbol: raw arcane essence"
        }
    };
});
documents.listen(connection);
connection.listen();
