var komponist = require('komponist');

window.komponistInit = function (cb) {
    return komponist.createClientConnection('http://localhost:9000/komponist', cb);
}
