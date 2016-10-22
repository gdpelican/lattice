import { wantsNewWindow } from 'discourse/lib/intercept-click';
import { setting } from 'discourse/lib/computed';
import CleansUp from 'discourse/mixins/cleans-up';
import afterTransition from 'discourse/lib/after-transition';

const clickOutsideEventName = "mousedown.outside-topic-card",
      clickDataExpand = "click.discourse-topic-card",
      clickMention = "click.discourse-user-mention";

export default Ember.View.extend(CleansUp, {
  elementId: 'topic-card',
  classNameBindings: ['controller.visible:show', 'controller.showBadges', 'controller.hasCardBadgeImage'],
  allowBackgrounds: setting('allow_profile_backgrounds'),

  addBackground: function() {
    const url = this.get('controller.user.card_background');

    if (!this.get('allowBackgrounds')) { return; }

    const $this = this.$();
    if (!$this) { return; }

    if (Ember.isEmpty(url)) {
      $this.css('background-image', '').addClass('no-bg');
    } else {
      $this.css('background-image', "url(" + Discourse.getURLWithCDN(url) + ")").removeClass('no-bg');
    }
  }.observes('controller.user.card_background'),

  _setup: function() {
    afterTransition(this.$(), this._hide.bind(this));

    $('html').off(clickOutsideEventName)
      .on(clickOutsideEventName, (e) => {
        if (this.get('controller.visible')) {
          const $target = $(e.target);
          const topicId = $target.data('topic-card')
          if ((topicId && topicId == $target.closest('[data-topic-card]').data('topic-card')) || $target.closest('#topic-card').length > 0) {
            return;
          }

          this.get('controller').close();
        }

        return true;
      });

    $('#main-outlet').on(clickDataExpand, '[data-topic-card]', (e) => {
      if (wantsNewWindow(e)) { return; }
      let $target = $(e.currentTarget)
      let topicId = $target.data('topic-card')
      this.get('controller').set('topic', this.get('controller.parentController.model').getTopic(topicId))
      return this._willShow($target);
    });

    this.appEvents.on('usercard:shown', this, '_shown');
  }.on('didInsertElement'),

  _willShow(target) {
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
          Ember.run.next(null, () => this.$('a:first').focus() );
        }

        this.get('controller').set('visible', true);
        this.appEvents.trigger('topiccard:shown');
      }
    });
  },

  _hide() {
    if (!this.get('controller.visible')) {
      this.$().css({left: -9999, top: -9999});
    }
  },

  cleanUp() {
    this.get('controller').close();
  },

  keyUp(e) {
    if (e.keyCode === 27) { // ESC
      const target = this.get('controller.cardTarget');
      this.cleanUp();
      target.focus();
    }
  },

  _removeEvents: function() {
    $('html').off(clickOutsideEventName);

    $('#main').off(clickDataExpand).off(clickMention);

    this.appEvents.off('usercard:shown', this, '_shown');
  }.on('willDestroyElement')

});
