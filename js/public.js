;
var public_ops = {
    getBaseUrl:function(){
        var ga_flag = true;
        return ga_flag?"https://api.vincentguo.cn":"http://api.dr.local.com";
    },
    buildUrl:function( path,params){
        var url = this.getBaseUrl() + path;
        var _paramUrl = '';
        if( params ){
            _paramUrl = Object.keys(params).map(function(k) {
                return [encodeURIComponent(k), encodeURIComponent(params[k])].join("=");
            }).join('&');
            _paramUrl = "?"+_paramUrl;
        }
        return url+_paramUrl
    },
    networkIsAvailable:function(){
        var network = true;
        if(mui.os.plus){
            mui.plusReady(function () {
                if(plus.networkinfo.getCurrentType()==plus.networkinfo.CONNECTION_NONE){
                    network = false;
                }
            });
        }
        return network;
    },
    tip:function( msg ){
        plus.nativeUI.toast( msg );
    },
    buildPicUrl:function(url,params){
        var width = params.hasOwnProperty("w")?params['w']:0;
        var height = params.hasOwnProperty("h")?params['h']:0;
        if( !width && !height ){
            return url;
        }
        if( params.hasOwnProperty('view_mode') ){
            url += "?imageView2/"+params['view_mode'];
        }else{
            url += "?imageView2/1";
        }

        if( width ){
            url += "/w/"+width;
        }

        if( height ){
            url += "/h/"+height;
        }
        url += "/interlace/1";
        return url;
    },
    getDevicecScreenWidth:function(){
        var width =   plus.screen.resolutionWidth;
        var tmp_int = Math.ceil(width/50);
        return tmp_int * 50;
    },
    getStepInt:function( val ){
        var tmp_int = Math.ceil(val/50);
        return tmp_int * 50;
    },
    lazyload: function (obj) {
        /*延迟加载并缓存图片*/
        var debug = false; // 默认打印调试日志
        if (obj.getAttribute('data-loaded')) {
            return;
        }
        var image_url = obj.getAttribute('data-src');
        debug && console.log(image_url);
        var image_md5 = md5(image_url);
        var local_image_url = '_downloads/image/' + image_md5 + '.jpg'; // 缓存本地图片url
        var absolute_image_path = plus.io.convertLocalFileSystemURL(local_image_url); // 平台绝对路径

        var temp_img = new Image();// new temp_img 用于判断图片文件是否存在
        temp_img.src = absolute_image_path;
        temp_img.onload = function () {
            debug && console.log('存在本地缓存图片文件' + local_image_url + '，直接显示');
            obj.setAttribute('src', absolute_image_path);// 1.1 存在，则直接显示（本地已缓存，不需要淡入动画）
            obj.setAttribute('data-loaded', true);
        };
        temp_img.onerror = function () {
            debug && console.log('不存在本地缓存图片文件');
            debug && console.log('开始下载图片' + image_url + ' 缓存到本地: ' + local_image_url);// 1.2 下载图片缓存到本地
            function download_img() {
                // filename:下载任务在本地保存的文件路径plus.io.convertLocalFileSystemURL( url );
                var download_task = plus.downloader.createDownload(image_url, {
                    filename: local_image_url,
                    timeout: 5
                }, function (download, status) {
                    if (status == 200) {
                        debug && console.log("下载成功:" + local_image_url);
                        obj.setAttribute('src', plus.io.convertLocalFileSystemURL(local_image_url));
                        obj.setAttribute('data-loaded', true);
                        return;
                    }

                    debug && console.log('下载失败,status' + status);// 下载失败,删除本地临时文件
                    if (local_image_url != null) {
                        plus.io.resolveLocalFileSystemURL(local_image_url, function (entry) {
                            entry.remove(function (entry) {
                                debug && console.log("临时文件删除成功" + local_image_url);
                            }, function (e) {
                                debug && console.log("临时文件删除失败" + local_image_url);
                            });
                        });
                    }
                });
                download_task.start();
            }
            download_img();
        }
    },
    debugDomAttrs:function(obj){
        var attrs = obj.attributes;
        for(var i=attrs.length-1; i>=0; i--) {
            console.log( attrs[i].name + "->" + attrs[i].value  );
        }
    },
    /**
     * 打开新窗口
     * @param {URIString} id : 要打开页面url
     * @param {boolean} wa : 是否显示等待框
     * @param {boolean} ns : 是否不自动显示
     * @param {JSON} ws : Webview窗口属性
     */
    clicked:function(id,wa,ns,ws){
        if(openw){//避免多次打开同一个页面
            return null;
        }
        var extranal_html = "../html/external_site.html";
        ws=ws||{};
        ws.scrollIndicator||(ws.scrollIndicator='none');
        ws.scalable||(ws.scalable=false);
        openw = plus.webview.create( extranal_html,extranal_html,ws,{ url:id });
        ns||openw.addEventListener('loaded',function(){//页面加载完成后才显示
//		setTimeout(function(){//延后显示可避免低端机上动画时白屏
            openw.show(as);
//		},200);
        },false);
        openw.addEventListener('close',function(){//页面关闭后可再次打开
            openw=null;
        },false);
        return openw;
    },
    back:function( hide ){
        if(window.plus){
            ws ||(ws=plus.webview.currentWebview());
            if(hide||ws.preate){
                ws.hide('auto');
            }else{
                ws.close('auto');
            }
        }else if(history.length>1){
            history.back();
        }else{
            windowclose();
        }
    }

};

//window.$ = window.mui;
// 处理点击事件
var openw=null,waiting=null;
var ws=null,as='pop-in';