# name: lattice
# about: Bidirectional navigation for Discourse
# version: 0.0.1
# authors: James Kiesel (gdpelican)
# url: https://github.com/gdpelican/lattice

register_asset "stylesheets/lattice.scss"
register_asset "stylesheets/topic-card.scss"

LATTICE_PLUGIN_NAME ||= "lattice".freeze

# enabled_site_setting :lattice_enabled

after_initialize do
  module ::Lattice
    class Engine < ::Rails::Engine
      engine_name LATTICE_PLUGIN_NAME
      isolate_namespace Lattice
    end

    class Model < PluginStoreRow
      LATTICE_ATTRIBUTES = [:enabled, :title, :slug, :description, :rows, :columns, :topics_per_cell, :limit_by_category, :category_id]

      def self.enabled
        where(plugin_name: LATTICE_PLUGIN_NAME).select(&:enabled)
      end

      def initialize(attrs = {})
        super attrs.merge(plugin_name: LATTICE_PLUGIN_NAME, key: SecureRandom.hex(6), type_name: :JSON)
      end

      def topics_for(user)
        group_topics_by_tag(available_topics_for(user), :rows).tap do |table|
          table.keys.each do |row|
            table[row] = group_topics_by_tag(table[row], :columns)
            table[row].keys.each do |column|
              table[row][column] = ActiveModel::ArraySerializer.new(table[row][column],
                each_serializer: TopicSerializer,
                root: false
              ).as_json
            end
          end
        end
      end

      def all_tags_for(user)
        available_topics_for(user)
      end

      def value
        JSON.parse(self[:value] || "{}")
      end

      def value=(value)
        raise NotImplementedError.new # only allow individual setting of attributes
      end

      LATTICE_ATTRIBUTES.each do |field|
        define_method field, -> { value[field.to_s] }
        define_method "#{field}=", ->(new_value) {
          self[:value] = value.tap { |current| current[field.to_s] = new_value }.to_json
        }
      end

      def enabled
        value['enabled'] == 'true'
      end

      def slug
        value.fetch('slug', title.parameterize)
      end

      def limit_by_category
        value['limit_by_category'] == 'true'
      end

      def category_id
        value['category_id'].to_i
      end

      private

      def available_topics_for(user)
        TopicQuery.new(user, category: (self.category_id if self.limit_by_category), tags: self.rows, per_page: 1000).latest_results.includes(:user)
      end

      def group_topics_by_tag(topics, field)
        topics.joins(:tags).group_by { |topic| (topic.tags.pluck(:name) & send(field)).first }
      end

    end

    class Controller < ::ApplicationController
      requires_plugin LATTICE_PLUGIN_NAME
      def index
        render json: ActiveModel::ArraySerializer.new(Model.enabled, each_serializer: Serializer, root: :lattices).as_json, status: 200
      end

      def show
        render json: Serializer.new(Model.find(params[:id]), scope: serializer_scope, root: false).as_json, status: 200
      end

      def topic_card
        render json: TopicCardSerializer.new(Topic.find(params[:id]), root: false).as_json, status: 200
      end

      private

      def serializer_scope
        { current_user: current_user, with_topics: true }
      end
    end

    class Serializer < ::ActiveModel::Serializer
      attributes :id, :topics
      attributes *Model::LATTICE_ATTRIBUTES

      def topics
        object.topics_for(Hash(scope)[:current_user])
      end

      def include_topics?
        Hash(scope)[:with_topics]
      end
    end

    Engine.routes.draw do
      get "/topic-card/:id" => "#topic_card"
      get "/:id(/:slug)" => "#show"
      get "/" => "#index"
    end

    class TopicSerializer < BasicTopicSerializer
      attributes :created_by

      def created_by
        BasicUserSerializer.new(object.user, scope: scope, root: false)
      end
    end

    class TopicCardSerializer < BasicTopicSerializer
      include UserNotificationsHelper
      attributes :last_poster, :excerpt, :posts_count, :views, :participant_count, :like_count, :last_posted_at, :created_at

      def last_poster
        BasicUserSerializer.new(object.last_poster, scope: scope, root: false)
      end

      def excerpt
        first_paragraph_from object.posts.first.cooked
      end

    end
  end

  Discourse::Application.routes.append do
    mount ::Lattice::Engine, at: "/lattices"
    namespace :admin, constraints: StaffConstraint.new do
      resources :lattices, only: [:show, :index, :create, :update, :destroy]
    end
  end

  class Admin::LatticesController < ::ApplicationController
    requires_plugin LATTICE_PLUGIN_NAME
    before_action :build_lattice, only: :create
    before_action :find_lattice, only: [:show, :update, :destroy]

    def show
      respond { @lattice }
    end

    def index
      @lattices = Lattice::Model.all
      render json: ActiveModel::ArraySerializer.new(@lattices, each_serializer: Lattice::Serializer).as_json, status: 200
    end

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
        render json: Lattice::Serializer.new(@lattice, root: false).as_json, status: 200
      else
        render json: { message: "Unable to perform action", errors: @lattice.errors }, status: 422
      end
    end

    def lattice_params
      params.require(:lattice)
            .permit(:enabled, :title, :slug, :description, :topics_per_cell, :limit_by_category, :category_id, rows: [], columns: [])
    end
  end

end
