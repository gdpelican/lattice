export default function topicDataFor([model, row, column, field = "data"]) {
  return model.get(`topics.${row}.${column}.${field}`)
}
