---
layout: page
permalink: /bestuur/index.html
title: Informatie & documenten voor bestuur
tagline: 
tags: 
modified: 1-4-2016
comments: false
---



In de onderstaande folders is het bestuurs materiaal voor de Oranjebloesem te vinden.
<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1/themes/smoothness/jquery-ui.css">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script src="//malsup.github.io/jquery.blockUI.js"></script>

<script src="//sdk.amazonaws.com/js/aws-sdk-2.1.28.min.js"></script>
<link rel="stylesheet" type="text/css" href="/assets/css/theme.css">

<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
<script src="/assets/js/config_bestuur.js"></script>	
<script src="/assets/js/s3bb_bestuur.js"></script>	

    
<script type="text/javascript" src="/assets/js/awsapi/lib/axios/dist/axios.standalone.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/CryptoJS/rollups/hmac-sha256.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/CryptoJS/rollups/sha256.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/CryptoJS/components/hmac.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/CryptoJS/components/enc-base64.js"></script>
<!--<script type="text/javascript" src="/assets/js/awsapi/lib/moment/moment.js"></script>-->
<script type="text/javascript" src="/assets/js/awsapi/lib/url-template/url-template.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/apiGatewayCore/sigV4Client.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/apiGatewayCore/apiGatewayClient.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/apiGatewayCore/simpleHttpClient.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/lib/apiGatewayCore/utils.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/apigClient.js"></script>
<script type="text/javascript" src="/assets/js/awsapi/promise.min.js"></script>

 <div class="section">
        <div class="container">
            <button type="button" id="uploadFile"> <i class="fa fa-2x fa-fw fa-upload"></i>
                                <br> Upload File</button>
            <button type="button" id="newFolder"> <i class="fa fa-2x fa-fw fa-folder"></i>
                                <br> New Folder</button>
            <div class="row">

                <div id="maincontent">
                    <div id="header">
                        <div id="breadcrumb" class="breadcrumb"></div>
                    </div>
                    <div id="contents" >
                        <div id="elements">
                            <ul id="objects" ></ul>
                        </div>
                    </div>
                    <br/>
                    <div id="subheader" >
                        <div id="status"></div>
                        <div id="results"></div>
                    </div>
                </div>
            </div>
        

            <div id="modaluploadbox" style="display:none" class="modal">
                        <p><label>Upload File:</label><input type="file" class="form-control" placeholder="upload file" id="input" /></p>
                        <button type="submit" id="cancelupload-button">Cancel</button> <button type="submit" id="upload-button">Save</button>
            </div>
            
            <div id="modalfolderbox" style="display:none" class="modal">
                        <p><label>Folder Name:</label><input type="text" id="foldername" size="60"/></p>
                        <button type="submit" id="cancelfolder-button">Cancel</button> <button type="submit" id="folder-button">Save</button>
            </div>
            <div id="modaldeletebox" style="display:none" class="modal">
                        <p><label>Delete</label><span id="deletefilename"></span>?</p>
                        <button type="submit" id="canceldelete-button">Cancel</button> <button type="submit" id="delete-button">Delete</button>
            </div>
            
            <div id="loginbox" style="display:none" class="modal">
                <div id="info">
                  Login
                </div>
                        <p><label>Username:</label><input type="text" id="email" size="20"/></p>
                        <p><label>Password:</label><input type="password" id="password" size="20" /></p>
                        <button type="submit" id="login-button">Login</button>
            </div>
      </div>  <!--container --> 
 </div> <!--section-->       

<script>

  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', function() {
    info.innerHTML = 'Login...';
    if (email.value == null || email.value == '') {
      info.innerHTML = 'Please specify your email address.';
    } else if (password.value == null || password.value == '') {
      info.innerHTML = 'Please specify a password.';
    } else {
      var input = {
        email: email.value,
        password: password.value,
        verified: true,
        realm:'docent'
      };
      
      
   AWS.config = new AWS.Config();
   AWS.config.region = AWS_Region;
   var apigClient = apigClientFactory.newClient();

    apigClient.bestuurLoginPost({}, JSON.stringify(input), {})
    .then(function(response){
        //This is where you would put a success callback
        console.log(response);
        //var output = JSON.parse(response);
          if (!response.data.login) {
            info.innerHTML = '<b>Not</b> logged in';
          } else {
            info.innerHTML = 'Logged in';
            
	    AWS.config.credentials = new AWS.Credentials(response.data.access_id, response.data.secret_key, response.data.token);
           
	    AWS.config.credentials.expired=true;
//            bucket = new AWS.S3({params: {accessKeyId: response.data.access_id, secretAccessKey : response.data.secret_key, sessionToken: response.data.token, Bucket: AWS_BucketName}});
		bucket = new AWS.S3({params: {Bucket: AWS_BucketName}});
           listObjects(AWS_Prefix);
           $.unblockUI();
          }
    }).
  catch(function(response){
    info.innerHTML = response;
    console.log(response);
  
  });
		}
  });
  
$(document).ready(function() { 
        $.blockUI({ message: $('#loginbox') }); 
  //      setTimeout($.unblockUI, 2000); 
         }); 
</script>
