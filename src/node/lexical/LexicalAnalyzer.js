
class LexicalAnalyzer{
    WordType = ["KEYWORD", "IDENTIFIER", "CONSTANT", "OPERATOR", "DELIMITER", "ERROR"]
    Keyword = ["int", "void", "if", "else", "while", "return"]
    ConstType = ["INTEGER", "FLOAT", "DOUBLE", "STRING"]
    Operator = ["+", "-", "*", "/", "<", "<=", "=", "==", ">", ">=", "!="]
    Delimiter = [",", ";", "(", ")", "{", "}", "//", "/*", "*/", "#"]


    KeywordRegexp = /^(int|void|if|else|while|return)/
    IdentifierRegexp = /^([a-zA-Z]+\d*)/
    NumRegexp = /^(0|[1-9][0-9]*)/
    OperatorRegexp = /^(\+|-|\*|\/|=|==|>|>=|<|<=|!=)/
    DelimiterRegexp = /^(,|;|\(|\)|\{|\}|\/\/|\/\*|\*\/|#)/

    code = ""       //代码
    codeIndex = 0   //代码索引
    line = 1        //当前词法分析所在行(从'1'开始)
    col = 1         //当前词法分析所在列(从'1'开始)
    oldline = 0
    oldcol = 0

    // code                    //代码
    // codeIndex               //代码bian索引
    // ch                      //字符变量，存放最新读到字符
    // str                     //字符数组，存放最新读到单词
    // lexResult               //字符串数组，存放词法分析结果
    // initLexAnalyzer(code)   //初始化词法分析器
    // isLetter(ch)            //判断是否是字母
    // isDigit(ch)             //判断是否是数字
    // isOperator(ch)          //判断是否是运算符
    // isBlank(ch)             //判断是否是空白符
    // getNextChar()           //获取字符流中的下一个字符
    // getNextWord()           //得到代码中的下一个单词
    // getLexResult()          //得到代码的词法分析结果



    /**
     * 初始化词法分析器
     * @param {string} code
     * @return {bool}
     */
    initLexAnalyzer(code){
        this.code = code
        this.codeIndex = 0
        this.line = 1
        this.col = 1
    }

    /**
     * 判断是否是字母
     * @param {string} ch
     * @return {bool}
     */
    isLetter(ch){
        if((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))
            return true
        else
            return false
    }

    /**
     * 判断是否是数字
     * @param {string} ch
     * @return {bool}
     */
    isDigit(ch){
        if(ch >= '0' && ch <= '9')
            return true
        else
            return false
    }

    /**
     * 判断是否是运算符
     * @param {string} ch
     * @return {bool}
     */
    isOperator(ch){
        if(ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '<' || ch == '=' || ch == '>' || ch == '!')
            return true
        else
            return false
    }

    /**
     * 判断是否是空白符
     * @param {string} ch
     * @return {bool}
     */
    isBlank(ch){
        if(ch == ' ' || ch == '\t'|| ch == '\r' || ch == '\n' || ch == ' ')
            return true
        else
            return false
    }

    /**
     * 获取字符流中的下一个字符，同时代码索引加一和计算行数
     * @param
     * @return {string}
     */
    getNextChar(){
        let ch = ''
        this.oldline = this.line
        this.oldcol = this.col
        if(this.codeIndex == this.code.length)
            ch = '#'
        else{
            ch = this.code[this.codeIndex]
            this.codeIndex++
        }
        if(ch == '\n'){
            this.line++
            this.col = 1
        }
        else
            this.col++
        return ch
    }

    /**
     * 得到代码中的下一个单词
     * @param
     * @return {object}
     */
    getNextWord(){
        let ch = ''
        let chNext = ''
        let str = ''
        let word = {
            type: "",
            value: "",
            loc: {
                start: {
                    line: 0,
                    col: 0
                },
                end: {
                    line: 0,
                    col: 0
                }
            }
        }
        while(true){
            word.loc.start.line = this.line
            word.loc.start.col = this.col
            ch = this.getNextChar()
            str = ch
            if(ch == '/'){
                chNext = this.getNextChar()
                if(chNext == '/'){
                    do chNext = this.getNextChar()
                    while((chNext != '\n') && (chNext != '#'))
                    if(chNext == '#'){
                        this.codeIndex--
                        this.col--
                    }
                }
                else if(chNext == '*'){
                    while(true){
                        do chNext = this.getNextChar()
                        while((chNext != '*') && (chNext != '#'))
                        if(chNext == '#'){
                            word.type = "ERROR"
                            word.value = "缺少\"*/\""
                            break
                        }
                        if(this.getNextChar() == '/')
                            break
                        else{
                            this.codeIndex--
                            this.col--
                        }
                    }
                    if(word.type == "ERROR")
                        break
                }        
                /*除号*/
                else{
                    this.codeIndex--
                    this.col--
                    word.type = "/"
                    word.value = "/"
                    break
                }
            }
            else if(this.isLetter(ch)){
                chNext = this.getNextChar()
                while(this.isLetter(chNext) || this.isDigit(chNext)){
                    str = str.concat(chNext)
                    chNext = this.getNextChar()
                }
                if(this.Keyword.includes(str))
                    word.type = str
                else
                    word.type = "identifier"
                break
            }
            else if(this.isDigit(ch)){
                chNext = this.getNextChar()
                while(this.isDigit(chNext)){
                    str = str.concat(chNext)
                    chNext = this.getNextChar()
                }
                if(this.isLetter(chNext)){
                    while(this.isLetter(chNext)){
                        str = str.concat(chNext)
                        chNext = this.getNextChar()
                    }
                    word.type = "ERROR"
                    word.value = "标识符或关键字不能紧跟在数字后面!!!"
                }
                else
                    word.type = "num"
                break
            }
            else if(this.isOperator(ch)){
                if(ch == '<' || ch == '=' || ch == '>' || ch == '!'){
                    chNext = this.getNextChar()
                    if(chNext == '='){
                        str = str.concat(chNext)
                        word.type = str
                    }
                    else{
                        if(ch == '!'){
                            word.type = "ERROR"
                            word.value = "\"!\" 不是操作符!!!"
                        }
                        else{
                            if(this.codeIndex != this.code.length || chNext != '#'){
                                this.codeIndex--
                                this.col--
                            }
                            word.type = str
                        }
                    }
                }
                else
                    word.type = str
                break
            }
            else if(this.Delimiter.includes(ch)){
                word.type = str
                break
            }
            else if(this.isBlank(ch))
                continue
            else{
                chNext = this.getNextChar()
                while((chNext != '/') && !this.isLetter(chNext) && !this.isDigit(chNext) && !this.isOperator(chNext) && !this.Delimiter.includes(chNext) && !this.isBlank()){
                    str = str.concat(chNext)
                    chNext = this.getNextChar()
                }
                word.type = "ERROR"
                word.value = "出现未知的单词!!!"
                break
            }
        }
        if(!this.Delimiter.includes(word.type) && !this.isOperator(word.type[0]) && (this.codeIndex != this.code.length || (this.codeIndex == this.code.length && !this.isLetter(this.code[this.codeIndex]) && !this.isDigit(this.code[this.codeIndex])))){
            this.codeIndex--
            if(code[this.codeIndex] == '\n'){
                this.line = this.oldline
                this.col = this.oldcol
            }
            else
                this.col--
        }
        word.loc.end.line = this.line
        word.loc.end.col = this.col
        word.value = str
        return word
    }

    /**
     * 得到代码的词法分析结果
     * @param
     * @return {object}
     */
    getLexResult(){
        let result = {}
        result.isSucc = true
        result.msg = "词法分析成功"
        let word = {
            type: "",
            value: "",
            loc: {
                start: {
                    line: 0,
                    col: 0
                },
                end: {
                    line: 0,
                    col: 0
                }
            }
        }
        let lexResult = []
        while(this.codeIndex < this.code.length){
            word = this.getNextWord()
            if((word.type == '#') && (this.codeIndex < this.code.length)){
                word.type = "ERROR"
                word.value = "\"#\" 应该出现在代码结尾处!!!"
            }
            lexResult.push(word)
            if(word.type == "ERROR"){
                result.isSucc = false
                result.errType = "lexErr"
                result.msg = "词法分析错误"
                result.loc = word.loc
                break
            }
            if((word.type != '#') && (this.codeIndex == this.code.length)){
                let word2 = {
                        type: "",
                        value: "",
                        loc: {
                            start: {
                                line: 0,
                                col: 0
                            },
                            end: {
                                line: 0,
                                col: 0
                            }
                        }
                }
                word2.type = "#"
                word2.value = "#"
                word2.loc.start.line = this.line
                word2.loc.start.col = this.col
                word2.loc.end.line = this.line
                word2.loc.end.col = ++this.col
                lexResult.push(word2)
            }
        }
        result.lexResult = lexResult
        return result
    }

    /**
     * 通过词法正则表达式得到词法翻译结果
     * @param
     * @return {object}
     */
    getLexResultByRegex(){
        let result = {}
        result.isSucc = true
        result.msg = "词法分析成功"
        let str = this.code
        let lexResult = []
        while(str.length > 0){
            let word = {
                    type: "",
                    value: "",
                    loc: {
                        start: {
                            line: 0,
                            col: 0
                        },
                        end: {
                            line: 0,
                            col: 0
                        }
                    }
            }
            while(this.isBlank(str[0])){
                if(str[0] == ' '){
                    str = str.replace(/^ /, "")
                    this.col++
                }
                else if(str[0] == ' '){
                    str = str.replace(/^ /, "")
                    this.col++
                }
                else if(str[0] == '\n'){
                    str = str.replace(/^\n/, "")
                    this.line++
                    this.col = 1
                }
                else{
                    str.replace(/^(\r|\t)/, "")
                    this.col++
                }
            }
            word.loc.start.line = this.line
            word.loc.start.col = this.col
            if(this.IdentifierRegexp.test(str)){
                if(this.KeywordRegexp.test(str) && this.KeywordRegexp.exec(str)[0].length == this.IdentifierRegexp.exec(str)[0].length){
                    word.type = this.KeywordRegexp.exec(str)[0]
                    word.value = word.type
                    this.col += word.value.length
                    str = str.replace(this.KeywordRegexp, "")
                }
                else{
                    word.type = "identifier"
                    word.value = this.IdentifierRegexp.exec(str)[0]
                    this.col += word.value.length
                    str = str.replace(this.IdentifierRegexp, "")
                }
            }
            else if(this.NumRegexp.test(str)){
                word.type = "num"
                word.value = this.NumRegexp.exec(str)[0]
                this.col += word.value.length
                str = str.replace(this.NumRegexp, "")
            }
            else if(this.DelimiterRegexp.test(str)){
                word.type = this.DelimiterRegexp.exec(str)[0]
                word.value = word.type
                this.col += word.value.length
                str = str.replace(this.DelimiterRegexp,"")
                if(word.value[0] == '/' && word.value[1] == '/'){
                        while(str[0] != '\n' && str[0] != '#' && str.length > 0){
                            this.col++
                            if(str.length >= 2)
                                str = str.substring(1,str.length - 1)
                            else
                                str = ""
                        }
                        continue
                }
                else if(word.value[0] == '/' && word.value[1] == '*'){
                        while(str[0] != '#' && str.length > 1){
                            if(str[0] == '\n'){
                                this.line++
                                this.col = 1
                            }
                            else if(str[0] == '*' && str[1] == '/'){
                                this.col += 2
                                if(str.length >= 3)
                                    str = str.substring(2,str.length - 1)
                                else
                                    str = ""
                                continue
                            }
                            else
                                this.col++
                            if(str.length >= 2)
                                str = str.substring(1,str.length - 1)
                            else
                                str = ""
                        }
                        word.type = "ERROR"
                        word.value = "缺少\"*/\""
                }
            }
            else if(this.OperatorRegexp.test(str)){
                word.type = this.OperatorRegexp.exec(str)[0]
                word.value = word.type
                this.col += word.value.length
                str = str.replace(this.OperatorRegexp, "")
            }
            else{
                word.type = "ERROR"
                word.value = "出现未知的单词!!!"
                this.col ++
            }
            word.loc.end.line = this.line
            word.loc.end.col = this.col
            if((word.type == '#') && str.length > 0){
                word.type = "ERROR"
                word.value = "\"#\" 应该出现在代码结尾处!!!"
            }
            lexResult.push(word)
            if(word.type == "ERROR"){
                result.isSucc = false
                result.errType = "lexErr"
                result.msg = "词法分析错误"
                result.loc = word.loc
                break
            }
            if((word.type != '#') && str.length == 0){
                let word2 = {
                    type: "",
                    value: "",
                    loc: {
                        start: {
                            line: 0,
                            col: 0
                        },
                        end: {
                            line: 0,
                            col: 0
                        }
                    }
                }
                word2.type = "#"
                word2.value = "#"
                word2.loc.start.line = this.line
                word2.loc.start.col = this.col
                word2.loc.end.line = this.line
                word2.loc.end.col = ++this.col
                lexResult.push(word2)
            }
        }
        result.lexResult = lexResult
        return result
    }

}

module.exports = LexicalAnalyzer

code = "\
int a;\n\
int b;\n\
int program(int a,int b,int c)\n\
{\n\
int i;\n\
int j;\n\
i=0;\n\
if(a>(b+c))\n\
{\n\
j=a+(b*c+1);\n\
}\n\
else\n\
{\n\
j=a;\n\
}\n\
while(i<=100)\n\
{\n\
i=j*2;\n\
}\n\
return i;\n\
}\n\
int demo(int a)\n\
{\n\
a=a+2;\n\
return a*2;\n\
}\n\
void main(void)\n\
{\n\
int a;\n\
int b;\n\
int c;\n\
a=3;\n\
b=4;\n\
c=2;\n\
a=program(a,b,demo(c));\n\
return;\n\
}\
"

let lexAnalyzer = new LexicalAnalyzer()
code2 = ">=<#"

code3 ="int a;\r\nint b;\r\nint program(int a,int b,int c)\r\n{\r\n\tint i;\r\n\tint j;\r\n\ti=0; \t\r\n\tif(a>(b+c))\r\n\t{\r\n\t\tj=a+(b*c+1);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tj=a;\r\n\t}\r\n\twhile(i<=100)\r\n\t{\r\n\t\ti=j*2;\r\n\t}\r\n\treturn i;\r\n}\r\n \r\n\r\n" 
lexAnalyzer.initLexAnalyzer(code2)

function test() {
    let result = lexAnalyzer.getLexResult() 
    console.log(result)
}

test()
