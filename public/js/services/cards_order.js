angular.module('trelloRedmine')
.service('cardsOrder', function (){

    return {
        insertInOrder: insertInOrder,
        reorderWidgetElement: reorderWidgetElement
    }
    
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