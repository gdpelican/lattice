import computed from 'ember-addons/ember-computed-decorators';
import { ajax } from 'discourse/lib/ajax'
import parameterize from '../lib/parameterize'

export default Ember.Controller.extend({
  needs: ['adminLattices'],

  @computed('model.title')
  parameterizedTitle() {
    return parameterize(this.get('model.title'))
  },

  actions: {

    save() {
      this.set('disableSave', true)
      ajax(`/admin/lattices/${this.get('model.id') || ''}`, {
        type: (this.get('model.id') ? 'PATCH' : 'POST'),
        data: {
          lattice: {
            enabled:           this.model.get('enabled'),
            title:             this.model.get('title'),
            slug:              this.model.get('slug'),
            description:       this.model.get('description'),
            rows:              this.model.get('rows'),
            columns:           this.model.get('columns'),
            limit_by_category: this.model.get('limit_by_category'),
            category_id:       this.model.get('category_id'),
            topics_per_cell:   this.model.get('topics_per_cell'),
          }
        }
      }).then((saved) => {
        this.transitionToRoute('adminLattice', saved.id)
      }).catch(() => {
        bootbox.alert(I18n.t("lattice.admin.save_failed"))
      }).finally(() => {
        this.set('disableSave', false)
      })
    },

    destroy() {
      this.set('disableSave', true)

      bootbox.confirm(
        I18n.t("lattice.admin.delete_confirm"),
        I18n.t("no_value"),
        I18n.t("yes_value"),
        (confirmed) => {
          if (confirmed) {
            ajax(`/admin/lattices/${this.get('model.id') || ''}`, { type: "DELETE" }).then(function() {
              this.transitionToRoute('adminLattices.index')
            }).catch(function() {
              bootbox.alert(I18n.t("lattice.admin.delete_failed"))
            }).finally(() => {
              this.set('disableSave', false)
            })
          } else {
            this.set('disableSave', false);
          }
        }
      )
    }
  }
})
