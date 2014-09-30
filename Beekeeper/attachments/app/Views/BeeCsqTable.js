$(function() {

  App.Views.BeeCsqTable = Backbone.View.extend({

    tagName: 'table',

    className: 'table table-striped',

    template: $('#template-BeeCsqTable').html(),

    templateHeader: $('#template-BeeCsqHeader').html(),

    addOne: function(csqRow){
      var beeCsqView = new App.Views.BeeCsq({csqRow: csqRow});
      beeCsqView.render();
      this.$el.append(beeCsqView.el);
    },

    addAll: function(){
      this.csq.attributes.rows.forEach(this.addOne, this);
    },

    initialize: function(obj){
      this.bee = obj.bee;
      this.csq = obj.csq;
      this.showMore = this.csq.attributes.rows.length == 1;
    },

    render: function(){
      this.$el.append(_.template(this.templateHeader, {showMore: this.showMore, beeId: this.bee.id}));
      this.addAll();
    }

  });

});
