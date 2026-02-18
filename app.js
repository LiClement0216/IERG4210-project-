import { createServer } from 'node:http';
createServer(function (req, res) { // add to the 'request' event.
res.writeHead(200, {'Content-Type': 'text/html'});
res.end('<h1>Hello World</h1>');
}).listen(3000, "localhost");
