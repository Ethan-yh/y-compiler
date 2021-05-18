class Optimize {
    constructor() {

    }
    /**
     * 优化四元式
     * @param {array}quadruples
     */
    getOptimized(quadruples) {
        // 跳转目标指令标号
        let labelNo = 0;
        for (let i in quadruples) {
            const quadruple = quadruples[i];
            const op = quadruple.op;
            if (op[0] == 'j') {
                if (!quadruples[quadruple.rs].label) {
                    quadruples[quadruple.rs].label = 'L' + labelNo++;
                }
                quadruple.rs = quadruples[quadruple.rs].label;
            }
        }
        const res = [];
        for (let i in quadruples) {
            const quadruple = quadruples[i];
            const op = quadruple.op;
            if (op == ':=' && !quadruple.label) {
                const lastQuadruple = quadruples[i - 1];
                if (lastQuadruple.rs == quadruple.arg1 && quadruple.arg1[0] == '_') {
                    lastQuadruple.rs = quadruple.rs;
                    res.pop();
                    res.push(lastQuadruple);
                }
                else {
                    res.push(quadruple);
                }
            } else {
                res.push(quadruple);
            }

        }
        return res;
    }
}

module.exports = Optimize;