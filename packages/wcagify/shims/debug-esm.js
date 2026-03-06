function debug() {
  return function () {}
}

debug.enable = function () {}
debug.disable = function () {}
debug.enabled = function () {
  return false
}
debug.humanize = function () {
  return ''
}
debug.coerce = function (val) {
  return val
}

export default debug
