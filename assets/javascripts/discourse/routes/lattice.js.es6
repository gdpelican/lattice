import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'
import { registerHelper } from 'discourse-common/lib/helpers';
import get from '../lib/get'
import tagUrlFor from '../lib/tag-url-for'

registerHelper('get', get)
registerHelper('tagUrlFor', tagUrlFor)

export default Discourse.Route.extend({

  model: function(params) { return params },

  setupController: function(controller, params) {
    ajax(`/lattices/${params.id}.json`).then(function(data) {
      controller.setProperties({ model: Lattice.create(data) })
    })
  }
})
