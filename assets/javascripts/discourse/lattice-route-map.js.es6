export default function() {
  this.resource('lattice', { path: '/lattices/:id' })
  this.resource('lattice', { path: '/lattices/:id/:slug' })
}
