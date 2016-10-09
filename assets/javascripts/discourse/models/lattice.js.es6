import RestModel from 'discourse/models/rest'

export default RestModel.extend({
  _categoryChanged: function() {
    this.set('category', Discourse.Category.findById(this.get('category_id')));
  }.observes('category_id').on('init')
})
