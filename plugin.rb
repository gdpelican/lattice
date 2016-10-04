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

    class Model < PluginStoreRow
      LATTICE_ATTRIBUTES = [:title, :slug, :rows, :columns, :topics_per_cell]

      default_scope { where(plugin_name: LATTICE_PLUGIN_NAME) }

      def initialize(attrs = {})
        super attrs.merge(plugin_name: LATTICE_PLUGIN_NAME, key: SecureRandom.hex(6), type_name: :JSON)
      end

      def value
        JSON.parse(self[:value] || "{}")
      end

      def value=(value)
        raise NotImplementedError.new # only allow individual setting of attributes
      end

      LATTICE_ATTRIBUTES.each do |field|
        define_method field, ->          { value[field.to_s] }
        define_method "#{field}=", ->(new_value) {
          self[:value] = value.tap { |current| current[field.to_s] = new_value }.to_json
        }
      end

    end

    class Controller < ::ApplicationController
      requires_plugin LATTICE_PLUGIN_NAME
      define_method :show, ->{}
    end

    class Serializer < ::ActiveModel::Serializer
      attributes :title, :slug, :rows, :columns, :topics_per_cell
    end

    Engine.routes.draw { get "/:id(/:slug)" => "#show" }
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
      @lattice = Lattice::Model.new(lattice_params)
    end

    def find_lattice
      @lattice = Lattice::Model.find(params[:id])
    end

    def respond
      if yield
        render json: Lattice::Serializer.new(@lattice).as_json, status: 200
      else
        render json: { message: "Unable to perform action", errors: @lattice.errors }, status: 422
      end
    end

    def lattice_params
      params.require(:lattice).permit(Lattice::Model::LATTICE_ATTRIBUTES)
    end
  end

end
