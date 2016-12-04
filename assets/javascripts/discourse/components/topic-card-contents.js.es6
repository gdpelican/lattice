import { wantsNewWindow } from 'discourse/lib/intercept-click';
import { propertyNotEqual, setting } from 'discourse/lib/computed';
import CleansUp from 'discourse/mixins/cleans-up';
import afterTransition from 'discourse/lib/after-transition';
import { default as computed, observes } from 'ember-addons/ember-computed-decorators';
import DiscourseURL from 'discourse/lib/url';
import Topic from 'discourse/models/topic';
import { ajax } from 'discourse/lib/ajax';

const clickOutsideEventName = "mousedown.outside-topic-card";
const clickDataExpand = "click.discourse-topic-card";

export default Ember.Component.extend(CleansUp, {
  elementId: 'topic-card',
  classNameBindings: ['visible:show', 'showBadges', 'hasCardBadgeImage'],

  visible: false,
  topicCache: {},
  topic: null,
  cardTarget: null,

  _show(topicId, $target) {

    // Don't show on mobile
    if (this.site.mobileView) {
      DiscourseURL.routeTo(`/t/${topicId}`);
      return false;
    }

    const currentTopicId = this.get('topic.id');
    if (topicId === currentTopicId) {
      return;
    }

    const wasVisible = this.get('visible');
    const previousTarget = this.get('cardTarget');
    const target = $target[0];

    this.set('topicId', topicId)
    this.set('cardTarget', target)

    if (wasVisible) {
      this._close();
      if (target === previousTarget) { return; }
    }

    if (this.topicCache[topicId]) {
      this.set('topic', this.topicCache[topicId])
      this.set('visible', true)
      this._positionCard($target)
    } else {
      ajax(`/lattices/topic-card/${topicId}`).then((data) => {
        let topic = Topic.create(data)
        this.set('topic', topic)
        this.set('visible', true)
        this.topicCache[topicId] = topic
        this._positionCard($target)
      }).catch(() => {
        this._close()
      })
    }

    return false;
  },

  didInsertElement() {
    this._super();
    afterTransition(this.$(), this._hide.bind(this));

    $('html').off(clickOutsideEventName)
      .on(clickOutsideEventName, (e) => {
        if (this.get('visible')) {
          const $target = $(e.target);
          if ($target.closest('[data-topic-card]').data('topicCard') ||
            $target.closest('#topic-card').length > 0) {
            return;
          }
          this._close();
        }

        return true;
      });

    $('#main-outlet').on(clickDataExpand, '[data-topic-card]', (e) => {
      if (wantsNewWindow(e)) { return; }
      const $target = $(e.currentTarget);
      return this._show($target.data('topic-card'), $target);
    });
  },

  _positionCard(target) {
    const rtl = ($('html').css('direction')) === 'rtl';
    if (!target) { return; }
    const width = this.$().width();

    Ember.run.schedule('afterRender', () => {
      if (target) {
        let position = target.offset();
        if (position) {

          if (rtl) { // The site direction is rtl
            position.right = $(window).width() - position.left + 10;
            position.left = 'auto';
            let overage = ($(window).width() - 50) - (position.right + width);
            if (overage < 0) {
              position.right += overage;
              position.top += target.height() + 48;
            }
          } else { // The site direction is ltr
            position.left += target.width() + 10;

            let overage = ($(window).width() - 50) - (position.left + width);
            if (overage < 0) {
              position.left += overage;
              position.top += target.height() + 48;
            }
          }

          position.top -= $('#main-outlet').offset().top;
          this.$().css(position);
        }
      }
    });
  },

  _hide() {
    if (!this.get('visible')) {
      this.$().css({left: -9999, top: -9999});
    }
  },

  _close() {
    this.setProperties({
      visible: false,
      topic: null,
      cardTarget: null
    });
  },

  cleanUp() {
    this._close();
  },

  keyUp(e) {
    if (e.keyCode === 27) { // ESC
      const target = this.get('cardTarget');
      this._close();
      target.focus();
    }
  },

  willDestroyElement() {
    this._super();
    $('html').off(clickOutsideEventName);
  }
});
