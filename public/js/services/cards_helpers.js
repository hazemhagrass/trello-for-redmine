angular.module('trelloRedmine')
.service('cardsHelpers', ['redmineAPI', 'redmineService', 'sortingUtility', 'activitiesHelpers', function (redmineAPI, redmineService, sortingUtility, activitiesHelpers){

  return {
    update_status: update_status
  }

  function update_status(item){
    if( item.sortable.received ){
      var card_id = item.attr('id');
      var source_status = item.sortable.source.attr('widget-status');
      var target_status = item.sortable.droptarget.attr('widget-status');
      var source_widget = redmineAPI.widgets[source_status-1].cards;
      var target_widget = redmineAPI.widgets[target_status-1].cards;
      var moved_card =  item.sortable.model;
      moved_card.card_loading = true;
      // cancel here to stop the library from removing the card from the source and remove it manually later
      item.sortable.cancel();
      source_widget.splice(source_widget.indexOf(moved_card), 1);
      moved_card.status.id = Number(target_status);
      moved_card.status.name = redmineAPI.allowed_statuses_names[target_status-8];
      sortingUtility.insertInOrder(target_widget, moved_card);
      redmineService.updateIssue(card_id, {
        status_id: target_status
      }).then(function(result){
        activitiesHelpers.synchronize(true);
      }, function() {
        // Moving card back to its original widget in case of error
        target_widget.splice(target_widget.indexOf(moved_card), 1);
        moved_card.status.id = Number(source_status);
        moved_card.status.name = redmineAPI.allowed_statuses_names[source_status-8];
        sortingUtility.insertInOrder(source_widget, moved_card);
      }).finally(function() {
        // delete is better than setting to false because we send the card in another update request
        delete moved_card.card_loading;
      });
    } else {
      item.sortable.cancel();
      sortingUtility.reorderWidgetElement(item.sortable.sourceModel, item.attr('id'));
    }
  };

}]);