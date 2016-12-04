import { ajax } from 'discourse/lib/ajax'
import Lattice from '../models/lattice'
import { registerHelper } from 'discourse-common/lib/helpers';
import parameterize from '../lib/parameterize'
import tagUrlFor from '../lib/tag-url-for'
import topicDataFor from '../lib/topic-data-for'

registerHelper('tagUrlFor', tagUrlFor)
registerHelper('topicDataFor', topicDataFor)

export default Discourse.Route.extend({

  model: function(params) { return params },

  setupController: function(controller, params) {
    ajax(`/lattices/${params.id}.json`).then(function(data) {
      controller.setProperties({ model: Lattice.create(data) })
      DiscourseURL.replaceState(`/lattices/${data.id}/${parameterize(data.slug)}`)
    })
  }
})
