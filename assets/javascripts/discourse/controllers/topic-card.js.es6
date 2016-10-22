import DiscourseURL from 'discourse/lib/url';
import { propertyNotEqual, setting } from 'discourse/lib/computed';
import computed from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({
  needs: ['topic', 'application'],
  visible: false,
  close() {
    this.setProperties({ visible: false });
  }
});
