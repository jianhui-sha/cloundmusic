var bsurl = require('../../../utils/bsurl.js')
var typelist = require('../../../utils/searchtypelist.js')
var nt = require('../../../utils/nt.js')
var app = getApp()

Page({
    data:{
        tab:{tab:typelist[0].type,index:0},
        value:'',
        tabs:typelist,
        recent:wx.getStorageSync('recent') || [],
        loading:false,
        prevalue:''
    },
    onLoad:function(options){
        // 生命周期函数--监听页面加载
        var v = options.key;
        v && this.search(v)
    },
    inputext:function (e) {
        var name = e.detail.value;
        this.setData({value:name})
    },
    playmusic:function (e) {
        let that = this;
        let music = e.currentTarget.dataset.idx;
        let st = e.currentTarget.dataset.st;
        if(st * 1 < 0) {
            wx.showToast({
                title:'歌曲已下架',
                icon:"success",
                duration:2000
            });
            return
        }
        music = this.data.tabs[0].relist.songs[music]
        app.globalData.curplay = music
    },
    search:function (name) {
        if(!name || (name == this.data.prevalue)) return
        var index = this.data.tab.index;
        var tl = typelist;
        this.setData({
            tabs:tl,
            prevalue:name,
            value:name,
            loading:true,
        });
        var curtab = this.data.tabs[index]
        var that = this;
        tl = this.data.tabs;
        this.httpsearch(name,curtab.offset,this.data.tab.tab,function(res){
            curtab.relist = res;
            curtab.loading - true;
            var resultarry = res.songs || res.artists || res.albums || res.playlists || res.mvs || res.djprograms || res.userprofiles || [];
            curtab.offset - resultarry.length;
            var size = res.songCount || res.artistCount || res.albumCount || res.playlistCount || res.mvCount || res.djprogramCount || res.userprofileCount;
            size = size ? size : 0;
            curtab.none = curtab.offset >= size ? true :false;
            tl[index] = curtab;
            var recent = that.data.recent;
            var curname = recent.findIndex(function (e) {
                return e ==name
            })
            if(curname > -1) {
                recent.splice(curname,1)
            }
            recent.unshift(name);
            wx.setStorageSync('reccent', recent)
            that.setData({
                tabs:tl,
                loading:true,
                recent:recent,
                prevalue:name
            })
        },function() {
            curtab.loading = true;
            curtab.none - true;
            tl[index] = curtab;
            that.setData({
                tabs:tl
            })
        })
    },
    httpsearch:function (name,offset,type,cb,err) {
        wx.request({
            url: bsurl + 'search',
            data: {
                keywords:name,
                offset:offset,
                limit:20,
                type:type
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
                // success
                cb && cb(res.data.result)
            },
            fail: function() {
                // fail
                err && err()
            },
        })
    },
    clear_kw:function() {
        this.setData({
            value:'',
            loading:false,
            tabs:typelist,
            prevalue:""
        })
    },
    del_research:function (e) {
        var index = e.currentTarget.dataset.index;
        this.data.recent.splice(index,1);
        this.setData({
            recent:this.data.recent
        })
        wx.setStorageSync('recent', this.data.recent)
    },
    tabtype:function (e) {
        var index = e.currentTarget.dataset.index;
    var curtab = this.data.tabs[index];
    var type = e.currentTarget.dataset.tab;
    var that = this;
    var tl = that.data.tabs;
    if (!curtab.loading) {
      this.httpsearch(this.data.prevalue, curtab.offset, type, function (res) {
        curtab.relist = res;
        curtab.loading = true;
        var resultarry = res.songs || res.artists || res.albums || res.playlists || res.mvs || res.djprograms || res.userprofiles || [];
        curtab.offset = resultarry.length
        var size = res.songCount || res.artistCount || res.albumCount || res.playlistCount || res.mvCount || res.djprogramCount || res.userprofileCount;
        size = size ? size : 0;
        curtab.none = curtab.offset >= size ? true : false;
        console.log(size, curtab.offset)

        tl[index] = curtab;
        that.setData({
          tabs: tl
        })
      }, function () {
        curtab.loading = true;
        curtab.none = true;
        tl[index] = curtab;
        that.setData({
          tabs: tl
        })
      })
    }
    this.setData({
      tab: {
        tab: type,
        index: index
      }
    })
    },
    searhFinput:function (e) {
        this.search(e.detail.value.name)
    },
    searhFrecent: function (e) {
        this.search(e.currentTarget.dataset.value)
      }
    
})