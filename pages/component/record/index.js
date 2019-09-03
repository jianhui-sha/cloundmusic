var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
Page({
    data:{
        loading:false,
        weekData:[],
        allData:[],
        code:0,
        tab:1,
        curplay:-1
    },
    onLoad:function(options){
        // 生命周期函数--监听页面加载
        var that = this;
    wx.request({
        url: bsurl + 'record',
        data: {
            cookie:app.globalData.cookie,
            uid:options.uid,
            type:1
        },
        success: function(res){
            // success
            that.setData({
                weekData:res.data
            })
        }
    })
    wx.request({
        url: bsurl + 'record',
        data: {
            uid:options.uid,
            type:0
        },
        success: function(res){
            // success
            that.setData({
                allData:res.data
            })
        },
        complete: function() {
            // complete
            that.setData({
                loading:true
            })
        }
    })
    },
   switchtab:function(e) {
       var t = e.currentTarget.dataset.t;
       this.setData({tab:t})
   }
})