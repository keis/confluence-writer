var test = require('tape')
var content = require('stream-content')
var Transform = require('../../index')

test('transforms document', function (t) {
  t.plan(3)

  var tr = new Transform()
  content.readAll(tr, 'utf-8', function (err, data) {
    t.error(err)
    t.ok(~data.indexOf('h3. \\{hello\\}'), 'header')
    t.ok(~data.indexOf('[bar|#baz]'), 'link in table')
  })

  tr.write({type: 'header', level: 3, text: '{hello}'})
  tr.write({type: 'table.header'})
  tr.write({type: 'table.header-row', labels: ['key', 'value']})
  tr.write({
    type: 'table.row',
    values: ['foo', {type: 'link', text: 'bar', target: 'baz'}]
  })
  tr.end()
})
