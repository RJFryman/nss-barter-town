(function(){

  'use strict';

  $(document).ready(initialize);

  var query = {limit:10, page:1, direction:1};

  function initialize(){
    $(document).foundation();
    $('#items').on('click', '.filter', filteritems);
    $('#items').on('click', '.sort', sortitems);
    $('#prev').click(clickPrev);
    $('#next').click(clickNext);
    getAllitems();
  }

  function sortitems(event){
    if($(this).hasClass('isComplete')){
      query.sort = 'isComplete';
    }else{
      query.sort = 'dueDate';
    }

    query.direction *= -1;
    generateQuery();
    event.preventDefault();
  }

  function filteritems(event){
//    var self = this;
    if($(this).hasClass('year')){
      query.filterName = 'year';
      query.filterValue = $(this).text();
    }else if ($(this).hasClass('cost')){
      query.filterName = 'cost';
      query.filterValue = $(this).text();
    }else if ($(this).hasClass('tags')){
      query.filterName = 'tags';
      query.filterValue = $(this).text();
    }else{ ($(this).hasClass('category'));
      query.filterName = 'category';
      query.filterValue = $(this).text();
    }


    generateQuery();
    event.preventDefault();
  }

  function clickPrev(){
    if(query.page > 1){query.page--;}
    query.limit = $('#limit').val() * 1 || query.limit;
    generateQuery();
  }

  function clickNext(){
    query.page++;
    query.limit = $('#limit').val() * 1 || query.limit;
    generateQuery();
  }

  function generateQuery(){
    var url = '/items';
    var data = query;
    var type = 'GET';
    var success = additemsToTable;

    $.ajax({data:data, url:url, type:type, success:success});
  }

  function getAllitems(){
    var url ='/items';
    var type = 'GET';
    var success = additemsToTable;

    $.ajax({url:url, type:type, success:success});
  }

  function additemsToTable(payload){
    $('#items > tbody').empty();
    $('#page').text(query.page);

    for(var i = 0; i < payload.items.length; i++){
      additemToTable(payload.items[i]);
    }
  }

  function additemToTable(item){
    var $row = $('<tr>');
    var $name = $('<td>');
    var $year = $('<td>');
    var $description = $('<td>');
    var $cost = $('<td>');
    var $tags = $('<td>');
    var $category = $('<td>');

    $row.attr('data-item-id', item._id);

    $name.text(item.name);
    $year.append('<a class="filter year" href="#">'+item.year+'</a>');
    $description.text(item.description.slice(0,50+'...'));
    $cost.append('<a class="filter cost" href="#">'+item.cost+'</a>');
    $category.append('<a class="filter category" href="#">'+item.category+'</a>');

    for(var i = 0; i < item.tags.length; i++){
      var tag = item.tags[i];
      $tags.append('<a class="filter tags" href="#">'+tag+'</a>');
    }

    $row.append($name, $year, $description, $cost, $tags, $category);
    $('#items > tbody').append($row);
  }

})();

