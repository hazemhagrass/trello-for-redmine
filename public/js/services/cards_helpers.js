angular.module('trelloRedmine')
.service('cardsHelpers', function (){

  return {
    calculateProgress: calculateProgress
  }

  function calculateProgress(card) {
      card.progress = ( card.subTasks.length == 0) ? 0 : parseInt(( card.finishedTasks / card.subTasks.length ) * 100);
  };

});