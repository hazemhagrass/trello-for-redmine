angular.module('trelloRedmine')
.service('cardsOrder', function (){

    this.insertInOrder = function(array, element){
        var i = 0;
        while(i < array.length && element.id < array[i++].id);
        // i is incremented by 1 when reaching the required place so we insert in i-1, CORNER CASE the element is with the least id, so we don't decrement i
        i === array.length ? array.splice(i, 0, element) : array.splice(i-1, 0, element);
    }

    this.reorderWidgetElement = function(array, id){
        var card = null;
        array.some(function(element, index){
            if(element.id == id){
                card = element;
                array.splice(index, 1);
                return true;
            }
        });
        this.insertInOrder(array, card);
    }

});