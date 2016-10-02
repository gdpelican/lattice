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

    class Controller < ::ApplicationController
      requires_plugin LATTICE_PLUGIN_NAME
      define_method :show, ->{}
    end

    class Serializer < ::ActiveModel::Serializer
      attributes :title, :slug, :rows, :columns, :topics_per_cell
    end

    Engine.routes.draw { get "/:id(/:slug)" => "lattices#show" }
  end

  Discourse::Application.routes.append do
    mount ::Lattice::Engine, at: "/lattices"
    namespace :admin, constraints: StaffConstraint.new do
      resources :lattices, only: [:show, :index, :create, :update, :destroy]
    end
  end

  class Admin::LatticesController < ::ApplicationController
    requires_plugin LATTICE_PLUGIN_NAME
    define_method :index, ->{}
    define_method :show, ->{}
    before_action :build_lattice, only: :create
    before_action :find_lattice, only: [:update, :destroy]

    def create
      respond { @lattice.save }
    end

    def update
      respond { @lattice.update(lattice_params) }
    end

    def destroy
      respond { @lattice.destroy }
    end

    private

    def build_lattice
      @lattice = Lattice.new(lattice_params)
    end

    def find_lattice
      @lattice = Lattice.find(params[:id])
    end

    def respond
      if yield
        render json: Lattice::Serializer.new(@lattice).as_json, status: 200
      else
        render json: { message: "Unable to perform action", errors: @lattice.errors }, status: 422
      end
    end

    def lattice_params
      params.require(:lattice).permit(:name, :slug, :rows, :columns, :categories, :topics_per_cell)
    end
  end

end
