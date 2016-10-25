import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'

export default Discourse.Route.extend({

  setupController: function(controller) {
    ajax("/admin/lattices").then((response) => {
      controller.setProperties({ model: response.lattices.map(function(l) {
        return Lattice.create(l)
      })})
    })
  }

})
