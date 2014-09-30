$(function() {

  App.Views.BeeCsq = Backbone.View.extend({

    tagName: 'tr',

    template: $('#template-BeeCsq').html(),

    initialize: function (obj) {
      this.csq = obj.csq;
      this.csqRow = obj.csqRow;
    },

    render: function(){
      var doc, vars;

      if(typeof this.csqRow !== 'undefined') {
        doc = this.csqRow.doc;
        vars = {
          csq: doc.d,
          timestamp: moment.unix(doc._id).calendar()
        };
        this.$el.html(_.template(this.template, vars));
      } else {
        var rows = this.csq.get('rows');

        if(typeof rows === 'undefined') return;

        doc = rows[0].doc;
        vars = {
          csq: doc.d,
          timestamp: moment.unix(doc._id).calendar()
        };
        this.$el.html(_.template(this.template, vars));
      }
    }

  });

});
