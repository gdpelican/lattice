export default {
  resource: 'admin',
  map() {
    this.resource('adminLattices', { path: '/lattices' }, function() {
      this.resource('adminLattice', { path: '/:id' });
    });
  }
};
