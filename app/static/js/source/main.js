(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    loadItemAdd();
    $('.togglelink').click(loadLoginPop);
    $('.togglelinkreg').click(loadRegistrationPop);
    $('.loginButton').click(loginUser);
    $('.registerButton').click(registerUser);
    $('#login-data').on('click', '.closelogin', closeLoginPop);
    $('.login-form-reg form').on('click', '.closeReg', closeRegPop);
    $('#makeOffer').click(makeOffer);
    $('#getWebcam').click(getWebcam);
    $('#capture').click(takePic);
    $('.del-sing-img').click(delItemImg);
  }
  var imgFrame;

  function delItemImg(event){
    debugger;
    imgFrame = $(this);
    var data = {url:$(this).attr('data')};
    var id = $(this).attr('id');
    var url ='/items/'+ id;
    var type = 'PUT';
    var success = removeItem;

    $.ajax({url:url, type:type, data:data, success:success});
    console.log({url:url, type:type, data:data, success:success});

    event.preventDefault();
  }

  function removeItem(removed){
    imgFrame.parent().remove();
  }

  var photograph;

  function registerUser(event){
    if($('#pw').val() === $('#pwcon').val()){
      var url = '/register';
      var type = 'POST';
      $('#registerwebcam').val(photograph);
      var form = document.getElementById('#registrationdata');
      var formData = new FormData(form);
      var fileInput = document.getElementById('#registerpic');
      var file = fileInput.files[0];
      formData.append('pic', file);
      var success = reloadPageRegister;

      $.ajax({url:url, type:type, data:formData, success:success});
    }else{
      $('.reg-err').text('Sorry, your passwords do not match.');
    }

    event.preventDefault();
  }

  function reloadPageRegister(data){
    console.log(data);
  }


  function loadItemAdd(){
    $('.background').fadeIn(800);
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

  function getWebcam(event){
    if(navigator.webkitGetUserMedia !== null){
      $('#cameraarea').fadeIn(1000);
      $(this).parent().removeClass('small-12').addClass('small-6');
      var options = {video:true, audio:false};

      navigator.webkitGetUserMedia(options,
          function(stream){
            var video = document.querySelector('video');
            video.src = window.webkitURL.createObjectURL(stream);
          },
          function(e){
            alert('You need to allow webcam access for this functionality.');
            console.log('There was a problem with webkitGetUserMedia');
          });
    }
    event.preventDefault();
  }

  function loadLoginPop(){
    $('.test').fadeIn(500);
    $('.login-form-reg').fadeOut(800);
    $('.login-form').fadeIn(800);
  }
  
  function takePic(event){
    var video = document.querySelector('video');
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 275, 206.25);
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(data, 0, 0);
    photograph = canvas.toDataURL().toString();
    event.preventDefault();
  }

  function makeOffer(){
    var $offer = $('#offerOptions option:selected');
    var url = '/items/offers/'+$(this).attr('data-id')+'/'+$offer.attr('data-id');
    var type = 'POST';
    var success = reloadPage;
    $.ajax({url:url, type:type, success:success});
  }

})();

