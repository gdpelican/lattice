export default {
  resource: 'admin',
  map() {
    this.route('adminLattices', { path: '/lattices', resetNamespace: true }, function() {
      this.route('adminLattice', { path: '/:id', resetNamespace: true })
    })
  }
}
