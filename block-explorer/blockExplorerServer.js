var http = require('http');

var connect = require('connect')
  , url = require('url')
  // We use this plugin to handle cross-domain requests to the bit coin explorer site
  , proxy = require('proxy-middleware');

var blockApp = connect()
				.use(connect.logger('dev'))
				// On /app, we'll serve up our app
				.use('/app', connect.static('./app'))
				// At /bitCoinSite, we'll serve up the proxy version of the bitcoin block explorer site. 
  				.use('/bitCoinSite', proxy(url.parse('http://blockexplorer.com')));

var server = http.createServer(blockApp).listen(8000);