import { ajax } from 'discourse/lib/ajax'

export default Ember.Controller.extend({
  needs: ['adminLattices'],

  actions: {

    save() {
      this.set('disableSave', true)
      ajax(`/admin/lattices/${this.get('model.id') || ''}`, {
        type: "POST",
        data: {
          lattice: {
            title:           this.model.get('title'),
            slug:            this.model.get('slug'),
            row:             this.model.get('rows'),
            columns:         this.model.get('columns'),
            topics_per_cell: this.model.get('topics_per_cell'),
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
