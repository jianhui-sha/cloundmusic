var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
var nt = require('../../../utils/nt.js');
Page({
    data:{
        result:{},
        curplay:0,
        music:{},
        playing:false,
        playtype:1,
        loading:true,
        music:{},
        playing:false,
        share:{
            title:"一起来听",
            des:""
        }
    },
    toggleplay:function(){
        common.toggleplay(this,app)
    },
    playnext:function() {
        app.nextplay(e.currentTarget,dataset.pt)
    },
    music_next:function(r){
        this.setData({
            music:r.music,
            playtype:r.playtype,
            curplay:r.music.id
        })
    },
    music_toggle:function(r){
        this.setData({
            playing:r.playing,
            music:r.music,
            playtype:r.playtype,
            curplay:r.music.id
        })
    },
    onLoad:function(options){
        // 生命周期函数--监听页面加载
        var that = this;
        wx.request({
            url: bsurl + 'album/detail',
            data: {
                id:options.pid
            },
            success: function(res){
                // success
                var re = this.data.data;
                re.ablum.publishTime = common.formatTime(re.ablum.publishTime,3);
                var canplay = [];
                for(var i = 0; i < res.data.songs.length; i++) {
                    var r  = res.data.songs[i];
                    if(r.privilege > -1) {
                        canplay.push(r)
                    }
                }
                that.setData({
                    result:res.data,
                    loading:false,
                    canplay:canplay,
                    share:{
                        id:options.id,
                        title:res.data.ablum.name + '-' + res.data.ablum.artist.name,
                        des:res.data.ablum.description
                    }
                });
                wx.setNavigationBarTitle({
                    title: res.data.ablum.name
                })
            },
            fail: function(res) {
                // fail
                wx.navigateBack({
                    delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
        })
    },
    onReady:function(){
        // 生命周期函数--监听页面初次渲染完成
        
    },
    onShow:function(){
        // 生命周期函数--监听页面显示
        nt.addNotification("music_next", this.music_next, this);
        nt.addNotification("music_toggle", this.music_toggle, this);
        this.setData({
          curplay: app.globalData.curplay.id,
          music: app.globalData.curplay,
          playing: app.globalData.playing,
          playtype: app.globalData.playtype
        })
        
    },
    onHide:function(){
        // 生命周期函数--监听页面隐藏
        nt.removeNotification("music_next",this)
        nt.removeNotification("music_toggle",this)
    },
    lovesong:function(){
        common.songheart(this,app,0,(this.data.playtype == 1 ? this.data.music.st : this.data.music.starred))
    },
    onUnload:function(){
        // 生命周期函数--监听页面卸载
        
    },
    onPullDownRefresh: function() {
        // 页面相关事件处理函数--监听用户下拉动作
        
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
        
    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
          title: 'title', // 分享标题
          desc: 'desc', // 分享描述
          path: 'path' // 分享路径
        }
    }
})