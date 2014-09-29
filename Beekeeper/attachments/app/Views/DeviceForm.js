$(function() {

  App.Views.DeviceForm = Backbone.View.extend({

    className: "form form-device",

    events: {
      "click #save": "setForm",
      "submit form" : "setFormFromEnterKey"
    },

    render: function() {
      this.model.loadDeviceDefinition();
      this.model.once('loadDeviceDefinition:done', _.bind(this.onLoadDeviceDefinition, this));
    },

    delete: function() {
      this.model.destroy();
    },

    onLoadDeviceDefinition: function(){
      var dd = this.model.deviceDefinition,
          parameters = dd.get('parameters'),
          schema = {},
          name = this.model.get('name') || dd.get('name');

      _.each(parameters, function(input){
        var key = _(_(input.name).slugify()).camelize();

        if(typeof this.model.get(key) == 'undefined') {
          this.model.set(key, input['default']);
        }

        schema[key] = { options: input.options, title: _(input.name).titleize() + (!!input.units ? (" (" + input.units + ")") : ""), type: input.type, validators: input.validators };
      });

      this.model.schema = _.extend({}, this.model.schema, schema);

      this.form = new Backbone.Form({ model: this.model });
      this.$el.append($('<h2 class="title">').text('Update ' + name));
      this.$el.append(this.form.render().el);
      var $button = $('<a class="btn" id="save">save</a>');
      this.$el.append($button);
    },

    setFormFromEnterKey: function(event) {
      event.preventDefault();
      this.setForm();
    },

    setForm: function() {
      var form = this,
          errors = form.form.commit();

      if(!errors) {
        form.model.once('sync', function() {
          form.trigger('Form:done');
        });
        form.model.save();
      }
    }

  });

});
