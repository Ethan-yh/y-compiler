class Err
{

    constructor(msg)
    {
        this.msg = msg;
    }
}

class ErrWithLoc extends Err
{
    constructor(msg, loc = {})
    {
        super(msg);
        this.loc = loc;
    }
}



module.exports = {Err, ErrWithLoc};