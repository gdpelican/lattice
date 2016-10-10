import RestModel from 'discourse/models/rest'
import Topic from 'discourse/models/topic'

export default RestModel.extend({
  _categoryChanged: function() {
    this.set('category', Discourse.Category.findById(this.get('category_id')));
  }.observes('category_id').on('init'),

  _instantiateTopicData: function() {
    let topics = this.get('topics')
    if (!topics) { return }
    Object.keys(topics).map((row) => {
      Object.keys(topics[row]).map((column) => {
        topics[row][column] = topics[row][column].map(function(topic) { return Topic.create(topic) })
      })
    })
    this.set('topics', topics)
  }.on('init')
})
