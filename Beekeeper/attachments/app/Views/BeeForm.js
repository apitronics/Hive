$(function() {

  App.Views.BeeForm = Backbone.View.extend({
    
    className: "form",

    events: {
      "click #save": "setForm",
      "submit form" : "setFormFromEnterKey"
    },

    render: function() {
      // create the form
      this.form = new Backbone.Form({ model: this.model })
      this.$el.append(this.form.render().el)
      // disable the Address field, just for show
      this.$el.find('input[name="address"').prop('disabled', true)
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
