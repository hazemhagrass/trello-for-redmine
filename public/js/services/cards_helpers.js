angular.module('trelloRedmine')
.service('cardsHelpers', function (){

  return {
    calculateProgress: calculateProgress,
    insertInOrder: insertInOrder,
    reorderWidgetElement: reorderWidgetElement
  }

  function calculateProgress(card) {
      card.progress = ( card.subTasks.length == 0) ? 0 : parseInt(( card.finishedTasks / card.subTasks.length ) * 100);
  };

  function insertInOrder(array, element) {
      var i = 0;
      while(i < array.length && element.id < array[i].id) { i++; }
      array.splice(i, 0, element);
  }

  function reorderWidgetElement(array, id) {
      var card = null;
      array.some(function(element, index){
          if(element.id == id){
              card = element;
              array.splice(index, 1);
              return true;
          }
      });
      insertInOrder(array, card);
  }
});