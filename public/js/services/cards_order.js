angular.module('trelloRedmine')
.service('cardsOrder', function (){

    this.insertInOrder = function(array, element){
        var i = 0;
        while(i < array.length && element.id < array[i++].id);
        array.splice(i-1, 0, element);
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