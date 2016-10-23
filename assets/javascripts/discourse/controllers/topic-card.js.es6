import { ajax } from 'discourse/lib/ajax';

export default Ember.Controller.extend({
  needs: ['topic', 'application'],
  visible: false,

  setTopic: function(topic) {
    if (!topic.card_fetched) {
      ajax(`topic-card/${topic.id}`).then((data) => {
        data.card_fetched = true
        topic.setProperties(data)
        this.set('topic', topic)
      })
    }
    this.set('topic', topic)
  },

  close() {
    this.setProperties({ visible: false });
  }
});
