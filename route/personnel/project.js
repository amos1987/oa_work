const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳
//项目
module.exports=function (){
  const router=express.Router();
  const db=mysql.my_sql();
	
//项目列表 
  router.get('/', (req, res)=>{
	    db.query('SELECT * FROM project', (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						var i;
						 var results=new Array();
						for ( i=0;i<project.length;i++){  
							 var form= time_format.format(project[i].time_from);
							 var to=  time_format.format(project[i].time_to);
							//制作天数
							 var oCycle=Math.floor((parseInt(project[i].time_to)-parseInt(project[i].time_from))/86400000*10)/10;
							
							 //制作状态
							var oState=null;
							if(project[i].state=="ongoing"){
								 oState="进行中";
								}else{
								oState="结束";
								}
							
								results.push({"form":form,"to":to,"cycle":oCycle,state:oState});
							  if(parseInt(i)+1==project.length){
								   res.render('./personnel/project.ejs',{project,results,p_nav:"opened active"});
							  };
							}
						if(project.length==0){
						    res.render('./personnel/project.ejs',{project,p_nav:"opened active"});
						   }
					}
				});
  });

	
//项目总结-get
  router.get('/summary', (req, res)=>{
	   var oP_number =req.query.p_number;//项目单号
	   var username=req.session['sess_username'];//帐号名
	   db.query(`SELECT * FROM summary WHERE p_number='${oP_number}' AND account='${username}'`, (err, data) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						console.log(data); 
					res.render('./personnel/summary.ejs',{data,p_nav:"opened active",p_number:oP_number});   	
					}
	  
	   });	
	  });	
//项目总结-post
  router.post('/summary', (req, res)=>{
	  
	          var oType =req.body.type;//提交类型
	          var oTitle =req.body.title;//标题 
	          var oTime =req.body.time;//发布时间
	          var oContant =req.body.contant;//内容
	          var  oP_number =req.body. p_number;//项目单号
	          var account=req.session['sess_username'];//所属员工
	       
	  			//添加
	  if(oType=="new"){
		 db.query(`INSERT INTO summary (title,time,contant,p_number,account) VALUE('${oTitle}','${oTime}','${oContant}','${oP_number}','${account}')`, (err, data) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						 res.send({resultCode:200}).end();
					}
				});
	  
		 }else{
		db.query(`UPDATE summary SET title='${oTitle}',time='${oTime}',contant='${oContant}'  WHERE p_number='${oP_number}' AND account='${account}' `, (err, data)=>{
          if(err){
            console.error(err);
            res.status(500).send('database error').end();
          }else{
             res.send({resultCode:200}).end();
          }
        });
		 }
				
  });		
	
//项目详细
  router.get('/project_detailed', (req, res)=>{
	  var oP_number =req.query.p_number;//项目单号
	   var username=req.session['sess_username'];//帐号名
	//查询项目
	  //查询参与人员
	  
	    db.query(`SELECT * FROM project WHERE p_number='${oP_number}';\
						SELECT username,name_zh  FROM eadmin WHERE username IN (SELECT DISTINCT account FROM task WHERE p_number='${oP_number}');\
						SELECT * FROM summary WHERE p_number='${oP_number}' AND account='${username}';\
						SELECT name_zh FROM eadmin WHERE username='${username}'`, (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						var resure=[];
						var from= time_format.format(project[0][0].time_from);
						var to=  time_format.format(project[0][0].time_to);
						console.log(project[2]);
						//制作天数
						var oCycle=Math.floor((parseInt(project[0][0].time_to)-parseInt(project[0][0].time_from))/86400000*10)/10;
						
						resure.push({from:from,to:to,oCycle:oCycle});
						 
						 res.render('./personnel/project_detailed.ejs',{project,resure,p_nav:"opened active"});	
						 
					}
				});
  });		
	
  return router;
};
