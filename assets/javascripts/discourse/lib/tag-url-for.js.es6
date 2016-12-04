export default function tagUrlFor(tags) {
  switch(tags.length) {
    case 0:  return ""; break;
    case 1:  return Discourse.getURL(`/tags/${tags[0]}`); break;
    default: return Discourse.getURL(`/tags/intersection/${tags[0]}/${tags[1]}`); break;
  }
}
