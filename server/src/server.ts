import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    CompletionItem,
    CompletionItemKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocumentSyncKind } from 'vscode-languageserver/node';

// connections and documents
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
connection.onInitialize((_params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ["!"]
            },
            hoverProvider: true
        }
    };
});

// keywords
const functionNames = new Map<string, string[]>();
const typeNames = new Map<string, Set<string>>();

// check if is name character
function dragonisNameCharacter(text: string) {
    return (
        (text[0] >= 'A' && text[0] <= 'Z') ||
        (text[0] >= 'a' && text[0] <= 'z') ||
        (text[0] >= '0' && text[0] <= '9') ||
        (text[0] >= '.' && text[0] <= '.') ||
        (text[0] >= '_' && text[0] <= '_')
    )
}

// parse document for types
function dragonParseDocumentForTypes(text: string): string[] {
    let output: string[] = [];
    
    // read document character by character
    fileScopeLoop: for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
        // check for whitespace characters
        if (text.charCodeAt(characterIndex) >= 0 && text.charCodeAt(characterIndex) <= 32) {
            // skip whitespace
            continue;
        }

        // check for comments
        if (text[characterIndex] == '[') {
            let commentDepth = 1;
            characterIndex++;

            // parse over comments
            commentDepthLoop: while (commentDepth > 0 && characterIndex < text.length) {
                // check for opener
                if (text[characterIndex] == '[') {
                    commentDepth++;
                    characterIndex++;
                    continue;
                }
                // check for closer
                if (text[characterIndex] == ']') {
                    commentDepth--;
                    characterIndex++;
                    continue;
                }
                // else, just a comment character
                characterIndex++;
            }
        }

        // get types
        if (text[characterIndex] == '!') {
            // next character
            characterIndex++;

            // get name
            let start = characterIndex - 1;
            let length = 1;
            while (characterIndex < text.length && dragonisNameCharacter(text[characterIndex])) {
                length++;
                characterIndex++;
            }

            // create and append name
            output.push(text.substring(start, start + length));
        }
    }

    return output;
}

// on change document
documents.onDidChangeContent(change => {
    // get document text
    const doc = change.document;
    const text = doc.getText();

    // parse document
    let matches: string[] = dragonParseDocumentForTypes(text);
    const unique = new Set(matches);

    // setup types
    typeNames.set(doc.uri, unique);

    //validateDocument(change.document);
});

// on completion
connection.onCompletion((params) => {
    const uri = params.textDocument.uri;
    const types = typeNames.get(uri) || new Set();

    return [...types].map(t => ({
        label: t,
        kind: CompletionItemKind.Function,
        detail: "Dragon Type",
        insertText: t.substring(1, t.length)
    }));
});

// validate document
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
