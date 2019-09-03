//app.js
var bsurl = require('utils/bsurl.js');
var nt = require('utils/nt.js');
App({
  onLaunch: function () {
    // 展示本地存储能力
    var cookie = wx.getStorageSync('coolie') || '';
    var gb = wx.getStorageSync('globalData');
    gb && (this.globalData = gb);
    this.globalData.cookie = cookie;
    var that = this;
    //播放列表中下一首
    wx.onBackgroundAudioStop(function() {
      // callback
      if(that.globalData.globalStop) {
        return;
      }
      if(that.globalData.playtype != 2){
        that.nextplay(that.globalData.playtype);
      }else{
        that.nextfm()
      }
    })

    //监听音乐暂停，保存播放进度广播暂停状态
    wx.onBackgroundAudioPause(function() {
      // callback
      nt.postNotificationName("music_toggle",{
        playing: false,
        playtype: that.globalData.playtype,
        music: that.globalData.curplay || {}
      });
      that.globalData.playing = false;
      that.globalData.globalStop = that.globalData.hide ? true : false;
      wx.getBackgroundAudioPlayerState({
        complete: function(res) {
          // complete
          that.globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    })
    this.mine();
    this.likelist();
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  mine:function() {
    var that = this;
    wx.request({
      url: bsurl + 'mine',
      success: function(res){
        // success
        that.globalData.user = res.data;
        wx.setStorageSync('user', res.data)
      }
    })
  },
  likelist:function (){
    var that = this;
    this.globalData.cookie && wx.request({
      url: bsurl + 'likelist',
      success: function(res){
        // success
        that.globalData.staredlist = res.data.ids
      }
    })
  },
  loginrefresh:function (){
    wx.request({
      url: bsurl + 'login/refresh',
      data: {cookie:this.globalData.cookie},
      success: function(res){
        // success
        console.log(res)
      }
    })
  },
  nextplay:function(t,cb,pos){
    // this.preplay();

  },
  nextfm:function(cb){
    this.preplay();
    var that = this;
    var list = this.globalData.list_fm;
    var index = that.globalData.index_fm;
    index++;
    this.globalData.playtype = 2;
    if(index > list.length - 1) {
      that.getfm();
    }else{
      console.log('huoqu');
      that.globalData.index_fm = index;
      that.globalData.curplay = list[index];
      if(this.globalData.staredlist.indexOf(this.globalData.curplay.id) != -1){
        this.globalData.curplay.starred = true;
        this.globalData.curplay.st = true;
      }
      that.seekmusic(2);
      nt.postNotificationName('music_next',{
        music:this.globalData.curplay,
        playtype:2,
        index:index
      });
      cb && cb();
    }
  },
  preplay:function() {
    this.globalData.playing = false;
    this.globalData.globalStop = true;
    wx.pauseBackgroundAudio();
  },
  getfm:function(){
    var that = this;
    wx.request({
      url: bsurl + 'fm',
      success: function(res){
        // success
        that.globalData.list_fm = res.data.data;
        that.globalData.index_fm = 0;
        that.globalData.curplay = res.data.data[0];
        if(that.globalData.staredlist.indexOf(that.globalData.curplay.id) != -1){
          that.globalData.curplay.starred = true;
          that.globalData.curplay.st = true;
        }
        that.seekmusic(2);
        nt.postNotificationName("music_next",{
          music:that.globalData.curplay,
          playtype:2,
          index:0
        })
      }
    })
  },
  stopmusic:function(type,cb){
    wx.pauseBackgroundAudio();
  },
  geturl:function(suc,err,cb){
    var that = this;
    var m = that.globalData.curplay;
    wx.request({
      url: bsurl + 'music/url',
      data: {
        id:m.id,
        br:m.duration ? ((m.hMusic && m.hMusic.bitrate) || (m.mMusic && m.mMusic.bitrate) || (m.lMusicm && m.lMusic.bitrate) || (m.bMusic && m.bMusic.bitrate)) : (m.privilege ? m.privilege.maxbr : ((m.h && m.h.br) || (m.m && m.m.br) || (m.l && m.l.br) || (m.b && m.b.br))),
        br:128000
      },
      success: function(a){
        // success
        a = a.data.data[0];
        if(!a.url){
          err && err()
        }else{
          that.globalData.curplay.url = a.url;
          that.globalData.curplay.getutime = (new Date()).getTime();
          if(that.globalData.staredlist.indexOf(that.globalData.curplay.id) != -1){
            that.globalData.curplay.starred = true;
            that.globalData.curplay.st = true;
          }
          suc && suc()
        }
      }
    })
  },
  playing:function(type,cb,seek){
    var that = this;
    var m = that.globalData.curplay;
    wx.playBackgroundAudio({
      dataUrl: m.url,
      title:m.name,
      success: function(res){
        // success
        if(seek != undefined){
          wx.seekBackgroundAudio({
            position: seek
          })
        }
        that.globalData.globalStop = false;
        that.globalData.playtype = type;
        that.globalData.playing = true;
        nt.postNotificationName("music_toggle",{
          playing:true,
          music:that.globalData.curplay,
          playtype:that.globalData.playtype
        });
        cb && cb();
      },
      fail: function() {
        // fail
        if(type != 2) {
          that.nextplay(1)
        }else{
          that.nextfm();
        }
      },
    })
  },
  onShow:function (){
    this.globalData.hide = false;
  },
  onHide:function(){
    this.globalData.hide = true;
    wx.setStorageSync('globalData', this.globalData)
  },
  seekmusic:function(type,seek,cb) {
    var that = this;
    var m = this.globalData.curplay;
    if(!m.id) return;
    this.globalData.playtype = type;
    if(cb) {
      this.playing(type,cb,seek);
    }else{
      this.geturl(function () {
        that.playing(type,cb,seek);
      })
    }
  },
  globalData: {
    hasLogin:false,
    hide:false,
    list_am:[],
    list_dj:[],
    list_fm:[],
    list_sf:[],
    inde_dj:0,
    index_fm:0,
    index_am:0,
    playing:false,
    playtype:1,
    curplay:{},
    shuffle:1,
    globalStop:true,
    currentPosition:0,
    staredlist:[],
    cookieL:"",
    user:{}

  }
})