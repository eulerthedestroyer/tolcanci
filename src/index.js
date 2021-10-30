"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.makeApplication = exports.a = exports.button = exports.p = exports.div = exports.simpleElement = void 0;
const fs_1 = __importDefault(require("fs"));
const jsdom_1 = require("jsdom");
const common_1 = require("./common");
const window = new jsdom_1.JSDOM(``).window;
exports.simpleElement = (0, common_1.simpleElementBuilders)(window);
_a = ["div", "p", "button"].map(exports.simpleElement), exports.div = _a[0], exports.p = _a[1], exports.button = _a[2];
exports.a = (0, common_1.makeA)(window);
const makeApplication = async (x, _options) => {
    console.log("make app called");
    if (x.update) {
        x = x.update(new jsdom_1.JSDOM(``).window);
    }
    const routes = (x === null || x === void 0 ? void 0 : x.routes) || ["/"];
    console.log("routes is", routes);
    console.log("x is", x);
    for (const route of routes) {
        const win = new jsdom_1.JSDOM(``, {
            url: `http://localhost.com/${route}`
        }).window;
        if (x.update) {
            x = x.update(win);
        }
        const body = win.document.body;
        const a = await (x === null || x === void 0 ? void 0 : x.getStaticProps());
        console.log("setting window");
        console.log("making app");
        body.appendChild(x);
        let js = "";
        const makeStr = ([a, b]) => `document.querySelector("[secret-id='${a}']").setState( ${JSON.stringify(b)});`;
        js += Object.entries(a).map(makeStr).join("\n");
        let html = body.innerHTML;
        html += "<script src='dist/program.js'></script>\n";
        html += `<script defer>${js}</script>\n`;
        html = formatHTMLString(html);
        fs_1.default.writeFileSync(`./example/${route}.html`, html);
    }
    return "this is a placeholder";
};
exports.makeApplication = makeApplication;
const getJs = (_node) => {
    let js = "";
    js += "let exports = {}; \n";
    js += "let require = (string) => window['index_1']; \n";
    js += fs_1.default.readFileSync("./src/example.js", "utf-8");
    js += "document.body.innerHTML = '';\n";
    js += "document.body.append(main);\n";
    js = js.replace(/(^.*require.*$)/g, "// $1");
    return js;
};
function formatHTMLString(str) {
    const { document } = (new jsdom_1.JSDOM(``)).window;
    var div = document.createElement('div');
    div.innerHTML = str.trim();
    return formatNode(div, 0).innerHTML;
}
function formatNode(node, level) {
    const { document } = (new jsdom_1.JSDOM(``)).window;
    let indentBefore = new Array(level++ + 1).join('    '), indentAfter = new Array(level - 1).join('    '), textNode;
    for (let i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);
        formatNode(node.children[i], level);
        if (node.lastElementChild == node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode.cloneNode(true));
        }
    }
    return node;
}
function router(x) {
    const comp = x[""];
    const update = (w) => {
        const loc = w.location.pathname;
        const comp = x[loc.substr(1)];
        console.log("x is", x);
        if (!comp) {
            throw new Error(`unrecognized location ${loc}`);
        }
        comp.update = update;
        comp.routes = Object.keys(x);
        return comp;
    };
    if (!comp) {
        throw new Error("no handling for / route");
    }
    comp.update = update;
    return comp;
}
exports.router = router;
