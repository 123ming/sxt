;(function () {
    var _global
    var Netcapture = function(obj) {
        this.obj = obj;
        if(-1 == WebVideoCtrl.I_CheckPluginInstall()) {
            obj.noInstall();
            return;
        }
        // 初始化插件参数及插入插件
        WebVideoCtrl.I_InitPlugin(obj.width, obj.height, {
            iWndowType: 1,
            cbSelWnd: function(xmlDoc) {

            }
        });
        WebVideoCtrl.I_InsertOBJECTPlugin(obj.id);
        // 检查插件是否最新
        if(-1 == WebVideoCtrl.I_CheckPluginVersion()) {
            obj.newInstall();
        }
    }
    Netcapture.prototype.login = function(ip, port, uname, upass,callback) {
        if("" == ip || "" == port) {
            this.obj.noHost()
            return;
        }
       var that = this
        console.log(that)
        console.log(ip)
        var iRet = WebVideoCtrl.I_Login(ip, 1, port, uname, upass, {
            success: function(xmlDoc) {

                callback()
                },
            error: function() {
                that.obj.loginFail()
            }
        });
    }

    Netcapture.prototype.clickStartRealPlay = function(ip,num,callback) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0),
            szIP = ip,
            iStreamType = parseInt(2, 10),
            iChannelID = parseInt('', 10),
            bZeroChannel = true
        szInfo = "";
        if("" == szIP) {
            return;
        }
        /*if(oWndInfo != null) { // 已经在播放了，先停止
            WebVideoCtrl.I_Stop();
        }*/
        var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
            iStreamType: iStreamType,
            iChannelID: iChannelID,
            bZeroChannel: bZeroChannel
        },num);

        if(0 == iRet) {
            callback()

        } else {
           this.obj.previewFail()
        }

    }



    //自动预览开始
    var ev = (function() {
        var ev = {
            lists:[],
            index:1,
            obj:null,
            recIndex:1,
            listLength:0,
            netcap:null,
            init:function(obj){
               obj =  this.hasVal(obj)
                this.netcap = new Netcapture({
                    width:obj.width,
                    height:obj.height,
                    id:obj.id,
                    noInstall:obj.noInstall,
                    newInstall:obj.newInstall,
                    noHost:obj.noHost,
                    loginFail:obj.loginFail,
                    previewFail:obj.previewFail

                })
                this.obj = obj
                this.changeWndNum(obj.num)
                this.lists = obj.lists;
                this.listLength = this.lists.length
                this.login(this.lists[0],function () {
                    ev.startRecord(ev.recIndex)
                })
            },
            hasVal:function(obj){
                obj.width ? obj.width : obj.width = 500;
                obj.height ? obj.height : obj.height = 300;
                obj.id ? obj.id  : new Error('id为必传值');
                obj.num ? obj.num : obj.num = 2;
                obj.noInstall ? obj.noInstall : obj.noInstall = function () {
                    console.log('没有检测到webcomponents')
                }
                obj.newInstall ? obj.newInstall : obj.newInstall = function () {
                    console.log("检测到新的插件版本，双击开发包目录里的WebComponents.exe升级！")
                }
                obj.noHost ? obj.noHost : obj.noHost = function () {
                    console.log("ip,端口必填")
                }
                obj.loginFail ? obj.loginFail : obj.loginFail = function () {
                    console.log('登录失败')
                }
                obj.previewFail ? obj.previewFail : obj.previewFail = function () {
                    console.log('预览失败')
                }
                return obj
            },
            login: function(item,callback) {
                if(this.index>this.listLength){
                    callback()
                    return
                }else{
                    var ip = item.ip
                    var port = item.port
                    var uname = item.uname
                    var upass = item.upass
                    this.netcap.login(ip, port, uname, upass,function(){
                        ev.startPreview(ip,ev.index-1,function(){
                            ev.index++
                            ev.login(ev.lists[ev.index-1],callback)

                        })
                    })
                }
            },
            startPreview: function(ip,num,callback){
                this.netcap.clickStartRealPlay(ip,num,callback)
            },
            startRecord: function(num) {
                if(this.recIndex>this.listLength){
                    return
                }else{
                    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0),
                        szInfo = "";
                    if(oWndInfo != null) {
                        var szChannelID = 1,
                            szFileName = oWndInfo.szIP + "_" + 1 + "_" + new Date().getTime(),
                            iRet = WebVideoCtrl.I_StartRecord(szFileName,num-1);

                        if(0 == iRet) {
                            szInfo = "start recording success！";

                            this.recIndex++
                            this.startRecord(this.recIndex)
                        }else {
                            szInfo = "start recording failed！";

                        }

                    }
                }

            },
            stopRecord: function(num,callback) {
                var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0),
                    szInfo = "";
                if(oWndInfo != null) {
                    var iRet = WebVideoCtrl.I_StopRecord(num);
                    if(0 == iRet) {
                        szInfo = "stop recording success！";
                        callback?callback():''
                    } else {
                        szInfo = "stop recording failed！";
                        callback?callback():''
                    }
                }
            },
            changeWndNum:function(iType){
                iType = parseInt(iType, 10);
                WebVideoCtrl.I_ChangeWndNum(iType);
            }

        }
        return ev
    })()
    _global = (function(){ return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = ev;
    } else if (typeof define === "function" && define.amd) {
        define(function(){return ev;});
    } else {
        console.log(ev)
        _global.ev = ev;
    }
    console.log(_global.ev)
// return ev

})()
