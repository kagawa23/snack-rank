"use strict";

var Snack = function(text) { 
    if(text){
        var o = JSON.parse(text);
        this.from = o.from;
        this.name=o.name;
        this.desc=o.desc;
        this.like=o.like;  //点赞数
        this.idx = o.idx;
    }
};

Snack.prototype = {
    toString: function () {
      return JSON.stringify(this);
    }
};

var SnackList = function () {
    LocalContractStorage.defineMapProperty(this, "snackMap",{
        parse: function (text) {
          return new Snack(text);
        },
        stringify: function (o) {
          return o.toString();
        }
      });
    LocalContractStorage.defineProperty(this, "snackCounter");
};

SnackList.prototype = {
    init: function() {
        this.snackCounter = 0;
    },
    _getNextSnackCounter:function(){
        return this.snackCounter ++;
    },
    like:function(idx){
        return this._vote(idx,1);
    },
    dislike:function(idx){
      return this._vote(idx,-1);
    },
    _vote: function(idx,counter){
       var item = this.snackMap.get(idx);
       var like = item.like
       item.like = Math.max(like + counter,0); 
      this.snackMap.put(idx,item);
      return item;
    },
    submit:function(name, desc) {
        var nameLen = this._getLength(name);
        var descLen = this._getLength(desc);
        if(nameLen > 60 || descLen > 60){
          throw Error('argemnt too long');
        }
        var from = Blockchain.transaction.from;
        var snackIdx = this._getNextSnackCounter();
        var snack = new Snack();
        snack.from = from;
        snack.name = name;
        snack.desc = desc;
        snack.like = 1;
        snack.idx = snackIdx;
        this.snackMap.put(snackIdx,snack);
       return "success";
    },
    _getLength:function(str) {
        if(!str){
            return 0;
        }
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    },
    getAll:function(){
      var list=[];
      for(var i=0;i<this.snackCounter;i++){
        list.push(this.snackMap.get(i));
      }
      return list;
    },
    getMine:function(){
       var from = Blockchain.transaction.from;
       var list = [];
      for(var i=0;i<this.snackCounter;i++){
        var item = this.snackMap.get(i);
        if( item.from == from){
          list.push(item);
        }
      }
      return list;
    }
};

module.exports = SnackList;