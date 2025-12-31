import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocumentSyncKind } from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
connection.onInitialize((_params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            hoverProvider: true
        }
    };
});

documents.onDidChangeContent(change => {
    validateDocument(change.document);
});

function validateDocument(doc: TextDocument) {
    const text = doc.getText();
    const diagnostics: Diagnostic[] = [];

    // Example rule: warn if "curse" keyword appears
    const curseIndex = text.indexOf("curse");
    if (curseIndex !== -1) {
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
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
