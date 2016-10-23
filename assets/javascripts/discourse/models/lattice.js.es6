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
          if (topic.last_poster) { t.set('last_poster', topic.last_poster) }
          if (topic.created_by)  { t.set('created_by', topic.created_by) }
          allTopics.push(t)
          return t
        })
      })
    })
    this.set('allTopics', allTopics)
    this.set('topics', topics)
  }.on('init')
})
