$(function() {

  App.Views.TriggerForm = Backbone.View.extend({
    
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
      // give the form a submit button
      var $button = $('<a class="btn" id="save">save</a><a class="btn" id="delete">delete</a>')
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
      // Put the form's input into the model in memory
      this.form.commit()
      // Send the updated model to the server
      this.model.save()
    },


  });

});
