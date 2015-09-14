angular.module('trelloRedmine')
.service('cardsHelpers', ['redmineAPI', 'redmineService', 'sortingUtility', 'activitiesHelpers', function (redmineAPI, redmineService, sortingUtility, activitiesHelpers){

  return {
    calculateProgress: calculateProgress,
    update_status: update_status
  }

  function calculateProgress(card) {
      card.progress = ( card.subTasks.length == 0) ? 0 : parseInt(( card.finishedTasks / card.subTasks.length ) * 100);
  };

  function update_status(item){
    var has_moved = item.sortable.received;
    var card_id = item.attr('id');
    if(has_moved) {
      var target_status = item.sortable.droptarget.attr('widget-status');
      var card_target_index = item.sortable.dropindex;
      var target_widget = redmineAPI.widgets[target_status-1];
      var moved_card =  target_widget.cards.length === 1 ? target_widget.cards[0] : target_widget.cards[card_target_index];
      moved_card.card_loading = true;
      redmineService.updateIssue(card_id, {
        status_id: target_status
      }).then(function(result){
        moved_card.status.id = Number(target_status);
        moved_card.status.name = redmineAPI.allowed_statuses_names[target_status-8];
        sortingUtility.reorderWidgetElement(target_widget.cards, card_id);
        activitiesHelpers.appendCard(moved_card);
      }).finally(function() {
        // delete is better than setting to false because we send the card in another update request
        delete moved_card.card_loading;
      });
    } else {
      sortingUtility.reorderWidgetElement(item.sortable.sourceModel, card_id);
    }
  }
}]);