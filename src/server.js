//Para converter automaticamente de typescript para javascript > npx tsx watch 'caminho do arquivo ts' ex: src/server.ts
var http = require('http');
var server = http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.url === '/') {
        res.statusCode = 200;
        res.end('Home page');
    }
    else if (req.url === '/sobre') {
        res.statusCode = 200;
        res.end('About page');
    }
});
server.listen(3000, function () {
    console.log("Servidor em execu\u00E7\u00E3o em http://localhost:3000/");
});
