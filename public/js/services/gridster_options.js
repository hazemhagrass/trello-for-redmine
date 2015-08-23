angular.module('trelloRedmine')
.value('gridsterOptions', {
  margins: [20, 20],
  columns: 3,
  draggable: {
    handle: '.box-header'
  },
  swapping: true,
  resizable: {
    handles: ['s']
  }
});