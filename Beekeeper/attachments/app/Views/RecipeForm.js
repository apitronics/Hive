$(function() {

  App.Views.RecipeForm = Backbone.View.extend({

    className: "form",

    events: {
      "click #save": "setForm",
      "click #delete": "delete",
      "submit form" : "setFormFromEnterKey"
    },

    render: function() {
      // create the form
      this.form = new Backbone.Form({ model: this.model })
      this.$el.append(this.form.render().el)
      $('input[name="beeId"]').attr('disabled', 'disabled')
      // give the form a submit button
      var $button = $('<a class="btn" id="save">save</a><a class="btn" id="delete">delete</a>')
      this.$el.append($button)
    },

    delete: function() {
      var form = this
      this.model.on('destroy', function() {
        form.trigger('done')
      })
      this.model.destroy()
    },

    setFormFromEnterKey: function(event) {
      event.preventDefault()
      this.setForm()
    },

    setForm: function() {
      // Put the form's input into the model in memory
      this.form.commit()
      // Send the updated model to the server
      var form = this
      this.model.on('sync', function() {
        form.trigger('done')
      })
      this.model.save()
    },


  });

});
