import RestModel from 'discourse/models/rest'
import Topic from 'discourse/models/topic'

export default RestModel.extend({

  getTopic(topicId) {
    return _.find(this.get('allTopics'), function(t) { return t.id == topicId })
  },

  _categoryChanged: function() {
    this.set('category', Discourse.Category.findById(this.get('category_id')));
  }.observes('category_id').on('init'),

  _instantiateTopicData: function() {
    let topics = this.get('topics')
    let allTopics = []
    if (!topics) { return }
    Object.keys(topics).map((row) => {
      Object.keys(topics[row]).map((column) => {
        topics[row][column] = topics[row][column].map(function(topic) {
          let t = Topic.create(topic)
          allTopics.push(t)
          t.set('users', topic.users)
          return t
        })
      })
    })
    this.set('allTopics', allTopics)
    this.set('topics', topics)
  }.on('init')
})
