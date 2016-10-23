export default function tagUrlFor(tag) {
  return Discourse.getURL("/tags/" + tag[0].source)
}
