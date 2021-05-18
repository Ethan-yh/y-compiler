const Syntactic = require('./syntactic/syntactic');
const Optimize = require('./optimize/optimize');
const TargetCode = require('./targetcode/targetcode');

class Parser {
    constructor() {
        this.syntactic = new Syntactic();
        this.optimize = new Optimize();
        this.targetCode = new TargetCode();
    }
    parse(code) {
        const rtn = {};
        try {
            const synResult = this.syntactic.startAnalize(code);
            rtn.synResult = synResult;
            const optMidCode = this.optimize.getOptimized(synResult.mid_code);
            rtn.optMidCode = optMidCode;
            const asmText = this.targetCode.getTargetCode(optMidCode, synResult.symbolTables)
            rtn.asmText = asmText;
            const jsCode = this.syntactic.likec2js();
            rtn.jsCode = jsCode;
            rtn.isSucc = true;
        } catch (err) {
            rtn.isSucc = false;
            rtn.err = err;
        }
        return rtn;
    }
}

module.exports = Parser;