# name: lattice
# about: Bidirectional navigation for Discourse
# version: 0.0.1
# authors: James Kiesel (gdpelican)
# url: https://github.com/gdpelican/lattice

LATTICE_PLUGIN_NAME ||= "lattice".freeze

# enabled_site_setting :lattice_enabled

after_initialize do
  module ::Lattice
    class Engine < ::Rails::Engine
      engine_name LATTICE_PLUGIN_NAME
      isolate_namespace Lattice
    end
  end

  Lattice::Engine.routes.draw do
    get "/:id" => "lattices#show"
  end

  Discourse::Application.routes.append do
    mount ::Lattice::Engine, at: "/lattices"
    namespace :admin, constraints: StaffConstraint.new do
      resources :lattices, only: [:show, :index]
    end
  end

  class Lattice::LatticesController < ::ApplicationController
    requires_plugin LATTICE_PLUGIN_NAME
    define_method :show, ->{}
  end

  class ::Admin::LatticesController < ::ApplicationController
    requires_plugin LATTICE_PLUGIN_NAME
    define_method :index, ->{}
    define_method :show, ->{}
  end

end
