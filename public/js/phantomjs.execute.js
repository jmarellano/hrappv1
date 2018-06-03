var page = require('webpage').create(),
	system = require('system');
var options = JSON.parse(system.args[1]);
var link = options.link;
var filePath = options.filePath;
var crop = options.crop || { width: 240, height: 50 };
var window = options.window || { width: 1024, height: 768 };
var delay = options.delay || 1000;
function pixelCount(page, dimension, value) {
  var pageDimensions = page.evaluate(function() {
    var body = document.body || {};
    var documentElement = document.documentElement || {};
    return {
      width: Math.max(
        body.offsetWidth
      , body.scrollWidth
      , documentElement.clientWidth
      , documentElement.scrollWidth
      , documentElement.offsetWidth
      ) * 1
    , height: Math.max(
        body.offsetHeight
      , body.scrollHeight
      , documentElement.clientHeight
      , documentElement.scrollHeight
      , documentElement.offsetHeight
      ) * 1
    };
  }, 1);
  var x = {
    window: page.viewportSize[dimension]
  , all: pageDimensions[dimension]
  }[value] || value;
  return x;
}
page.open(link, function() {
	page.viewportSize = window;
	page.clipRect = {
        top: 0,
		left: 0,
		width: pixelCount(page, 'width', crop.width) - 0,
		height: pixelCount(page, 'height', crop.height) - 0
    };
	setTimeout(function(){
		try {
    		page.render(filePath);
	        phantom.exit();
    	} catch(e) {
    		console.log('Error happened: ' + e.toString());
    		phantom.exit();
    	}
	},delay);
});