---
layout: page
permalink: /leerlingen/index.html
title: Informatie & huiswerk voor leerlingen
tagline: 
tags: 
modified: 10-10-2014
comments: false
image:
  feature: canal.jpg
---



In de onderstaande folders is het huiswerk en meer informatie over de Oranjebloesem te vinden.

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

<script src="https://sdk.amazonaws.com/js/aws-sdk-2.0.25.min.js"></script>
<link rel="stylesheet" type="text/css" href="/assets/css/theme.css">
<script src="/assets/js/config.js"></script>	
<script src="/assets/js/s3bb.js"></script>	
<div id="overlay"></div>
<div id="maincontent">
    <div id="header">
        <div id="subheader">
            <div id="status"></div>
        </div>
        <div id="breadcrumb" class="breadcrumb"></div> 
    </div>
    <div id="contents">
        <div id="elements">
            <ul id="objects"></ul>
        </div>
    </div>
</div>


<!--<div id="status"></div>
<ul id="objects1"></ul>

<script type="text/javascript">
  AWS.config = new AWS.Config();
   // AWS.config.update = ({accessKeyId:'AKIAJKGSVCBYI45PSJ2A', secretAccessKey:'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'});
  AWS.config.accessKeyId = 'AKIAJKGSVCBYI45PSJ2A';
  AWS.config.secretAccessKey = 'Le/0Gfm68aX6/yjs8q89wHMNWKtFJWS1Rdp24sBI';
  // Configure your region
  AWS.config.region = '';
  var bucket = new AWS.S3({params: {Bucket: 'oranjebloesem-leerling'}});
  bucket.listObjects(function (err, data) {
    if (err) {
      document.getElementById('status').innerHTML =
        'Could not load objects from S3' + err;
    } else {
      document.getElementById('status').innerHTML =
        'Loaded ' + data.Contents.length + ' items from S3';
      for (var i = 0; i < data.Contents.length; i++) {
        document.getElementById('objects1').innerHTML +=
          '<li>' + data.Contents[i].Key + '</li>';
      }
    }
  });
</script>-->

 