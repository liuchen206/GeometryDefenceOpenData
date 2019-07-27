// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        contentItemPrefab: cc.Prefab,
        content:cc.Node,
        rankBgSpriteList:[cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
        if(typeof wx === "undefined"){
            return;
        }
        wx.onMessage(data =>{
            cc.log("onMessage",data.MsgType);
            if(data.MsgType){
                if(data.MsgType == "ShowFriendRank"){
                    cc.log("ShowFriendRank");
                    this.showFriendRank();
                }
                if(data.MsgType == "SubmitScore"){
                    cc.log("SubmitScore",data.score);
                    this.SubmitScore(data.score);
                }
            }
        });
        // this.showSelfInfo();
        // this.showFriendRank();
    },

    // update (dt) {},

    SubmitScore(score){
        var scoreToSave = 0;
        wx.getUserCloudStorage({
            keyList: ["score"],
            success: function (getres) {
                // if (getres.KVDataList.length != 0) {
                //     scoreToSave = score + parseInt(getres.KVDataList[0].value);
                // }
                scoreToSave = score;
                wx.setUserCloudStorage({
                    KVDataList: [{key: "score", value: ""+scoreToSave}],
                    success: function (res) {
                        console.log('setUserCloudStorage', 'success',scoreToSave);
                        console.log('setUserCloudStorage', 'success', res)
                    },
                    fail: function (res) {
                        console.log('setUserCloudStorage', 'fail')
                    },
                    complete: function (res) {
                        console.log('setUserCloudStorage', 'ok')
                    }
                });
            },
        });
    },
    showFriendRank () {
        cc.log("showFriendRank");
        wx.getFriendCloudStorage({
            keyList: ["score"],
            success: (res) => {
                var data = res.data;
                data.sort((a, b) => {
                    if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                        return 0;
                    }
                    if (a.KVDataList.length == 0) {
                        return 1;
                    }
                    if (b.KVDataList.length == 0) {
                        return -1;
                    }
                    return b.KVDataList[0].value - a.KVDataList[0].value;
                });

                this.cleanContentFriendItem();
                for (let i = 0; i < data.length; ++i) {
                    if(i > 100){
                        break;
                    }
                    this.createContentFriendItem(data[i],i);
                }
            },
            fail: (res) => {
                console.error(res);
            }
        });
    },
    showSelfInfo(){
        cc.log("showSelfInfo");
        wx.getUserInfo({
            openIdList:['selfOpenId'],
            lang:'zh_CN',
            success:(res)=>{
                this.createContentSelfItem(res.data[0]);
            },
            fail:(res)=>{
                cc.log("res err",res);
            },
        });
    },
    createContentSelfItem(userData){
        var node = cc.instantiate(this.contentItemPrefab);
        node.parent = this.content;
        node.x = 0;

        var userScore = node.getChildByName('userScore').getComponent(cc.Label);
        userScore.node.active = false;

        var userName = node.getChildByName('userName').getComponent(cc.Label);
        userName.string = userData.nickName;

        cc.log(" createContentSelfItem userData.nickName",userData.nickName);
        cc.loader.load({url: userData.avatarUrl, type: 'png'}, (err, texture) => {
            if (err) console.error(err);
            let userIcon = node.getChildByName('iconMask').children[0].getComponent(cc.Sprite);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });
    },
    cleanContentFriendItem(){
        this.content.removeAllChildren();
    },
    createContentFriendItem(userData,index){
        var node = cc.instantiate(this.contentItemPrefab);
        node.parent = this.content;
        node.x = 0;

        var userScore = node.getChildByName('userScore').getComponent(cc.Label);
        let score = userData.KVDataList.length != 0 ? userData.KVDataList[0].value : 0;
        userScore.string = score+"关";

        // cc.log(" createContentFriendItem userData.nickName",userData.nickName);
        var userName = node.getChildByName('userName').getComponent(cc.Label);
        userName.string = userData.nickname;

        var rankLabel = node.getChildByName("rankLabel").getComponent(cc.Label);
        rankLabel.node.opacity = 0;
        var rankSprite = node.getChildByName("rankSprite").getComponent(cc.Sprite);
        rankSprite.node.opacity = 0;
        if(index > 2){
            rankLabel.string = index+1+"";
            rankLabel.node.opacity = 255;
        }else{
            var rankBg = this.rankBgSpriteList[index%10];
            rankSprite.node.opacity = 255;
            rankSprite.spriteFrame = rankBg;

        }

        cc.loader.load({url: userData.avatarUrl, type: 'png'}, (err, texture) => {
            if (err) console.error(err);
            let userIcon = node.getChildByName('iconMask').children[0].getComponent(cc.Sprite);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });
    },
});
