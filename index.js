var Transform = require('readable-stream').Transform
var util = require('util')
var dullstring = require('dullstring')
var isString = require('is-string')

module.exports = ConfluenceWriter

function escapeCurly (s) {
  if (isString(s)) {
    return s.replace('{', '\\{').replace('}', '\\}')
  }
  return s
}

function maybeFormat (s) {
  if (s && s.type) {
    return format(s) || ''
  }
  return s
}

function format (chunk) {
  switch (chunk.type) {
    case 'header':
      return dullstring('h:level. :text\n')({
        level: chunk.level,
        text: escapeCurly(chunk.text)
      })
    case 'anchor':
      return dullstring('{anchor::name}\n')({
        name: chunk.name.replace(/[{}]/g, '')
      })
    case 'link':
      return dullstring('[:text|#:target]')({
        text: escapeCurly(chunk.text),
        target: chunk.target.replace(/[{}]/g, '')
      })
    case 'text':
      return chunk.text
    case 'table.header':
      return '\n'
    case 'table.header-row':
      return '|| ' +
        chunk.labels
          .map(escapeCurly)
          .map(maybeFormat)
          .join('|| ') + '||\n'
    case 'table.row':
      return '| ' +
        chunk.values
          .map(escapeCurly)
          .map(maybeFormat)
          .join('| ') + '|\n'
    case 'table.footer':
      return '\n'
  }
}

function ConfluenceWriter () {
  Transform.call(this, {writableObjectMode: true})
}

util.inherits(ConfluenceWriter, Transform)

ConfluenceWriter.prototype._transform = function (chunk, enc, callback) {
  var text
  if ((text = format(chunk))) {
    this.push(text)
  }
  callback()
}
