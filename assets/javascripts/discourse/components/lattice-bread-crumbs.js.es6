import { ajax } from 'discourse/lib/ajax'

export default Ember.Component.extend({
  expanded: false,
  tagName: 'li',

  _init: function() {
    ajax('/lattices').then((data) => {
      this.set('lattices', data.lattices)
    })
  }.on('willInsertElement'),

  clickEventName: function() {
    return "click.lattice-drop"
  }.property(),

  actions: {
    expand: function() {

      if (!this.get('showDropdown')) {
        this.set('showDropdown', true)
        Em.run.next(() => { this.send('expand') })
        return
      }

      if (this.get('expanded')) { this.close(); return }
      Em.run.next(() => { this.set('expanded', true) })
      return
    }
  },

  removeEvents: function(){
    $('html').off(this.get('clickEventName'))
    this.$('a[data-drop-close]').off('click.category-drop')
  },

  close: function() {
    this.removeEvents()
    this.set('expanded', false)
  },

  willDestroyElement: function() {
    this.removeEvents()
  }

})
