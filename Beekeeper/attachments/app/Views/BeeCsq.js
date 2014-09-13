$(function() {

  App.Views.BeeCsq = Backbone.View.extend({

    template: $('#template-BeeCsq').html(),

    initialize: function (obj) {
      this.csq = obj.csq;
    },

    render: function(){
      var rows = this.csq.get('rows');

      if(typeof rows === 'undefined') return;

      var doc = this.csq.get('rows')[0].doc,
          vars = {
            bee: this.csq.id,
            csq: doc.d,
            timestamp: moment.unix(doc._id).calendar()
          };
      this.$el.html(_.template(this.template, vars));
    }

  });

});
