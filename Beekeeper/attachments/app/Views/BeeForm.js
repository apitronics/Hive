$(function() {

  App.Views.BeeForm = Backbone.View.extend({

    className: "form",

    events: {
      "click #save": "setForm",
      "submit form" : "setFormFromEnterKey"
    },

    render: function() {
      // create the form
      var lastSynced = this.model.get('wundergroundLastSynced'),
          wundergroundId = this.model.get('wundergroundId'),
          wundergroundPassword = this.model.get('wundergroundPassword');

      this.form = new Backbone.Form({ model: this.model })
      this.$el.append(this.form.render().el)

      if(!!wundergroundId && !!wundergroundPassword) {
        lastSyncDate = !!lastSynced ? moment.unix(lastSynced).format("LLLL") : 'Never';
        var $lastSynced = $('<p>Wunderground last synced: ' + lastSyncDate + '</p>');
        this.$el.append($lastSynced);
      } else {
        var $wundergroundLink = $('<p><a href="http://www.wunderground.com/weatherstation/setup.asp" target="_blank">Create Wunderground account</a></p>');
        this.$el.append($wundergroundLink);
      }

      // placeholder wunderground station id
      this.$el.find('input[name="wundergroundId"]').attr('placeholder', 'KMACAMBR9');

      var $button = $('<a class="btn" id="save">save</a>')
      this.$el.append($button)
    },

    delete: function() {
      this.model.destroy()
    },

    setFormFromEnterKey: function(event) {
      event.preventDefault()
      this.setForm()
    },

    setForm: function() {
      var form = this
      form.form.commit()
      form.model.once('sync', function() {
        form.trigger('Form:done')
      })
      form.model.save()
    },

  });

});
