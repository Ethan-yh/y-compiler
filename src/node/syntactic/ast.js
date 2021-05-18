// 该文件为构造AST文件
// 该文件定义了AST的各结点类以及各产生式的对应构造动作
class Program {
    constructor(loc, body = []) {
        this.type = 'Program';
        this.loc = loc;
        this.body = body;
    }
}

class VariableDeclaration {
    constructor(loc, id = '', kind = 'int') {
        this.type = 'VariableDeclaration';
        this.loc = loc;
        this.id = id;
        this.kind = kind;
        this.params
    }
}

class FunctionDeclaration {
    constructor(loc, id = {}, kind, params = [], body = []) {
        this.type = 'FunctionDeclaration';
        this.loc = loc;
        this.id = id;
        this.kind = kind;
        this.params = params;
        this.body = body;
    }
}

class BlockStatement {
    constructor(loc, body = []) {
        this.type = 'BlockStatement';
        this.loc = loc;
        this.body = body;
    }
}

class Param {
    constructor(loc, id = {}, kind) {
        this.type = 'Identifier';
        this.loc = loc;
        this.id = id;
        this.kind = kind;
    }
}

class Identifier {
    constructor(loc, name = '') {
        this.type = 'Identifier';
        this.loc = loc;
        this.name = name;
    }
}

class ExpressionStatement {
    constructor(loc, expression) {
        this.type = 'ExpressionStatement';
        this.loc = loc;
        this.expression = expression;
    }
}


class AssignStatement {
    constructor(loc, left, right) {
        this.type = 'AssignStatement';
        this.loc = loc;
        this.operator = '=';
        this.left = left;
        this.right = right;
    }
}

class IfStatement {
    constructor(loc, test, consequent, alternate) {
        this.type = 'IfStatement';
        this.loc = loc;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
}

class WhileStatement {
    constructor(loc, test, body) {
        this.type = 'WhileStatement';
        this.loc = loc;
        this.test = test;
        this.body = body;
    }
}

class ReturnStatement {
    constructor(loc, argument) {
        this.type = 'ReturnStatement';
        this.loc = loc;
        this.argument = argument;
    }
}

class BinaryExpression {
    constructor(loc, left, opetator, right) {
        this.type = 'BinaryExpression';
        this.loc = loc;
        this.left = left;
        this.operator = opetator;
        this.right = right;

    }
}

class CallExpression {
    constructor(loc, callee, args = []) {
        this.type = 'CallExpression';
        this.loc = loc;
        this.callee = callee;
        this.args = args;
    }
}

class Literal {
    constructor(loc, value) {
        this.type = 'Literal';
        this.loc = loc;
        this.value = value;
    }
}

class SymbolTableItem{
    constructor(op, arg1, arg2, result){
        this.op = op;
        this.arg1 = arg1;
        this.arg2 = arg2;
        this.result = result;
    }
}





function getLoc(symbols) {
    let loc = {};
    loc.start = symbols[0].loc.start;
    loc.end = symbols[symbols.length - 1].loc.end;
    return loc;
}


let actionFunctions = [];

//////////////////////////////////////////////////////////////
//Program
actionFunctions['Program'] = [];
actionFunctions['Program'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const body = symbols[0].nodes;

    let symbol = {};
    symbol.loc = loc;

    symbol.node = new Program(loc, body);

    return symbol;
}

//////////////////////////////////////////////////////////////
//Declarations
actionFunctions['Declarations'] = [];
actionFunctions['Declarations'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);

    return symbol;
}
actionFunctions['Declarations'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);
    symbols[1].nodes.forEach(n => {
        symbol.nodes.push(n);
    });

    return symbol;
}
//////////////////////////////////////////////////////////////
//Declaration
actionFunctions['Declaration'] = [];
for (let i = 0; i < 2; i++) {
    actionFunctions['Declaration'][i] = function (symbols) {
        const loc = getLoc(symbols);


        let symbol = {};
        symbol.loc = loc;

        symbol.node = symbols[0].node;

        return symbol;
    }
}

//////////////////////////////////////////////////////////////
//VariableDeclaration
actionFunctions['VariableDeclaration'] = [];
actionFunctions['VariableDeclaration'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const id = symbols[1].node;
    const kind = symbols[0].value;

    let symbol = {};
    symbol.loc = loc;

    symbol.node = new VariableDeclaration(loc, id, kind);

    return symbol;
}

//////////////////////////////////////////////////////////////
//FunctionDeclaration
actionFunctions['FunctionDeclaration'] = [];
for (let i = 0; i < 2; i++) {
    actionFunctions['FunctionDeclaration'][i] = function (symbols) {
        const loc = getLoc(symbols);
        const id = symbols[1].node;
        const kind = symbols[0].value;
        const params = symbols[3].nodes;
        const body = symbols[5].node;


        let symbol = {};
        symbol.loc = loc;


        symbol.node = new FunctionDeclaration(loc, id, kind, params, body);

        return symbol;
    }
}


//////////////////////////////////////////////////////////////
//FormalParamList
actionFunctions['FormalParamList'] = [];
actionFunctions['FormalParamList'][0] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];
    symbols[0].nodes.forEach(n => {
        symbol.nodes.push(n);
    });

    return symbol;
}
actionFunctions['FormalParamList'][1] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];

    return symbol;
}

//////////////////////////////////////////////////////////////
//FormalParams
actionFunctions['FormalParams'] = [];
actionFunctions['FormalParams'][0] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);

    return symbol;
}
actionFunctions['FormalParams'][1] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;

    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);

    symbols[2].nodes.forEach(n => {
        symbol.nodes.push(n);
    });

    return symbol;
}

//////////////////////////////////////////////////////////////
//Param
actionFunctions['Param'] = [];
actionFunctions['Param'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const id = symbols[1].node
    const kind = symbols[0].value;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new Param(loc, id, kind);

    return symbol;
}
//////////////////////////////////////////////////////////////
//BlockStatement
actionFunctions['BlockStatement'] = [];
actionFunctions['BlockStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const body = [];
    for (let i = 0; i < symbols[1].nodes.length; i++) {
        body.push(symbols[1].nodes[i]);
    }
    for (let i = 0; i < symbols[2].nodes.length; i++) {
        body.push(symbols[2].nodes[i]);
    }

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BlockStatement(loc, body);

    return symbol;
}
actionFunctions['BlockStatement'][1] = function (symbols) {
    const loc = getLoc(symbols);
    const body = [];
    for (let i = 0; i < symbols[1].nodes.length; i++) {
        body.push(symbols[1].nodes[i]);
    }

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BlockStatement(loc, body);

    return symbol;
}

//////////////////////////////////////////////////////////////
//VariableDeclarations
actionFunctions['VariableDeclarations'] = [];
actionFunctions['VariableDeclarations'][0] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);

    return symbol;
}
actionFunctions['VariableDeclarations'][1] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [symbols[0].node];

    symbols[1].nodes.forEach(n => {
        symbol.nodes.push(n);
    });
    return symbol;
}

//////////////////////////////////////////////////////////////
//ExpressionStatements
actionFunctions['ExpressionStatements'] = [];
actionFunctions['ExpressionStatements'][0] = function (symbols) {
    const loc = getLoc(symbols);


    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [];
    symbol.nodes.push(symbols[0].node);

    return symbol;
}

actionFunctions['ExpressionStatements'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [symbols[0].node];
    symbols[1].nodes.forEach(n => {
        symbol.nodes.push(n);
    });

    return symbol;
}

//////////////////////////////////////////////////////////////
//ExpressionStatement
actionFunctions['ExpressionStatement'] = [];
for (let i = 0; i < 4; i++) {
    actionFunctions['ExpressionStatement'][i] = function (symbols) {
        const loc = getLoc(symbols);
        const expression = symbols[0].node;

        let symbol = {};
        symbol.loc = loc;
        symbol.node = new ExpressionStatement(loc, expression);

        return symbol;
    }
}

//////////////////////////////////////////////////////////////
//AssignStatement
actionFunctions['AssignStatement'] = [];
actionFunctions['AssignStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const left = symbols[0].node;
    const right = symbols[2].node;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new AssignStatement(loc, left, right);

    return symbol;
}

//////////////////////////////////////////////////////////////
//ReturnStatement
actionFunctions['ReturnStatement'] = [];
actionFunctions['ReturnStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new ReturnStatement(loc, null);

    return symbol;
}

actionFunctions['ReturnStatement'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new ReturnStatement(loc, symbols[1].node);

    return symbol;
}

//////////////////////////////////////////////////////////////
//WhileStatement
actionFunctions['WhileStatement'] = [];
actionFunctions['WhileStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const test = symbols[2].node;
    const body = symbols[4].node;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new WhileStatement(loc, test, body);

    return symbol;
}

//////////////////////////////////////////////////////////////
//IfStatement
actionFunctions['IfStatement'] = [];
actionFunctions['IfStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const test = symbols[2].node;
    const consequent = symbols[4].node;
    const alternate = symbols[5].node;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new IfStatement(loc, test, consequent, alternate);

    return symbol;
}



//////////////////////////////////////////////////////////////
//ElseStatement
actionFunctions['ElseStatement'] = [];
actionFunctions['ElseStatement'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = null;

    return symbol;
}

actionFunctions['ElseStatement'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[1].node;

    return symbol;
}

//////////////////////////////////////////////////////////////
//Expression
actionFunctions['Expression'] = [];
actionFunctions['Expression'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[0].node;

    return symbol;
}

actionFunctions['Expression'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BinaryExpression(loc, symbols[0].node, symbols[1].value, symbols[2].node);

    return symbol;
}

//////////////////////////////////////////////////////////////
//Relop
actionFunctions['Relop'] = [];
for (let i = 0; i < 6; i++) {
    actionFunctions['Relop'][i] = function (symbols) {
        const loc = getLoc(symbols);

        let symbol = {};
        symbol.loc = loc;
        symbol.value = symbols[0].value;

        return symbol;
    }
}



//////////////////////////////////////////////////////////////
//AddExpression
actionFunctions['AddExpression'] = [];
actionFunctions['AddExpression'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[0].node;

    return symbol;
}

actionFunctions['AddExpression'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BinaryExpression(loc, symbols[0].node, '+', symbols[2].node);

    return symbol;
}

actionFunctions['AddExpression'][2] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BinaryExpression(loc, symbols[0].node, '-', symbols[2].node);

    return symbol;
}

//////////////////////////////////////////////////////////////
//Item
actionFunctions['Item'] = [];
actionFunctions['Item'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[0].node;

    return symbol;
}

actionFunctions['Item'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BinaryExpression(loc, symbols[0].node, '*', symbols[2].node);

    return symbol;
}

actionFunctions['Item'][2] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new BinaryExpression(loc, symbols[0].node, '/', symbols[2].node);

    return symbol;
}

//////////////////////////////////////////////////////////////
//Factor
actionFunctions['Factor'] = [];
actionFunctions['Factor'][0] = function (symbols) {
    const loc = getLoc(symbols);

    const value = symbols[0].value;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new Literal(loc, value);
    return symbol;
}

actionFunctions['Factor'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[1].node;

    return symbol;
}

actionFunctions['Factor'][2] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[0].node;

    return symbol;
}

actionFunctions['Factor'][3] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = symbols[0].node;

    return symbol;
}

//////////////////////////////////////////////////////////////
//CallExpression
actionFunctions['CallExpression'] = [];
actionFunctions['CallExpression'][0] = function (symbols) {
    const loc = getLoc(symbols);
    const callee = symbols[0].node;
    const args = symbols[2].nodes;

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new CallExpression(loc, callee, args);
    return symbol;
}

//////////////////////////////////////////////////////////////
//ActualParamList
actionFunctions['ActualParamList'] = [];
actionFunctions['ActualParamList'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = symbols[0].nodes;
    return symbol;
}
actionFunctions['ActualParamList'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = null;
    return symbol;
}

//////////////////////////////////////////////////////////////
//ActualParams
actionFunctions['ActualParams'] = [];
actionFunctions['ActualParams'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [symbols[0].node];
    return symbol;
}
actionFunctions['ActualParams'][1] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.nodes = [symbols[0].node];
    symbols[2].nodes.forEach(n => {
        symbol.nodes.push(n);
    });

    return symbol;
}

//////////////////////////////////////////////////////////////
//ID
actionFunctions['ID'] = [];
actionFunctions['ID'][0] = function (symbols) {
    const loc = getLoc(symbols);

    let symbol = {};
    symbol.loc = loc;
    symbol.node = new Identifier(loc, symbols[0].value);
    return symbol;
}




module.exports = actionFunctions;
