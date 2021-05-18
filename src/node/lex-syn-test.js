const Lex = require('./lexical/lex');
const Syntactic = require('./syntactic/syntactic');
const Optimize = require('./optimize/optimize');
const TargetCode = require('./targetcode/targetcode');
const fs = require('fs');


const code = "\
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
j=a+(b*c+1);\n\
}\n\
while(i<=100)\n\
{\n\
i=i+j*2;\n\
}\n\
return i;\n\
}\n\
int demo(int a)\n\
{\n\
a=a+2;\n\
return a*2;\n\
}\n\
\n\
void main(void)\n\
{\n\
int a;\n\
int b;\n\
int c;\n\
int arr[4];\n\
a=3;\n\
b=4;\n\
c=2;\n\
arr[1]=3;\n\
a=program(a,b,demo(3));\n\
return;\n\
}\n\
"
const code2 = "\
int program(int a,int b,int c)\n\
{\n\
int i;\n\
int j;\n\
i=0; \n\
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
int a[2][2];\n\
a[0][0]=3;\n\
a[0][1]=a[0][0]+1;\n\
a[1][0]=a[0][0]+a[0][1];\n\
a[1][1]=program(\"a[0][0]\",a[0][1],demo(a[1][0]));return;\n\
}\n\
"

const code3 = "\
int m[1][3];\n\
int main(void)\n\
{\n\
int k;\n\
int a[3][2];\n\
a[2][1] = 3;\n\
scanf(\"%d\", &k);\n\
printf(\"helloworld%d\", k);\n\
return 0;\n\
}\n\
"

// 测试函数
function test() {
    // let lexical = new Lex();
    // lexical.initLexAnalyzer(code);
    // let lexResult = lexical.getLexResult();
    // console.log('词法分析结果');
    // console.log(lexResult);
    // if(!lexResult.isSucc){
    //     console.log('词法错误');
    //     return;
    // }

    try{
        let syntactic = new Syntactic();
        
        // console.log(syntactic.followSet)
    
        const synResult = syntactic.startAnalize(code3);
        console.log('分析成功')
        // console.log(synResult.words)
        console.log(synResult.mid_code)

        console.log(synResult.symbolTables.content[6])

        let optimize = new Optimize();
        const optRes = optimize.getOptimized(synResult.mid_code);
        // console.log(optRes)

        let targetCode = new TargetCode();
        targetCode.getTargetCode(optRes, synResult.symbolTables)

        
    }catch(err){
        console.log('err')
        console.log(err);
    }
    

    // console.log('语法分析结果');
    // console.log(synResult.analizeProcess);

    
    // if(!synResult.isSucc){
    //     console.log('语法/语义错误');
    //     console.log(synResult.msg);
    //     console.log(synResult.errWord);
    //     return;
    // }

    // console.log(synResult.mid_code);
    // console.log(synResult.symbolTables);


    // for(let i = 0;i<syntactic.normalFamily.length;i++){
    //     const itemsSet = syntactic.normalFamily[i];
    //     console.log(`项目集${i}:`);
    //     for(let j = 0;j<itemsSet.length;j++){
    //         const production = syntactic.productions[itemsSet[j].proNum];
    //         console.log(production.left+'->'+JSON.stringify(production.right));
    //         console.log(itemsSet[j].pointPos);
    //     }
    // }
    // console.log(syntactic.normalFamily);
    // console.log(synResult.ast);
    // const jscode = syntactic.likec2js();
    // console.log(jscode)
    // fs.writeFileSync('./ast.json', JSON.stringify(synResult.ast, null, 2));
    // fs.writeFileSync('./cst.json', JSON.stringify(synResult.cst, null, 2));

}

test();



