$(function() {

  App.Models.Csq = Backbone.Model.extend({
    url: function() {
      var noLimit = this.get('noLimit');

      return '/csq_' + this.id + '/_all_docs' +
        '?startkey="FFFFF"' +
        '&endkey=""' +
        '&include_docs=true' +
        (noLimit ? '' : '&limit=1') +
        '&descending=true';
    }

  });

});
