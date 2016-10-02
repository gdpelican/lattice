import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'

export default Discourse.Route.extend({

  model: function(params) {
    if (params.id === 'new') {
      return Lattice.create({})
    } else {
      return ajax(`/admin/lattices/${params.id}.json`).then(function(data) { return Lattice.create(data) })
    }
  },

  setupController: function(controller, model) {
    controller.setProperties({ model: model })
  }
})
