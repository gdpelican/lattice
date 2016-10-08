import { ajax } from 'discourse/lib/ajax'

export default Discourse.Route.extend({

  setupController: function(controller) {
    ajax("/admin/lattices").then((response) => {
      controller.setProperties({ model: response.lattices })
    })
  }

})
