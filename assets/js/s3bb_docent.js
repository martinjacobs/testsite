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
			$('#status').html('<img src="/assets/images/exclamation-red.png"> Could not load objects');
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
	
    console.log('retrieving objects');
	bucket.listObjects({MaxKeys: AWS_MaxKeys, Prefix : prefix, Delimiter : '/' },function (err, data) {
		if (err) {
            console.log('could not retrieve objects' + err);
			$('#status').html('<img src="/assets/images/exclamation-red.png"> Could not load objects');
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
			var params = {Bucket: 'bucket', Key: 'key'};
			$('#objects').append('<li><a href="javascript:getObject(\'' + key + '\')">' + icon + '<span>' + fileName + '</span><span class="size">' + size + 'K</span></a></li>');
		}
	}
	if (truncated) {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), showing ' + countFiles + ' item(s), <a href="javascript:scrollToBottomListObjects()"><img src="/assets/images/arrow-270.png">Go to the bottom of the list to load more items.</a>');
		icon = '<img src="/assets/images/plus-circle.png"/>'
		$('#objects').append('<li id="moreobjects"><a href="javascript:listMoreObjects(\'' + nextMarker + '\',\'' + prefix + '\',' + countFiles + ',' + countFolders + ')">' + icon + '<span>Get more items...</span></a></li>');
	} else {
		$('#status').html('Loaded : ' + countFolders + ' folder(s), ' + countFiles + ' item(s)');
	}			
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