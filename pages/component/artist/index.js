var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
    data:{
        art:{},
        loading:false,
        tab:1,
        curplay:-1,
        album: {
			offset: 0,
			loading: false
		},
		mvs: {
			offset: 0,
			loading: false
		},
		desc: {
			loading: false
		},
		simi: {
			loading: false
		}

    },
    onLoad:function(options){
        // 生命周期函数--监听页面加载
        var id = options.id;
        var that =this;
        wx.request({
            url: 'https://URL',
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
                // success
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        })
    },
    onReady:function(){
        // 生命周期函数--监听页面初次渲染完成
        
    },
    onShow:function(){
        // 生命周期函数--监听页面显示
        
    },
    onHide:function(){
        // 生命周期函数--监听页面隐藏
        
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