"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const node_2 = require("vscode-languageserver/node");
// connections and documents
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize((_params) => {
    return {
        capabilities: {
            textDocumentSync: node_2.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false
            },
            hoverProvider: true
        }
    };
});
// keywords
const functionNames = new Map();
// on change document
documents.onDidChangeContent(change => {
    const doc = change.document;
    const text = doc.getText();
    const regex = new RegExp("^[0-9a-zA-Z_.]+$");
    const names = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        names.push(match[1]);
    }
    functionNames.set(doc.uri, names);
    validateDocument(change.document);
});
// on completion
connection.onCompletion((params) => {
    const uri = params.textDocument.uri;
    const names = functionNames.get(uri) || [];
    return names.map(name => ({
        label: name,
        kind: node_1.CompletionItemKind.Function,
        detail: "Dragon Function",
        insertText: name + "()()"
    }));
});
// validate document
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
            source: "dragon-lsp"
        });
    }
    connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}
// on hover
connection.onHover((_params) => {
    return {
        contents: {
            language: "dragon",
            value: "Dragon Symbol: (Not yet implemented)"
        }
    };
});
// start listeners
documents.listen(connection);
connection.listen();
