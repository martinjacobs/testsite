var AWS_Region = 'us-east-1';
var AWS_BucketName = 'jekyll-out';//'oranjebloesem-docent';
var AWS_MaxKeys = 500; //How many objects will retrive (include folders and items)
var AWS_Prefix = ''; //Stating folder, by default start on root
var AWS_SignedUrl_Expires = 900; //This is the default value for expires getSignedUrl
var TITLE = 'S3 Bucket browser';