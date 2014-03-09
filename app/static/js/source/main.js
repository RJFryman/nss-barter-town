(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('.togglelink').click(loadLoginPop);
    $('.togglelinkreg').click(loadRegistrationPop);
    $('.loginButton').click(loginUser);
    $('#login-data').on('click', '.closelogin', closeLoginPop);
    $('.login-form-reg form').on('click', '.closeReg', closeRegPop);
  }
  
  function closeRegPop(){
    $('.test').fadeOut(800);
    $('.login-form-reg').fadeOut(500);
  }

  function closeLoginPop(){
    $('.test').fadeOut(800);
    $('.login-form').fadeOut(500);
  }

  function loginUser(event){
    var url = '/login';
    var type = 'POST';
    var data = $('#login-data').serialize();
    var success = reloadPage;

    $.ajax({url:url, type:type, data:data, success:success});
    event.preventDefault();
  }

  function reloadPage(data){
    console.log(data);
    if (data.success){
      location.reload();
    } else {
      $('.login-err').text('Email and Password don\'t match');
    }
  }
  function loadRegistrationPop(){
    $('.test').fadeIn(500);
    $('.login-form').fadeOut(800);
    $('.login-form-reg').fadeIn(800);
  }

  function loadLoginPop(){
    $('.test').fadeIn(500);
    $('.login-form-reg').fadeOut(800);
    $('.login-form').fadeIn(800);
  }

})();

