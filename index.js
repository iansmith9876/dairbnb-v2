var express = require('express'),
    app = express(),
    cons = require('consolidate');

app.engine('haml', cons.haml);

app.set('view engine', 'haml');
app.set('views', __dirname + '/app/views');

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.render('index');
});

app.get('/dashboard', function(req, res){
  res.render('dashboard');
});

app.listen(8000);
