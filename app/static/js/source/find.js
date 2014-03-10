(function(){

  'use strict';

  $(document).ready(initialize);

  var query = {limit:10, page:1, direction:1};

  function initialize(){
    $(document).foundation();
    $('#cats').on('click', '.filter', filteritems);
    $('#items').on('click', '.filter', filteritems);
    $('#items').on('click', '.sort', sortitems);
    $('#prev').click(clickPrev);
    $('#next').click(clickNext);
    $('#toggleCats').click(toggleCats);
    $('#clearFilter').click(clearFilter);
    getAllitems();
  }

  function toggleCats(){
    $('#cats').toggleClass('hide');
  }

  function clearFilter(){
    query = {limit:10, page:1, direction:1};
    generateQuery();
    event.preventDefault();
  }

  function sortitems(event){
    if($(this).hasClass('year')){
      query.sort = 'year';
    }else{
      query.sort = 'cost';
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
    var url = '/find';
    var data = query;
    var type = 'GET';
    var success = additemsToTable;

    $.ajax({data:data, url:url, type:type, success:success});
  }

  function getAllitems(){
    var url ='/find';
    var type = 'GET';
    var success = additemsToTable;

    $.ajax({url:url, type:type, success:success});
  }

  function additemsToTable(payload){
    $('.list-table').slideUp(300).delay(800).fadeIn(800);
    $('#items > tbody').empty();
    $('#page').fadeIn(500, function(){
      $('#page').text(query.page);
    });

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

    $name.append('<a href="/items/'+item._id.toString()+'">'+item.name+'</a>').fadeIn(1000);

    $year.append('<a class="filter year" href="#">'+item.year+'</a>').fadeIn(1000);
    if(item.description.length >= 180){
      $description.text(item.description.toString().slice(0,179)+'...').fadeIn(1000);
    }else{
      $description.text(item.description);
    }
    $cost.append('<a class="filter cost" href="#">'+item.cost+'</a>').fadeIn(1000);
    $category.append('<a class="filter category" href="#">'+item.category+'</a>').fadeIn(1000);

    for(var i = 0; i < item.tags.length; i++){
      var tag = item.tags[i];
      $tags.append('<a class="filter tags" href="#">'+tag+'</a>'+ ' ' ).fadeIn(1000);
    }

    $row.append($name, $year, $description, $cost, $tags, $category).fadeIn(1000);
    $('#items > tbody').append($row);
  }

})();

