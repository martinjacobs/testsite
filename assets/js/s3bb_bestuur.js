var bucket = new AWS.S3({params: {Bucket: AWS_BucketName}});

function insertParam(key, value) {
        key = escape(key); value = escape(value);

        var kvp = document.location.search.substr(1).split('&');
        if (kvp == '') {
            document.location.search = '?' + key + '=' + value;
        }
        else {

            var i = kvp.length; var x; while (i--) {
                x = kvp[i].split('=');

                if (x[0] == key) {
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }

            if (i < 0) { kvp[kvp.length] = [key, value].join('='); }

            //this will reload the page, it's likely better to store this until finished
            document.location.search = kvp.join('&');
        }
}

function insertHash(value) {
        value = escape(value);
       if (value!='') {
        document.location.hash = value;
       } else {
           document.location.hash = '';
       }
}



function listMoreObjects(marker, prefix, countFiles, countFolders) {
	$('#overlay').show();
	$('#status').html('<div id="statusimg"></div>Loading...');
	bucket.listObjects({MaxKeys: AWS_MaxKeys, Marker: marker, Prefix : prefix, Delimiter : '/' },function (err, data) {
		if (err) {
			$('#status').html('<img src="/assets/images/exclamation-red.png"> Could not load objects from S3');
		} else {
			var truncated = data.IsTruncated;
			var nextMarker = data.NextMarker;
			$('#moreobjects').remove();
			renderObjects(data.Contents, countFolders, countFiles, prefix, truncated, nextMarker);
		}
		$('#overlay').hide();
	});
};

function listObjects(prefix) {
	$('#overlay').show();
	$('#status').html('<div id="statusimg"></div>Loading...');
	$('#objects').empty();
    $('#results').html('');
	
    console.log('retrieving objects');
	bucket.listObjects({MaxKeys: AWS_MaxKeys, Prefix : prefix, Delimiter : '/' },function (err, data) {
		if (err) {
            console.log('could not retrieve objects' + err);
			$('#status').html('<img src="/assets/images/exclamation-red.png"> Could not load files and folders');
		} else {
			//Load folders...
			//Set breadcrumbs..
			var truncated = data.IsTruncated;
			var nextMarker = data.NextMarker;
			var currentFolder = '<a href="javascript:listObjects(\'\')"><span class="path"></span></a>';
			var icon = '';
			if  (prefix !== '') {
				currentFolder += '/';
				var folders = prefix.split('/');
				var parent = '';
				var slash = '';
				var topFolder = '';
				for (var i = 0; i < folders.length - 1; i++) {
					if (folders[i] !== '') {
						var path = '';
						parent += slash + folders[i];
						if ( i > 0 ) {
							path = parent;
						} else {
							path = folders[i];
						}
						if ( i !== (folders.length - 2)) { 
							topFolder = path;
						}
						currentFolder += slash + '<a href="javascript:listObjects(\'' + path + '/\')"><span class="path">' + folders[i] + '</span></a>';
						slash = '/';
					}
				}
			}
            
            //Set url
            insertHash(prefix);
           
			if (typeof topFolder != 'undefined') {
				if (topFolder !== '') {
					topFolder += '/';
				}
				//icon = '<img src="/assets/images/arrow-090.png"/>'
                icon = '<i class="fa fa-level-up fa-2x"></i>'
				$('#objects').append('<li><a href="javascript:listObjects(\'' + topFolder + '\')">' + icon + '<span>...</span></a></li>');
			}
			$('#breadcrumb').html('Folder : ' + currentFolder);
			//Set folders...
			var countFolders = 0;
			for (var i = 0; i < data.CommonPrefixes.length; i++) {
				var currentPrefix = data.CommonPrefixes[i].Prefix;
				var name = (currentPrefix.replace(prefix, '')).replace('/','');
				//icon = '<img src="/assets/images/folder-horizontal.png" style="width:26px"/>'
                //icon = '<i class="fa fa-folder fa-2x"></i>'
                icon = '<i style="color:RGB(228, 205, 102)" class="fa fa-folder-open fa-2x"></i>'
                //icon = '<i class="icon-folder-open-alt"></i>'
				if (prefix !== currentPrefix) {
					countFolders++;
					$('#objects').append('<li><a href="javascript:listObjects(\'' + currentPrefix + '\')">' + icon + '<span>' + name + '</span></a></li>');
				}
			}
			
			renderObjects(data.Contents, countFolders, 0, prefix, truncated, nextMarker);
		}
		$('#overlay').hide();
	});
};

function renderObjects(contents, countFolders, currentCountFiles, prefix, truncated, nextMarker) {
	//Load files...
	var countFiles = currentCountFiles;
	for (var i = 0; i < contents.length; i++) {
		var key = contents[i].Key;
		var size = Math.ceil(contents[i].Size / 1024);
		var fileName = key.replace(prefix, '');
		icon = '<img src="/assets/images/document.png"/>'
		if (prefix !== key) {
			countFiles++;
            if (countFiles%2==0) {colorstyle = 'style="background-color:rgb(220,220,220)"'} else {colorstyle = ''};
			var params = {Bucket: 'bucket', Key: 'key'};
			$('#objects').append('<li class="left" ' + colorstyle + '><a href="javascript:getObject(\'' + key + '\')">' + icon + '<span>' + fileName + '</span><span class="size">' + size + 'K</span></a> </li><li class="right" ><a href="javascript:confirmDeleteObject(\'' + key + '\')" ><i class="fa fa-trash fa-1x" ></i></a></li>');
		}
	}
	if (truncated) {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), showing ' + countFiles + ' item(s) , <a href="javascript:scrollToBottomListObjects()"><img src="/assets/images/arrow-270.png">Go to the bottom of the list to load more items.</a>');
		icon = '<img src="/assets/images/plus-circle.png"/>'
		$('#objects').append('<li id="moreobjects"><a href="javascript:listMoreObjects(\'' + nextMarker + '\',\'' + prefix + '\',' + countFiles + ',' + countFolders + ')">' + icon + '<span>Get more items...</span></a></li>');
	} else {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), ' + countFiles + ' item(s)');
	}		
    
}

function refreshObjects(message) {
    var myParam = location.hash.replace(/^.*#/, '')
    if (myParam)
    // listObjects(decodeURIComponent(myParam)+"/");
        listObjects(decodeURIComponent(myParam));
    else
        listObjects(AWS_Prefix); 
    $('#results').html(message);
}


function getObject(key) {
	var params = {Bucket: AWS_BucketName, Key: key, Expires: AWS_SignedUrl_Expires};
	var url = bucket.getSignedUrl('getObject', params);
	window.open(url, url);
}

function scrollToBottomListObjects() {
	$('#contents').scrollTop($('#contents').prop("scrollHeight"));
}

function init() {
	$('#headertitle').html(TITLE);
//    $.blockUI({ message: $('#modaluploadbox') }); 
    $("#newFolder").click('click.newfolder', function () {
        console.log('newfolder');
        $.blockUI({ message: $('#modalfolderbox') }); 
        $("#folder-button").off('click').on('click.uploadfile', function () {
            var currentFolder = decodeURIComponent(location.hash.replace(/^.*#/, ''));
            console.log("currentFolder" + currentFolder);
            if ($('#foldername').val()) {
                createFolder(currentFolder + $('#foldername').val(), refreshObjects);
            } else {
                console.log("NO FOLDER NAME PROVIDED");
                refreshObjects("NO FOLDER NAME PROVIDED"); 
            }
            $.unblockUI();
            $('#foldername').val('');
            $("#upload-button").off('click.uploadfile');
            $("#cancelfolder-button").off('click.uploadfilecancel');
        });
        $("#cancelfolder-button").off('click').on('click.uploadfilecancel', function () {
            console.log('cancel new folder');
            $.unblockUI();
            $('#foldername').val('');
            $("#upload-button").off('click.uploadfile');
            $("#cancelfolder-button").off('click.uploadfilecancel');
        });
        

    });
     $("#uploadFile").click(function () {
         console.log('uploadfile');
        $.blockUI({ message: $('#modaluploadbox') }); 
        $("#upload-button").off('click').on('click.uploadfile', function () {
            var currentFolder = decodeURIComponent(location.hash.replace(/^.*#/, ''));
            console.log("currentFolder" + currentFolder);
            if ( $('#input')[0].files[0]) {
                uploadObject(currentFolder, $('#input')[0].files[0], refreshObjects);
            } else {
                 refreshObjects("NO FILE PROVIDED");
            }
            $.unblockUI();
            $('#input').val('');
            $("#upload-button").off('click.uploadfile');
            $("#cancelupload-button").off('click.uploadfilecancel');
        });
        $("#cancelupload-button").off('click').on('click.uploadfilecancel', function () {
            console.log('cancel uploadfile');
            $.unblockUI();
            $('#input').val('');
            $("#upload-button").off('click.uploadfile');
            $("#cancelupload-button").off('click.uploadfilecancel');
        });
    });
}

function confirmDeleteObject(key) {
        console.log('confirmDeleteObject');
        $("#deletefilename").text(key);
        $.blockUI({ message: $('#modaldeletebox') }); 
        $("#delete-button").off('click').on('click.deletefile', function () {
            var currentFolder = decodeURIComponent(location.hash.replace(/^.*#/, ''));
            console.log("currentFolder" + currentFolder);
            deleteObject(currentFolder, key, refreshObjects);
            $.unblockUI();
            $("#delete-button").off('click.deletefile');
            $("#canceldelete-button").off('click.deletefilecancel');
        });
        $("#canceldelete-button").off('click').on('click.deletefilecancel', function () {
            console.log('cancel deletefile');
            $.unblockUI();
            $("#delete-button").off('click.deletefile');
            $("#canceldelete-button").off('click.deletefilecancel');
        });

}

function deleteObject(folder, key, callback) {
    var params = {
        Bucket: AWS_BucketName,
        Key: key
    };
    var url = bucket.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
         callback(err ? 'ERROR!' : 'DELETED : ' + key);
    });
}

function uploadObject(folder, file, callback) {
    var params = {
        Key: folder + file.name,
        ContentType: file.type,
        Body: file
    };
    var url = bucket.upload(params, function (err, data) {
        if (err) console.log(err, err.stack);
    });
    url.send(function (err, data) {
        if (err) console.log("Error:", err.code, err.message);
        else console.log(data);
        callback(err ? 'ERROR!' : 'UPLOADED.');
    });
}

function createFolder(foldername, callback) {
    var params = {
        Key: foldername + '/',
        Body: ' '
    };
    var url = bucket.upload(params, function (err, data) {
        if (err) console.log(err, err.stack);

    });
    url.send(function (err, data) {
        if (err) console.log("Error:", err.code, err.message);
        else console.log(data);
        callback(err ? 'ERROR!' : 'FOLDER CREATED : ' + foldername);
    });
}

$( document ).ready(function() {
	init();
    //var myParam = location.search.split('folder=')[1];
    var myParam = location.hash.replace(/^.*#/, '')
    if (myParam)
	  // listObjects(decodeURIComponent(myParam)+"/");
        listObjects(decodeURIComponent(myParam));
    else
        listObjects(AWS_Prefix);
});