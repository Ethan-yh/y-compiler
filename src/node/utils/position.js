class Position
{
    constructor(line, col)
    {
        this.line = line;
        this.col = col;
    }
}

class SourceLocation
{
    /**
     * 
     * @param {Position} start 
     * @param {Position} end 
     */
    constructor(start, end)
    {
        this.start = start;
        this.end = end;
    }
}

module.exports = {Position, SourceLocation}
