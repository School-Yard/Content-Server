var Support = require('./support'),
    app;


app = Support.createServer(function() {
  app.listen(3001);
});


app.get('/', function(req, res) {
  Support.makeRequest()
  .path('api/v1/buckets')
  .get()(function(err, resp, body) {
    if(err) throw err;
    return res.render('index', {buckets: JSON.parse(body)});
  });
});

app.post('/', function(req, res) {
  Support.makeRequest()
    .header('Content-Type', 'application/json')
    .path('api/v1/buckets')
    .post(JSON.stringify(req.body))(function(err, resp, body) {
      if(err) throw err;
      return res.redirect('/');
    });
});

app.get('/:name', function(req, res) {
  if(req.params.name === 'favicon.ico') {
    res.status = 404;
    return res.end();
  }

  Support.makeRequest()
    .path('api/v1/buckets/' + req.params.name)
    .get()(function(err, resp, body) {
      if(err) throw err;
      return res.render('view', {bucket: JSON.parse(body)});
    });
});

app.post('/:name', function(req, res) {
  Support.makeRequest()
    .header('Content-Type', 'application/json')
    .path('api/v1/buckets/' + req.params.name + '/items')
    .post(JSON.stringify(req.body))(function(err, resp, body) {
      if(err) throw err;
      return res.redirect('/' + req.params.name);
    });
});

app.get('/:name/:item', function(req, res) {
  Support.makeRequest()
    .path('api/v1/buckets/' + req.params.name + '/items/' + req.params.item)
    .get()(function(err, resp, body) {
      if(err) throw err;
      return res.render('item', {item: JSON.parse(body), bucket: req.params.name});
    });
});

app.post('/:name/:item', function(req, res) {
  console.log(req.body);
  console.log(req.params);
  Support.makeRequest()
    .header('Content-Type', 'application/json')
    .path('api/v1/buckets/' + req.params.name + '/items/' + req.params.item + '/properties')
    .post(JSON.stringify(req.body))(function(err, resp, body) {
      if(err) throw err;
      return res.redirect('/' + req.params.name + '/' + req.params.item);
    });
});