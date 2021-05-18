const path = require('path')


var a = 'a/b'
var b = '../c'

var c = path.join(a, b)

console.log(c)