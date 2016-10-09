export default function get(params) {
  return _.reduce(params, function(value, next) {
    return value.get(next.source || next)
  })
}
