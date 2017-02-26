import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'

export default Discourse.Route.extend({

  model: function() {
    return ajax("/admin/lattices").then((response) => {
      return response.lattices.map((l) => {
        return Lattice.create(l)
      })
    })
  },

  setupController: function(controller, model) {
    controller.setProperties({ model: model })
  }

})
