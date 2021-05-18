const { ErrWithLoc } = require('../utils/err.js');
const { Position, SourceLocation } = require('../utils/position.js');

// 单词符号定义
class Token {
    constructor(type, value, loc) {
        this.type = type;//类别
        this.value = value;//值
        this.loc = loc;//位置
    }
}

class Lex {
    constructor(code = '') {

        this.KEYWORD = ["int", "void", "if", "else", "while", "return"];
        this.DELIMITER = [",", ";", "(", ")", "{", "}", "[", "]", "//", "/*", "*/", "&"];

        this.pos = 0;//当前位置

        this.line = 1;
        this.col = 1;

        this.oldLine = 1;
        this.oldCol = 1;

        this.initLexAnalyzer(code);
    }

    /**
     * 初始化词法分析器
     * @param {string} code
     * @return {bool}
     */
    initLexAnalyzer(code) {
        this.code = code;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.oldLine = 1;
        this.oldCol = 1;
    }


    /**
     * 判断是否是字母
     * @param {string} ch
     * @return {bool}
     */
    isLetter(ch) {
        if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z')//包含下划线
            return true;
        else
            return false;
    }

    /**
     * 判断是否是数字
     * @param {string} ch
     * @return {bool}
     */
    isDigit(ch) {
        if (ch >= '0' && ch <= '9')
            return true
        else
            return false
    }

    /**
     * 判断是否是运算符
     * @param {string} ch
     * @return {bool}
     */
    isOperator(ch) {
        if (ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '<' || ch == '=' || ch == '>' || ch == '!')
            return true
        else
            return false
    }

    /**
     * 判断是否是空白符
     * @param {string} ch
     * @return {bool}
     */
    isBlank(ch) {
        if (ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n' || ch == ' ')
            return true
        else
            return false
    }


    /**
     * 获取下一个字符
     * @param {string} ch
     * @return {bool}
     */
    getNextChar() {
        let ch = '';
        this.oldLine = this.line;
        this.oldCol = this.col;

        if (this.pos >= this.code.length) {
            ch = '#';
        }
        else {
            ch = this.code[this.pos];
            this.pos++;
        }
        if (ch == '\n') {
            this.line++;
            this.col = 1;
        }
        else {
            this.col++;
        }
        return ch;
    }

    /**
     * 回退一个字符
     * @param
     * @return {object}
     */
    getChBack() {
        this.pos--;
        this.line = this.oldLine;
        this.col = this.oldCol;
    }

    /**
     * 得到下一个token
     * @param
     * @return {object}
     */
    getNextToken() {
        let chNext = '';
        let str = '';
        let startPos = new Position(this.line, this.col);
        let endPos = new Position(this.line, this.col);
        let ch;


        while (true) {
            startPos.line = this.line;
            startPos.col = this.col;
            ch = this.getNextChar();
            str = ch;

            // 注释或除法
            if (ch == '/') {
                chNext = this.getNextChar();
                //单行注释
                if (chNext == '/') {
                    do chNext = this.getNextChar();
                    while (chNext != '\n' && chNext != '#')
                    if (chNext == '#') {
                        this.getChBack();
                    }
                }
                //多行注释
                else if (chNext == '*') {
                    while (true) {
                        do chNext = this.getNextChar();
                        while (chNext != '*' && chNext != '#')
                        if (chNext == '#') {
                            endPos = new Position(this.line, this.col);
                            throw new ErrWithLoc('SyntaxError: It should be */', new SourceLocation(startPos, endPos));
                        }
                        if (this.getNextChar() == '/') {
                            break;
                        }
                    }
                }
                // 除号
                else {
                    this.getChBack();

                    endPos = new Position(this.line, this.col);
                    return new Token('/', '/', new SourceLocation(startPos, endPos));

                }
            }
            // 关键字或标识符
            else if (this.isLetter(ch)) {
                chNext = this.getNextChar();
                while (this.isLetter(chNext) || this.isDigit(chNext)) {
                    str += chNext;
                    chNext = this.getNextChar();
                }
                this.getChBack();
                if (this.KEYWORD.includes(str)) {
                    endPos = new Position(this.line, this.col);
                    return new Token(str, str, new SourceLocation(startPos, endPos));
                }
                else {
                    endPos = new Position(this.line, this.col);
                    return new Token('identifier', str, new SourceLocation(startPos, endPos));
                }
            }
            // 数字
            else if (this.isDigit(ch)) {
                chNext = this.getNextChar();
                while (this.isDigit(chNext)) {
                    str += chNext;
                    chNext = this.getNextChar();
                }
                this.getChBack();
                if (this.isLetter(chNext)) {
                    while (this.isLetter(chNext)) {
                        str += chNext;
                        chNext = this.getNextChar();
                    }
                    endPos = new Position(this.line, this.col);
                    throw new ErrWithLoc('SyntaxError: Identifier directly after number', new SourceLocation(startPos, endPos));

                }
                else {
                    endPos = new Position(this.line, this.col);
                    return new Token('num', str, new SourceLocation(startPos, endPos));
                }
            }
            // 运算符
            else if (this.isOperator(ch)) {
                if (ch == '<' || ch == '=' || ch == '>' || ch == '!') {
                    chNext = this.getNextChar();
                    if (chNext == '=') {
                        str += chNext;
                        endPos = new Position(this.line, this.col);
                        return new Token(str, str, new SourceLocation(startPos, endPos));
                    }
                    else {
                        if (ch == '!') {
                            endPos = new Position(this.line, this.col);
                            throw new ErrWithLoc('SyntaxError: Illegal operator', new SourceLocation(startPos, endPos));
                        }
                        else if (this.pos != this.code.length || chNext != '#') {
                            this.getChBack();
                        }
                        endPos = new Position(this.line, this.col);
                        return new Token(str, str, new SourceLocation(startPos, endPos));
                    }

                }
                else {
                    endPos = new Position(this.line, this.col);
                    return new Token(str, str, new SourceLocation(startPos, endPos));
                }
            }
            // 界符
            else if (this.DELIMITER.includes(ch)) {
                endPos = new Position(this.line, this.col);
                return new Token(str, str, new SourceLocation(startPos, endPos));
            }
            // 空格
            else if (this.isBlank(ch)) {
                continue;
            }
            // 字符串
            else if (ch == '"') {
                do {
                    chNext = this.getNextChar();
                    str += chNext;
                } while (chNext != '"' && chNext != '#');
                if (chNext == '#') {
                    endPos = new Position(this.line, this.col);
                    throw new ErrWithLoc('SyntaxError: It should be "', new SourceLocation(startPos, endPos));
                }
                return new Token('string', str, new SourceLocation(startPos, endPos));
            }
            // 结束
            else if (ch == '#') {
                endPos = new Position(this.line, this.col);
                return new Token('#', '#', new SourceLocation(startPos, endPos));
            }
            // Unexpected token
            else {
                endPos = new Position(this.line, this.col);
                throw new ErrWithLoc('SyntaxError: Unexpected token', new SourceLocation(startPos, endPos));
            }
        }
    }
}


// const code = "\
// int !a;\n\
// int b;\n\
// int program(int a,int b,int c)\n\
// {\n\
// int i;\n\
// int j;\n\
// i=0;\n\
// if(a>(b+c))\n\
// {\n\
// j=a+(b*c+1);\n\
// }\n\
// else\n\
// {\n\
// j=a;\n\
// }\n\
// while(i<=100)\n\
// {\n\
// i=j*2;\n\
// }\n\
// return i;\n\
// }\n\
// int demo(int a)\n\
// {\n\
// a=a+2;\n\
// return a*2;\n\
// }\n\
// void main(void)\n\
// {\n\
// int a;\n\
// int b;\n\
// int c;\n\
// a=3;\n\
// b=4;\n\
// c=2;\n\
// a=program(a,b,demo(c));\n\
// return;\n\
// }\
// "

// const lex = new Lex(code);

// for(let i = 0;i<10;i++)
// {   
//     try{
//         const token = lex.getNextToken();
//         console.log(token);
//         if(!token){
//             break;
//         }
//     }catch(err){
//         console.log(err);
//         break;
//     }
// }


module.exports = Lex;

