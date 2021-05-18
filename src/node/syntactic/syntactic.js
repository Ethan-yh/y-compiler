
const Lex = require('../lexical/lex');
const Semantic = require('../semantic/semantic');
// const { parse } = require("@babel/parser");
const generate = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;
const { Err, ErrWithLoc } = require('../utils/err.js');

/**
 * 语法分析类
 */
class Syntactic {
    constructor(productionsLines = []) {
        /**
         * 产生式文本行
         */
        this.productionsLines = productionsLines;

        /**
         * 产生式文本行，每行只有一个产生式
         */
        this.productionsLinesOne = [];

        /**
         * 产生式
         * [{left:产生式左端, right:[]}, ...]
         */
        this.productions = [];

        /**
         * first集合
         */
        this.firstSet = {};

        /**
         * follow集合
         */
        this.followSet = {};

        /**
         * LR0项目
         * [{proNum:产生式序号, pointPos:小圆点位置(0-产生式右部长度)}, ...]
         */
        this.LR0Items = [];

        /**
         * 项目集规范族
         */
        this.normalFamily = [];

        /**
         * action-goto表
         */
        this.actionGotoTable = new ActionGotoTable();

        /**
         * 语法分析准备的返回结果
         */
        try {
            this.preForSyntacticAnalyzer();
            this.status = { isRdy: true };
        } catch (err) {
            this.status = { isRdy: false, err: err };
        }


        /**
         * 记录抽象语法树
         */
        this.ast = {};
    }

    /**
     * 判断是否终结符
     * @param {string}symbol
     * @return {boolean}
     */
    isTerminalSymbol(symbol) {
        if (symbol.length == 0) {
            return true;
        }
        if (symbol[0] >= 'A' && symbol[0] <= 'Z') {
            return false;
        }
        return true;
    }

    /**
     * 产生产生式
     * @return promise
     */
    genProductions() {
        for (let i = 0; i < this.productionsLines.length; i++) {
            const line = this.productionsLines[i];
            if (line.length <= 0) {
                continue;
            }
            const leftPos = line.search('->');

            // 没有->，则直接返回
            if (leftPos < 0) {
                // console.log('error,某行产生式没有->');
                throw new Err(`GrammarError: 第${i}行产生式没有->符号`)

                // return reject({ errType: 'gramErr', errMsg: `文法错误：第${i}行产生式没有->符号` });

            }
            const left = line.substring(0, leftPos);

            // 产生式右边部分
            const lineRightPart = line.substring(leftPos + 2);
            // console.log(lineRightPart);
            const rightsStr = lineRightPart.split('|');

            rightsStr.forEach((rightStr, index) => {
                const right = rightStr.split(' ');
                this.productions.push({
                    left: left,
                    right: right,
                    rightNum: index
                });
                this.productionsLinesOne.push(left + '->' + rightStr);
            });

        }
        return true;
    }

    /**
     * 检查产生式合法性
     */
    checkProductions() {
        for (let i = 0; i < this.productions.length; i++) {
            for (let j = 0; j < this.productions[i].right.length; j++) {
                const symbol = this.productions[i].right[j];
                // 如果是非终结符，但是没有该非终结符的产生式，则产生式不合法
                if (!this.isTerminalSymbol(symbol)) {
                    let existFlag = false;
                    for (let k = 0; k < this.productions.length; k++) {
                        if (this.productions[k].left == symbol) {
                            existFlag = true;
                            break;
                        }
                    }
                    if (!existFlag) {
                        throw new Err(`GrammarError: 非终结符${symbol}没有产生式`);
                        // return reject({ errType: 'gramErr', errMsg: `文法错误：非终结符${symbol}没有产生式` });
                    }
                }
                if (symbol == this.productions[0].left) {
                    throw new Err(`GrammarError: 第一行产生式不是起始产生式`);
                    // return reject({ errType: 'gramErr', errMsg: '文法错误：第一行产生式不是起始产生式' });
                }
            }
        }
        return true;

    }

    /**
     * 产生First集合
     */
    genFirstSet() {
        this.productions.forEach(production => {
            const left = production.left;
            if (!this.firstSet[left]) {
                this.firstSet[left] = [];
            }
            if (production.right.indexOf('$') >= 0) {
                this.firstSet[left].push('$');
            }
        });
        while (true) {
            let isChange = false;
            for (let i = 0; i < this.productions.length; i++) {
                const production = this.productions[i];
                const left = production.left;
                for (let j = 0; j < production.right.length; j++) {
                    const rightSymbol = production.right[j];

                    if (rightSymbol == '$') {
                        break;
                    }

                    // 终结符情况
                    if (this.isTerminalSymbol(rightSymbol)) {
                        if (this.firstSet[left].indexOf(rightSymbol) < 0) {
                            this.firstSet[left].push(rightSymbol);
                            isChange = true;
                        }
                        break;
                    }

                    // 非终结符情况
                    for (let k = 0; k < this.firstSet[rightSymbol].length; k++) {
                        const rightProSymbol = this.firstSet[rightSymbol][k];
                        if (rightProSymbol != '$' && this.firstSet[left].indexOf(rightProSymbol) < 0) {
                            this.firstSet[left].push(rightProSymbol);
                            isChange = true;
                        }
                    }

                    if (this.firstSet[rightSymbol].indexOf('$') < 0) {
                        break;
                    }

                    if (j + 1 == production.right.length && this.firstSet[left].indexOf('$') < 0) {
                        this.firstSet[left].push('$');
                        isChange = true;
                    }

                }
            }
            if (!isChange) {
                break;
            }
        }
    }

    /**
     * 产生连续符号的First集合
     * @param {array}symbols
     * @return {array}first集合
     */
    genSymbolsFirstSet(symbols) {
        let firstSet = [];

        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];

            // 若是终结符，则加入first集合后直接结束
            if (this.isTerminalSymbol(symbol)) {
                firstSet.push(symbol);
                break;
            }

            for (let j = 0; j < this.firstSet[symbol].length; j++) {
                const firstSymbol = this.firstSet[symbol][j];
                if (firstSymbol != '$' && firstSet.indexOf(firstSymbol) < 0) {
                    firstSet.push(firstSymbol);
                }
            }

            // 当前符号的first集合没有$，则结束
            if (this.firstSet[symbol].indexOf('$') < 0) {
                break;
            }

            if (i + 1 == symbols.length && firstSet.indexOf('$') < 0) {
                firstSet.push('$');
            }
        }
        return firstSet;
    }

    /**
     * 产生Follow集合
     */
    genFollowSet() {
        this.productions.forEach(production => {
            const left = production.left;
            if (!this.followSet[left]) {
                this.followSet[left] = [];
            }
        });
        this.followSet[this.productions[0].left].push('#');

        while (true) {
            let isChange = false;
            for (let i = 0; i < this.productions.length; i++) {
                const production = this.productions[i];
                const left = production.left;
                for (let j = 0; j < production.right.length; j++) {
                    const rightSymbol = production.right[j];

                    // 终结符直接跳过
                    if (this.isTerminalSymbol(rightSymbol)) {
                        continue;
                    }

                    // 求当前符号右侧符号串的first集合，满足要求则加入到follow集合中
                    const symbolsFirstSet = this.genSymbolsFirstSet(production.right.slice(j + 1));
                    for (let k = 0; k < symbolsFirstSet.length; k++) {
                        if (symbolsFirstSet[k] != '$' && this.followSet[rightSymbol].indexOf(symbolsFirstSet[k]) < 0) {
                            this.followSet[rightSymbol].push(symbolsFirstSet[k]);
                            isChange = true;
                        }
                    }

                    // 当前符号右侧符号串的first集合为空或含$，则将产生式左部的follow集合加入到当前符号follow集合中
                    if (symbolsFirstSet.length <= 0 || symbolsFirstSet.indexOf('$') >= 0) {
                        for (let k = 0; k < this.followSet[left].length; k++) {

                            if (this.followSet[rightSymbol].indexOf(this.followSet[left][k]) < 0) {
                                this.followSet[rightSymbol].push(this.followSet[left][k]);
                                isChange = true;
                            }
                        }
                    }

                }
            }
            if (!isChange) {
                break;
            }
        }
    }

    /**
     * 产生LR(0)项目
     */
    genLR0Items() {
        for (let i = 0; i < this.productions.length; i++) {
            const production = this.productions[i];

            // 若产生式右部为$，则圆点位置设置为-1
            if (production.right == '$') {
                this.LR0Items.push({
                    proNum: i,
                    pointPos: -1
                });
                continue;
            }

            const rightLength = production.right.length;
            for (let j = 0; j <= rightLength; j++) {
                this.LR0Items.push({
                    proNum: i,
                    pointPos: j
                });
            }
        }
    }

    /**
     * 产生某个项目的闭包集合
     * @param {{proNum:number, pointPos:number}}LR0Item LR0项目
     * @return {array}项目集合
     */
    genLR0ItemClosureSet(LR0Item) {
        let itemStack = [];//暂存栈
        let closureSet = [];//返回的闭包集合
        itemStack.push(LR0Item);

        while (itemStack.length) {
            // 从栈中取出一个item
            const item = itemStack.pop();
            // 放入闭包集合中
            closureSet.push(item);

            // 空串项目跳过
            if (item.pointPos == -1) {
                continue;
            }

            // 规约项目跳过
            if (item.pointPos == this.productions[item.proNum].right.length) {
                continue;
            }

            // 圆点后为终结符跳过
            if (this.isTerminalSymbol(this.productions[item.proNum].right[item.pointPos])) {
                continue;
            }

            // 现在圆点后只能为非终结符
            const currentSymbol = this.productions[item.proNum].right[item.pointPos];
            for (let i = 0; i < this.LR0Items.length; i++) {
                const t = this.LR0Items[i];
                if (this.productions[t.proNum].left == currentSymbol && (t.pointPos == 0 || t.pointPos == -1)) {
                    if (closureSet.indexOf(t) < 0) {
                        itemStack.push(t);
                    }
                }
            }

        }
        return closureSet;
    }

    /**
     * 产生某个项目集的闭包集合
     * @param {array}LR0Items LR0项目集
     * @return {array}项目集合
     */
    genLR0ItemsClosureSet(LR0Items) {
        let itemStack = [];//暂存栈
        let closureSet = [];//返回的闭包集合
        LR0Items.forEach(LR0Item => {
            itemStack.push(LR0Item);
        });

        while (itemStack.length) {
            // 从栈中取出一个item
            const item = itemStack.pop();
            // 放入闭包集合中
            closureSet.push(item);

            // 空串项目跳过
            if (item.pointPos == -1) {
                continue;
            }

            // 规约项目跳过
            if (item.pointPos == this.productions[item.proNum].right.length) {
                continue;
            }

            // 圆点后为终结符跳过
            if (this.isTerminalSymbol(this.productions[item.proNum].right[item.pointPos])) {
                continue;
            }

            // 现在圆点后只能为非终结符
            const currentSymbol = this.productions[item.proNum].right[item.pointPos];
            for (let i = 0; i < this.LR0Items.length; i++) {
                const t = this.LR0Items[i];
                if (this.productions[t.proNum].left == currentSymbol && (t.pointPos == 0 || t.pointPos == -1)) {
                    if (closureSet.indexOf(t) < 0) {
                        itemStack.push(t);
                    }
                }
            }

        }
        return closureSet;
    }

    /**
     * 产生项目集规范族
     */
    genNormalFamilySet() {
        // 将起始符号的Closure作为第0个项目集规范族
        let itemsStack = [];//itemsStack = [[LR0Item1, LR0Item2, ...], [], ...]
        itemsStack.push(this.genLR0ItemClosureSet(this.LR0Items[0]));
        this.normalFamily.push(itemsStack[0]);

        while (itemsStack.length) {
            // 取出一个项目集规范族
            const normalItems = itemsStack.pop();
            const currentState = this.indexNormalFamily(normalItems);

            for (let i = 0; i < normalItems.length; i++) {
                const normalItem = normalItems[i];
                // 规约项目
                if (normalItem.pointPos == -1 || normalItem.pointPos == this.productions[normalItem.proNum].right.length) {
                    const left = this.productions[normalItem.proNum].left;
                    for (let j = 0; j < this.followSet[left].length; j++) {
                        const followSymbol = this.followSet[left][j];

                        // 若不存在映射
                        if (!this.actionGotoTable.find(currentState, followSymbol)) {
                            this.actionGotoTable.insert(currentState, followSymbol, { op: SLR_OP.CONCLUDE, statePro: normalItem.proNum });
                        }
                        // 若已存在映射
                        else {
                            if (JSON.stringify(this.actionGotoTable.value[currentState][followSymbol]) != JSON.stringify({ op: SLR_OP.CONCLUDE, statePro: normalItem.proNum })) {
                                throw new Err(`GrammarError: 不是SLR文法。错误symbol:${followSymbol}`);
                                // return {
                                //     isSucc: false,
                                //     errType: 'gramErr',
                                //     msg: `文法错误：不是SLR文法。错误symbol:${followSymbol}`
                                // };
                                // return reject({ errType: 'gramErr', errMsg: `文法错误：不是SLR文法。${followSymbol}` });
                            }
                        }
                    }
                }
                else {
                    // 产生式右部圆点位置符号
                    const currentRightSymbol = this.productions[normalItem.proNum].right[normalItem.pointPos];
                    let itemsAccSameSym = [];//接受相同字符的item集合
                    for (let j = 0; j < normalItems.length; j++) {
                        const t = normalItems[j];
                        if (t.pointPos == -1 || t.pointPos == this.productions[t.proNum].right.length) {
                            continue;
                        }
                        if (this.productions[normalItem.proNum].right[normalItem.pointPos] ==
                            this.productions[t.proNum].right[t.pointPos]) {
                            itemsAccSameSym.push(this.getNextPointPosLR0Item(t));
                        }
                    }

                    const nextNormalFamily = this.genLR0ItemsClosureSet(itemsAccSameSym);

                    if (this.indexNormalFamily(nextNormalFamily) < 0) {
                        this.normalFamily.push(nextNormalFamily);
                        itemsStack.push(nextNormalFamily);
                    }

                    const nextState = this.indexNormalFamily(nextNormalFamily);
                    if (!this.actionGotoTable.find(currentState, currentRightSymbol)) {
                        this.actionGotoTable.insert(currentState, currentRightSymbol, { op: SLR_OP.MOVE, statePro: nextState });
                    }
                    else {
                        if (JSON.stringify(this.actionGotoTable.value[currentState][currentRightSymbol]) != JSON.stringify({ op: SLR_OP.MOVE, statePro: nextState })) {
                            throw new Err(`GrammarError: 不是SLR文法。错误symbol:${currentRightSymbol}`);
                            // return {
                            //     isSucc: false,
                            //     errType: 'gramErr',
                            //     msg: `文法错误：不是SLR文法。错误symbol:${currentRightSymbol}`
                            // };
                            // reject({ errType: 'gramErr', errMsg: `文法错误：不是SLR文法${currentRightSymbol}` });
                        }
                    }
                }
            }

        }

        let currentState2 = -1;
        for (let i = 0; i < this.normalFamily.length; i++) {
            for (let j = 0; j < this.normalFamily[i].length; j++) {
                if (JSON.stringify({ proNum: 0, pointPos: 1 }) == JSON.stringify(this.normalFamily[i][j])) {
                    currentState2 = i;
                    break;
                }
            }
            if (currentState2 >= 0) {
                break;
            }
        }
        this.actionGotoTable.value[currentState2]['#'] = { op: SLR_OP.ACC, statePro: currentState2 };

        return true;
    }

    /**
     * 判断两个closureSet是否相等(js数组无法直接比较是否相等)
     * @param {array}closureSet1
     * @param {array}closureSet2
     * @return {boolean}
     */
    isEqualclosureSet(closureSet1, closureSet2) {
        function comp(a, b) {
            if (a.proNum != b.proNum) {
                return a.proNum - b.proNum;
            }
            return a.pointPos - b.pointPos;
        }
        const t1 = closureSet1.sort(comp);
        const t2 = closureSet2.sort(comp);
        return JSON.stringify(t1) == JSON.stringify(t2);
    }

    /**
     * 索引规范族中的closureSet
     * @param {array}closureSet
     * @return {number}索引值，没有则为-1
     */
    indexNormalFamily(closureSet) {
        for (let i = 0; i < this.normalFamily.length; i++) {
            if (this.isEqualclosureSet(this.normalFamily[i], closureSet)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 求某个LR0项目圆点右移一位的项目
     * @param {object}LR0Item
     * @return {object}LR0Item
     */
    getNextPointPosLR0Item(LR0Item) {
        for (let i = 0; i < this.LR0Items.length; i++) {
            if (this.LR0Items[i].proNum == LR0Item.proNum && this.LR0Items[i].pointPos - LR0Item.pointPos == 1) {
                return this.LR0Items[i];
            }
        }
        return null;
    }

    /**
     * 语法分析准备，即建立必要的集合
     */
    preForSyntacticAnalyzer() {
        // 若没有初始化产生式，则读默认产生式
        if (!this.productionsLines.length) {
            const grammar = require('./grammar3.json');
            this.productionsLines = grammar.productionsLines;
        }

        // 产生产生式
        this.genProductions();

        // 检查产生式
        this.checkProductions();

        // 产生First集合
        this.genFirstSet();

        // 产生Follow集合
        this.genFollowSet();

        // 产生LR0项目
        this.genLR0Items();

        // 产生项目集规范族
        this.genNormalFamilySet();

        // // 产生产生式
        // let res;
        // res = this.genProductions();
        // if (!res.isSucc) {
        //     return res;
        // }

        // // 检查产生式
        // res = this.checkProductions();
        // if (!res.isSucc) {
        //     return res;
        // }

        // // 产生First集合
        // this.genFirstSet();

        // // 产生Follow集合
        // this.genFollowSet();

        // // 产生LR0项目
        // this.genLR0Items();

        // // 产生项目集规范族
        // res = this.genNormalFamilySet();
        // if (!res.isSucc) {
        //     return res;
        // }

        // return { isSucc: true };

        // try {
        //     if (!this.productionsLines) {
        //         const grammar = require('./grammar.json');
        //         this.productionsLines = grammar.productionsLines;
        //     }
        //     await this.genProductions();
        //     await this.checkProductions();
        //     this.genFirstSet();
        //     this.genFollowSet();
        //     this.genLR0Items();
        //     await this.genNormalFamilySet();
        //     this.preFlag = true;
        // } catch (err) {
        //     throw err;
        // }
    }

    /**
     * 开始语法分析
     * @param {string}code
     */
    startAnalize(code) {

        // 进行准备工作
        let lex = new Lex(code);
        let semantic = new Semantic();
        if (!this.status.isRdy) {
            throw this.status.err;
        }
        // if (!this.preRes.isSucc) {
        //     return this.preRes;
        // }
        // 进行初始化工作
        let analizeProcess = [];//存放移进规约过程
        let stateStack = [];//状态栈
        let astNodeStack = [];//ast结点栈
        let cstNodeStack = [];//cst结点栈
        let symbolStack = [];//符号栈
        stateStack.push(0);
        astNodeStack.push({ value: '#', loc: null });
        cstNodeStack.push({ name: '#' });
        symbolStack.push('#');

        let word;
        let nextWord = lex.getNextToken();
        let words = [];
        while (true) {

            word = nextWord;
            nextWord = lex.getNextToken();
            words.push(word);

            while (true) {
                // 取栈顶符号
                const currentState = stateStack[stateStack.length - 1];
                if (!this.actionGotoTable.find(currentState, word.type)) {
                    console.log(word);
                    throw new ErrWithLoc('SyntaxError: Unexpected token', word.loc);
                    // return {
                    //     isSucc: false,
                    //     errType: 'synErr',
                    //     msg: '语法错误',
                    //     errWord: word,
                    //     analizeProcess: analizeProcess
                    // };
                }

                // 移进
                if (this.actionGotoTable.value[currentState][word.type].op == SLR_OP.MOVE) {

                    const nextState = this.actionGotoTable.value[currentState][word.type].statePro;
                    stateStack.push(nextState);
                    astNodeStack.push({ value: word.value, loc: word.loc });
                    cstNodeStack.push({ name: word.value });
                    symbolStack.push(word.type);
                    analizeProcess.push({
                        action: '移进',
                        stateStack: stateStack.slice(),
                        symbolStack: symbolStack.slice(),
                        nextWord: nextWord
                    });
                    break;
                }

                // 规约
                else if (this.actionGotoTable.value[currentState][word.type].op == SLR_OP.CONCLUDE) {

                    const proNum = this.actionGotoTable.value[currentState][word.type].statePro;
                    let productionLen;
                    if (this.productions[proNum].right[0] == '$') {
                        productionLen = 0;
                    } else {
                        productionLen = this.productions[proNum].right.length;
                    }
                    const popAstNodes = astNodeStack.slice(astNodeStack.length - productionLen);
                    // const astNodeStackItem = actionFunctions[this.productions[proNum].left][this.productions[proNum].rightNum](popAstNodes);
                    const semanticResult = semantic.startAnalize(this.productions[proNum].left, this.productions[proNum].rightNum, popAstNodes);
                    // console.log(semanticResult)
                    if (!semanticResult.isSucc) {
                        throw new ErrWithLoc(`SemError: ${semanticResult.msg}`, semanticResult.errWord.loc);
                        // return {
                        //     isSucc: false,
                        //     errType:'semErr',
                        //     msg: semanticResult.msg,
                        //     errWord: semanticResult.errWord
                        // };
                    }

                    const popCstNodes = cstNodeStack.slice(cstNodeStack.length - productionLen);
                    // 弹出
                    for (let i = 0; i < productionLen; i++) {
                        stateStack.pop();
                        astNodeStack.pop();
                        cstNodeStack.pop();
                        symbolStack.pop();
                    }

                    cstNodeStack.push({ name: this.productions[proNum].left, children: popCstNodes });
                    astNodeStack.push(semanticResult.symbol);
                    symbolStack.push(this.productions[proNum].left);

                    const newCurrentState = stateStack[stateStack.length - 1];
                    if (!this.actionGotoTable.find(newCurrentState, this.productions[proNum].left)) {
                        console.log(word);
                        throw new ErrWithLoc('SyntaxError: Unexpected token', word.loc);
                        // return {
                        //     isSucc: false,
                        //     errType: 'synErr',
                        //     msg: '语法错误',
                        //     errWord: word,
                        //     analizeProcess: analizeProcess
                        // };
                    }

                    stateStack.push(this.actionGotoTable.value[newCurrentState][this.productions[proNum].left].statePro);

                    analizeProcess.push({
                        action: `规约,${this.productionsLinesOne[proNum]}`,
                        stateStack: stateStack.slice(),
                        symbolStack: symbolStack.slice(),
                        nextWord: word
                    });
                }
                // 接受
                else if (this.actionGotoTable.value[currentState][word.type].op == SLR_OP.ACC) {
                    analizeProcess.push({
                        action: '接受',
                        stateStack: stateStack.slice(),
                        symbolStack: symbolStack.slice(),
                        nextWord: null
                    });
                    // 使用产生式0规约
                    const popAstNodes = [astNodeStack.pop()];
                    const semanticResult = semantic.startAnalize(this.productions[0].left, this.productions[0].rightNum, popAstNodes);
                    if (!semanticResult.isSucc) {
                        throw new ErrWithLoc(`SemError: ${semanticResult.msg}`, semanticResult.errWord.loc)
                        // return {
                        //     isSucc: false,
                        //     errType:'semErr',
                        //     msg: semanticResult.msg,
                        //     errWord: semanticResult.errWord
                        // };
                    }
                    astNodeStack.push(semanticResult.symbol);

                    const popCstNodes = [cstNodeStack.pop()];
                    cstNodeStack.push({ name: this.productions[0].left, children: popCstNodes });

                    this.ast = astNodeStack[1].node;
                    return {
                        isSucc: true,
                        msg: '语法语义分析成功',
                        words: words,
                        analizeProcess: analizeProcess,
                        cst: cstNodeStack[1],
                        ast: astNodeStack[1].node,
                        mid_code: semantic.quadruples,
                        symbolTables: semantic.symbolTables
                    };
                }
                else {
                    console.log(word);
                    throw new ErrWithLoc('SyntaxError: Unexpected token', word.loc);
                    // return {
                    //     isSucc: false,
                    //     errType: 'synErr',
                    //     msg: '语法错误',
                    //     errWord: word,
                    //     analizeProcess: analizeProcess
                    // };
                }
            }
        }

    }

    /**
     * 转js代码
     * @return {string}code
     */
    likec2js() {
        // 遍历，将变量类型改为var
        traverse({ type: 'File', program: this.ast }, {
            VariableDeclaration: function (path) {
                path.node.kind = "var";
            }
        });

        // 生成js代码
        return generate(this.ast).code;
    }
}

/** action-goto表类 */
class ActionGotoTable {
    constructor(value = []) {
        this.value = value;
    }
    insert(state, symbol, op_statePro) {
        if (!this.value[state]) {
            this.value[state] = [];
        }
        this.value[state][symbol] = op_statePro;
    }
    find(state, symbol) {
        if (!this.value[state]) {
            return false;
        }
        if (!this.value[state][symbol]) {
            return false;
        }
        return true;
    }
}

/** SLR动作 */
const SLR_OP = {
    CONCLUDE: 'CONCLUDE',
    MOVE: 'MOVE',
    ACC: 'ACC',
    PUSHNT: 'PUSHNT',
    ERR: 'ERR'
}

module.exports = Syntactic;






