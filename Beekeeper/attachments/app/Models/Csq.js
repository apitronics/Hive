$(function() {

  App.Models.Csq = Backbone.Model.extend({
    url: function() {
      return '/csq_' + this.id + '/_all_docs' +
        '?startkey="FFFFF"' +
        '&endkey=""' +
        '&include_docs=true&limit=1&descending=true';
    }

  });

});
