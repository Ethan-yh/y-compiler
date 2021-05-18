
// 符号表项
class SymbolTableItem {
    constructor(name = '', type = 'variable', isFormal = 0, size = [1], formalNum = 0, tablePtr = -1) {
        this.name = name;           //名字
        this.type = type;           //类别
        this.isFormal = isFormal;   //是否是形参
        this.tablePtr = tablePtr;   //符号表指针
        this.size = size;           //大小，针对数组
        this.formalNum = formalNum; //形参数量，针对函数
    }
}



// 符号表
class SymbolTable {
    constructor(previous = -1, content = [], name = '', type = '') {
        this.name = name;
        this.previous = previous;
        this.content = content;
        this.type = type;
    }
    // 插入表项
    insert(symbolTableItem) {
        this.content.push(symbolTableItem);
    }
    // 查找符号表
    find(name, type, order = 0) {
        // if(type && !Array.isArray(type)){
        //     console.log('非数组')
        //     type = [type];
        //     console.log(type)
        // }
        if (order == 0) {
            for (let i = 0; i < this.content.length; i++) {
                if (this.content[i].name == name) {
                    if (type) {

                        if (this.content[i].type == type) {
                            return this.content[i];
                        } else {
                            return null;
                        }
                    }
                    else {
                        return this.content[i];
                    }
                }
            }
        }
        else {
            for (let i = this.content.length - 1; i >= 0; i--) {
                if (this.content[i].name == name) {
                    if (type) {
                        if (this.content[i].type == type) {
                            return this.content[i];
                        } else {
                            return null;
                        }
                    }
                    else {
                        return this.content[i];
                    }
                }
            }
        }

        return null;
    }
    // 查找最后一个
    findLastOne(type) {
        if (type) {
            for (let i = this.content.length - 1; i >= 0; i--) {
                if (this.content[i].type == type) {
                    return this.content[i];
                }
            }
        }
        return this.content[this.content.length - 1];
    }
    // 查找标号
    findNo(name, type) {
        for (let i = this.content.length - 1; i >= 0; i--) {
            if (this.content[i].name == name) {
                if (type) {
                    if (this.content[i].type == type) {
                        return { no: i, item: this.content[i] };
                    } else {
                        return null;
                    }
                }
                else {
                    return { no: i, item: this.content[i] };
                }
            }
        }
    }
    // 获得形参数量
    getFormalNum() {
        let num = 0;
        for (let i in this.content) {
            if (this.content[i].isFormal) {
                num++;
            }
        }
        return num;
    }
    // 获得符号表所有符号大小和
    getSize() {
        let rtn = 1;
        for (let i in this.content) {
            for (let j in this.content[i].size) {
                rtn *= this.content[i].size[j];
            }
        }
        return rtn;
    }
    // 获得符号表一个区间的大小
    getSizeFromTo(to, from = 0) {
        let rtn = 1;
        for (let i = from; i < to; i++) {
            for (let j in this.content[i].size) {
                rtn *= this.content[i].size[j];
            }
        }
        return rtn;
    }
}

class SymbolTables {
    constructor(content = []) {
        this.content = content;
    }
    insertSymbol(symbolTableItem, tP) {
        const table = this.content[tP];
        table.insert(symbolTableItem);
    }
    searchSymbol(name, type, tP, order = 0) {
        while (tP >= 0) {
            const table = this.content[tP];
            const item = table.find(name, type, order);
            if (item) {
                return item;
            }
            tP = this.content[tP].previous;
        }
        return null;
    }
    searchSymbolOneLevel(name, type, tP) {

        const table = this.content[tP];
        const item = table.find(name, type);
        if (item) {
            return item;
        }
        return null;
    }
    searchSymbolLast(type, tP) {
        const table = this.content[tP];
        const item = table.findLastOne(type);
        return item;
    }
    searchSymbolMem(name, type, tP) {
        let memNo = 0;
        let findFlag = 0;
        while (tP >= 0) {
            const table = this.content[tP];
            const formalNum = table.getFormalNum();
            // 形参3 形参2 形参1 返回地址 旧ebp(现ebp指向) 局部变量1 局部变量2... 
            // -4   -3    -2    -1     0               1        2
            if (!findFlag) {
                const findRes = table.findNo(name, type);
                if (findRes) {
                    if (table.type == 'func') {
                        if (findRes.item.isFormal) {
                            memNo = table.getSizeFromTo(findRes.no) + 2;//加2原因为上面栈图
                            break;
                        }
                        memNo = table.getSizeFromTo(findRes.no + 1, formalNum);
                        break;
                    }
                    findFlag = 1;
                }
            } else {
                memNo -= table.getSize();
                if (table.type == 'func') {
                    memNo += table.getSizeFromTo(formalNum);//还原多减去了的参数占位
                    break;
                }
            }
            tP = this.content[tP].previous;
        }
        // 在global表中找到
        if (tP < 0) {
            memNo = 0;
        }
        return memNo;
    }
}

module.exports = { SymbolTableItem, SymbolTable, SymbolTables };