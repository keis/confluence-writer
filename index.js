var Transform = require('readable-stream').Transform
var util = require('util')
var dullstring = require('dullstring')
var isString = require('is-string')

var header = dullstring('h:level. :text\n')
var anchor = dullstring('{anchor::name}\n')
var link = dullstring('[:text|#:target]')

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
      return header({
        level: chunk.level,
        text: escapeCurly(chunk.text)
      })
    case 'anchor':
      return anchor({
        name: chunk.name.replace(/[{}]/g, '')
      })
    case 'link':
      return link({
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
