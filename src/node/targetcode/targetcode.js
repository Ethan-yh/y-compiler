// 汇编代码项
class ASMCode {
    constructor(op, arg1, arg2) {
        this.op = op;
        this.arg1 = arg1;
        this.arg2 = arg2;
    }
}

class TargetCode {
    constructor() {
        this.symbolTables = {};
        this.tempVarMap = {};
        this.freeReg = ['%edx', '%ecx'];
        this.freeRegP = 0;
        this.curFuncAsmStart = 0;
        this.LCtemp = 0;
        this.op2asm = {
            '+': 'addl',
            '-': 'subl',
            '*': 'imull',
            '/': 'idivl',
            '<': 'setl',
            '<=': 'setle',
            '>': 'setg',
            '>=': 'setge',
            '==': 'sete',
            '!=': 'setne',
            'j=': 'je',
            'j>': 'jg',
            'j>=': 'jge',
            'j<': 'jl',
            'j<=': 'jle',
            'j!=': 'jne'
        }
    }

    newTempLC() {
        let temp = 'LC' + this.LCtemp;
        this.LCtemp++;
        return temp;
    }

    isVariable(name) {
        if ((name[0] >= 'a' && name[0] <= 'z' || name[0] >= 'A' && name[0] <= 'Z') && name.indexOf('[') == -1) {
            return 1;
        }
        return 0;
    }
    isArray(name) {
        if (name.indexOf('[') > -1) {
            return 1;
        }
        return 0;
    }
    isNum(name) {
        if (name[0] >= 0 && name[0] <= 9) {
            return 1;
        }
        return 0;
    }
    isTemp(name) {
        if (name[0] == '_' && name[1] == 'T') {
            return 1;
        }
        return 0;
    }
    isRtn(name) {
        if (name[0] == '_' && name[1] == 'R') {
            return 1;
        }
        return 0;
    }
    isString(name) {
        if (name[0] == '"') {
            return 1;
        }
        return 0;
    }
    isAddr(name) {
        if (name[0] == '&') {
            return 1;
        }
        return 0;
    }

    getArg(arg, tP) {
        let rtn;
        if (this.isVariable(arg)) {
            const memNo = this.symbolTables.searchSymbolMem(arg, 'variable', tP);
            if (memNo) {
                rtn = memNo * 4 + '(%ebp)'
            } else {
                rtn = arg;
            }

        }
        else if (this.isAddr(arg)) {
            const memNo = this.symbolTables.searchSymbolMem(arg.replace('&', ''), 'variable', tP);
            if (memNo) {
                rtn = memNo * 4 + '(%ebp)'
            } else {
                rtn = arg;
            }
        }
        else if (this.isArray(arg)) {
            const t = arg.split('[');

            const varName = t[0];
            const tempName = t[1].split(']')[0];
            const memNo = this.symbolTables.searchSymbolMem(varName, 'variable', tP);

            if (memNo) {
                rtn = memNo * 4 + '(%ebp,' + this.tempVarMap[tempName] + ')';
            } else {
                rtn = varName + '(' + this.tempVarMap[tempName] + ')';
            }

        }
        else if (this.isNum(arg)) {
            rtn = '$' + arg;
        }
        else if (this.isTemp(arg)) {
            rtn = this.tempVarMap[arg];
        }
        else {
            rtn = '%eax';
        }
        return rtn;
    }

    getASMText(asmCodes) {
        let asmText = '';
        for (let i in asmCodes) {
            let text = '';
            text += asmCodes[i].op;
            if (asmCodes[i].arg1 != '-') {
                text += ' ' + asmCodes[i].arg1;
            }
            if (asmCodes[i].arg2 != '-') {
                text += ',' + asmCodes[i].arg2;
            }
            asmText += text + '\n';
            console.log(text);
        }
        return asmText;
    }

    /**
     * 产生目标代码
     * @param {array}quadruples
     */
    getTargetCode(quadruples, symbolTables) {
        let curFunc = null;
        const asmCodes = [];
        this.symbolTables = symbolTables;
        for (let i in quadruples) {
            const quadruple = quadruples[i];
            const op = quadruple.op;
            if (quadruple.label) {
                asmCodes.push(new ASMCode(quadruple.label + ':', '-', '-'));
            }
            if (op == '+' || op == '-' || op == '*' || op == '/') {
                // 取两个操作数在x86代码中的寄存器
                let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                let arg2Item = this.getArg(quadruple.arg2, quadruple.tP);
                // 将操作数1移入eax寄存器
                asmCodes.push(new ASMCode('movl', arg1Item, '%eax'));
                // 进行计算，运算结果在eax寄存器
                asmCodes.push(new ASMCode(this.op2asm[op], arg2Item, '%eax'));

                // 若运算结果是变量，则将eax值移入该变量
                if (this.isVariable(quadruple.rs)) {
                    let rsItem = this.getArg(quadruple.rs, quadruple.tP);
                    asmCodes.push(new ASMCode('movl', '%eax', rsItem));
                }
                // 否则是临时变量，存入EDX或ECX寄存器中
                else {
                    asmCodes.push(new ASMCode('movl', '%eax', this.freeReg[this.freeRegP]));
                    this.tempVarMap[quadruple.rs] = this.freeReg[this.freeRegP];
                    this.freeRegP++;
                    this.freeRegP %= this.freeReg.length;
                }
            }
            else if (['<', '<=', '>', '>=', '==', '!='].includes(op)) {
                let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                let arg2Item = this.getArg(quadruple.arg2, quadruple.tP);
                asmCodes.push(new ASMCode('movl', arg1Item, '%eax'));
                asmCodes.push(new ASMCode('cmp', arg2Item, '%eax'));
                asmCodes.push(new ASMCode(this.op2asm[op], '%al', '-'));
                asmCodes.push(new ASMCode('movzbl', '%al', '%eax'));
                if (this.isVariable(quadruple.rs)) {
                    let rsItem = this.getArg(quadruple.rs, quadruple.tP);
                    asmCodes.push(new ASMCode('movl', '%eax', rsItem));
                }
                else {

                    asmCodes.push(new ASMCode('movl', '%eax', this.freeReg[this.freeRegP]));
                    this.tempVarMap[quadruple.rs] = this.freeReg[this.freeRegP];
                    this.freeRegP++;
                    this.freeRegP %= this.freeReg.length;
                }

            }
            else if ([':='].includes(op)) {
                let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                // let rsItem = this.getArg(quadruple.rs, quadruple.tP);
                if (this.isVariable(quadruple.rs) || this.isArray(quadruple.rs)) {
                    let rsItem = this.getArg(quadruple.rs, quadruple.tP);
                    asmCodes.push(new ASMCode('movl', arg1Item, '%eax'));
                    asmCodes.push(new ASMCode('movl', '%eax', rsItem));
                }
                else {
                    asmCodes.push(new ASMCode('movl', arg1Item, this.freeReg[this.freeRegP]));
                    this.tempVarMap[quadruple.rs] = this.freeReg[this.freeRegP];
                    this.freeRegP++;
                    this.freeRegP %= this.freeReg.length;
                }
            }
            else if (['func'].includes(op)) {
                this.curFuncAsmStart = asmCodes.length;
                asmCodes.push(new ASMCode('.globl', '_' + quadruple.rs, '-'));

                asmCodes.push(new ASMCode('_' + quadruple.rs + ':', '-', '-'));
                asmCodes.push(new ASMCode('pushl', '%ebp', '-'));
                asmCodes.push(new ASMCode('movl', '%esp', '%ebp'));
                asmCodes.push(new ASMCode('subl', '$0', '%esp'));
                curFunc = quadruple.rs;
            }
            else if (['ret'].includes(op)) {
                // 将返回值存入eax寄存器中
                if (quadruple.arg1 != '-') {
                    let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                    asmCodes.push(new ASMCode('movl', arg1Item, '%eax'));
                }

                // 函数结束
                asmCodes.push(new ASMCode('leave', '-', '-'));
                asmCodes.push(new ASMCode('ret', '-', '-'));

            }
            else if (['var'].includes(op)) {
                if (curFunc) {
                    // asmCodes.push(new ASMCode('pushl', arg1Item, rsItem));
                    const memNo = this.symbolTables.searchSymbolMem(quadruple.rs, 'variable', quadruple.tP);
                    // console.log('memno',memNo,quadruple.rs)
                    asmCodes[asmCodes.length - 1].arg1 = '$' + (parseInt(memNo * 4));

                }
                else {
                    const item = this.symbolTables.searchSymbol(quadruple.rs, 'variable', quadruple.tP);
                    // console.log('global', item)
                    let totalSize = 1;
                    for (let i in item.size) {
                        totalSize *= item.size[i];
                    }
                    asmCodes.push(new ASMCode(quadruple.rs + ':', '-', '-'));
                    asmCodes.push(new ASMCode('.zero', '' + totalSize * 4, '-'));

                }
            }
            else if (['j=', 'j<', 'j<=', 'j>', 'j>=', 'j!='].includes(op)) {
                let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                let arg2Item = this.getArg(quadruple.arg2, quadruple.tP);
                asmCodes.push(new ASMCode('movl', arg1Item, '%eax'));
                asmCodes.push(new ASMCode('cmp', arg2Item, '%eax'));
                asmCodes.push(new ASMCode(this.op2asm[op], quadruple.rs, '-'));
            }
            else if (['j'].includes(op)) {
                asmCodes.push(new ASMCode('jmp', quadruple.rs, '-'));
            }
            else if (['param'].includes(op)) {

                // 字符串形参，需要在函数声明前插入字符串变量声明
                if (this.isString(quadruple.arg1)) {
                    const t = this.newTempLC();
                    const a1 = new ASMCode(t + ':', '-', '-');
                    const a2 = new ASMCode('.ascii', '"' + quadruple.arg1.replace(/"/g, '') + '\\0"', '-');
                    asmCodes.splice(this.curFuncAsmStart, 0, a1);
                    this.curFuncAsmStart++;
                    asmCodes.splice(this.curFuncAsmStart, 0, a2);
                    this.curFuncAsmStart++;
                    asmCodes.push(new ASMCode('pushl', '$' + t, '-'));
                }
                // 针对scanf情况，形参是&a形式的地址，将地址push
                else if (this.isAddr(quadruple.arg1)) {
                    let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                    asmCodes.push(new ASMCode('leal', arg1Item, '%eax'));
                    asmCodes.push(new ASMCode('pushl', '%eax', '-'));

                }
                // 其他情况，直接将值push
                else {
                    let arg1Item = this.getArg(quadruple.arg1, quadruple.tP);
                    asmCodes.push(new ASMCode('pushl', arg1Item, '-'));
                }

            }
            else if (['call'].includes(op)) {
                asmCodes.push(new ASMCode('call', '_' + quadruple.rs, '-'));
            }

        }
        console.log(asmCodes);
        return this.getASMText(asmCodes);
    }
}

module.exports = TargetCode;