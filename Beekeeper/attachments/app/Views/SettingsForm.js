$(function() {

  App.Views.SettingsForm = Backbone.View.extend({

    title: "Settings",

    className: "settings form",

    events: {
      "click #save": "setForm",
      "click .btn-update-hive": "confirmUpdate",
      "submit form" : "setFormFromEnterKey",
      "click input[name='saveToCloud']": "clickSaveToCloud"
    },

    render: function() {
      // create the form
      this.form = new Backbone.Form({ model: this.model })
      this.$el.append('<h2>' + this.title + '</h2>')
      this.$el.append(this.form.render().el)

      // add register cloud link
      var $register = $('<a class="register" href="https://cloud.apitronics.com/register" target="_blank">Sign up for cloud account</a>');
      $(this.$el).find('.field-saveToCloud').append($register);

      // give the form a submit button
      var $save = $('<a class="btn btn-form btn-save" id="save">save</a>');
      this.$el.append($save);

      // add update hive button
      var $update = $('<a class="btn btn-form btn-update-hive" href="/update/check">Update Hive</a>');
      this.$el.append($update);
    },

    delete: function() {
      this.model.destroy()
    },

    clickSaveToCloud: function(e) {
      var $el = $(e.target),
          checked = $el.is(':checked'),
          cloudUserName = $('input[name="cloudUserName"]').val(),
          cloudPassword = $('input[name="cloudPassword"]').val();

      if(checked && (!cloudUserName || !cloudPassword)){
        alert('Please type in your cloud username and password or create a new account.');
        $el.prop('checked', false);
      }
    },

    confirmUpdate: function(e) {
      var $link = $(e.target),
          checkUrl = $link.attr('href');

      $.get(checkUrl, function(data){
        var updates = data;

        console.log(updates);
        if(updates !== '') {
          if(confirm('Do you want to install these updates?\n\n' + updates + '\n\nNote: please do not turn off Hive until done updating.')){
            $.get('/update/run', function(){
              window.location = '/beekeeper/?updated';
            });
          }
        } else {
          alert('There are currently no updates.');
        }
      });

      return false;
    },

    setFormFromEnterKey: function(event) {
      event.preventDefault()
      this.setForm()
    },

    setForm: function() {
      var form = this
      // Put the form's input into the model in memory
      form.form.commit()
      // Send the updated model to the server
      form.model.once('sync', function() {
        form.trigger('done')
      })
      form.model.save()
    },

  });

});
