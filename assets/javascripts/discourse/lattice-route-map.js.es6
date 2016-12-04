export default function() {
  this.route('lattice', { path: '/lattices/:id' })
  this.route('lattice', { path: '/lattices/:id/:slug' })
}
