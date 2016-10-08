import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'

export default Discourse.Route.extend({

  model: function(params) { return params },

  setupController: function(controller, params) {
    ajax(`/lattices/${params.id}.json`).then(function(data) {
      controller.setProperties({ model: Lattice.create(data) })
    })
  }
})
