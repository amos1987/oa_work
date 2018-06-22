const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳
	const fs = require('fs');
	const pathLib = require('path');
//项目
module.exports=function (){
  const router=express.Router();
  const db=mysql.my_sql();
	
//项目列表
  router.get('/', (req, res)=>{
	   var username=req.session['sess_username'];
	    db.query(`SELECT * FROM project WHERE head="${username}";\
						SELECT * FROM eadmin;`, (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else if(project[0].length==0){
					   res.render('./controller/project.ejs',{project,nav_project:"ok"}); 		  	  
					}else { 
						 var i; 
						 var results=new Array();
						 var oHead=[];
						for ( i=0;i<project[0].length;i++){  
							 var form= time_format.format(project[0][i].time_from);
							 var to=  time_format.format(project[0][i].time_to);
							
							//制作天数
							 var oCycle=Math.floor((parseInt(project[0][i].time_to)-parseInt(project[0][i].time_from))/86400000*10)/10;
							
							var team=[];
							for(var n=0;n<project[1].length;n++){
								 if(project[0][i].head==project[1][n].username){
										oHead.push(project[1][n].name_zh);//项目主管
									    //团队成员
									}
								for(var x=0;x<project[0][i].team.split(",").length;x++){
									if(project[1][n].username==project[0][i].team.split(",")[x]){
									  team.push([project[1][n].username,project[1][n].name_zh]); 
									   }
								}
							}
						
							//制作状态
							var oState=null;
							 var oEnd_time=null;
							if(project[0][i].state=="ongoing"){
								 oState="进行中";
								//实际制作天数
							    oEnd_time="-";	
								}else{
								oState="结束";
								//实际制作天数
							    oEnd_time=Math.floor((parseInt(project[0][i].end_time)-parseInt(project[0][i].time_from))/86400000*10)/10;	
								}
							
								results.push({"form":form,"to":to,"cycle":oCycle,"state":oState,"end_time":oEnd_time,"head":oHead[i],"team":team});
							  if(parseInt(i)+1==project[0].length){
								   res.render('./controller/project.ejs',{project,results,nav_project:"ok"});
							  };
							}
					
					}
				});
  });

//创建项目
  router.get('/new', (req, res)=>{
	    var username=req.session['sess_username'];
	    db.query(`SELECT * FROM eadmin WHERE username!='${username}' AND state="ing" AND  type!="director"`, (err, eadmin) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else if(eadmin.length==0){
					 res.render('./controller/project_new.ejs',{nav_project:"ok"});		  	  
					}else {
						res.render('./controller/project_new.ejs',{eadmin,nav_project:"ok"});   
					}
		});
		
	  
  });

//创建项目-post提交表单
  router.post('/new', (req, res)=>{
	          var oP_number=parseInt(Date.parse(new Date()));
	          var oType =req.body.type;
	          var oName =req.body.name;
	          var oTime_from =req.body.time_from;
	          var oTime_to =req.body.time_to;
	          var oPurpose =req.body.purpose ;
	          var oSize =req.body.size ;
	          var oConsult =req.body.consult;
	          var oStandard =req.body.standard;
	          var oSay =req.body.say ;
	  		  var oState ="ongoing";
	          var oTime_pic=req.body.time_pic;//项目时间表
	          var oTeam=req.body.team;//项目团队成员
	  		  var oHead=req.session['sess_username'];//项目主管

	  			//添加
				db.query(`INSERT INTO project (p_number,type,p_name,time_from,time_to,purpose,size,consult,standard,say,state,time_pic,head,team) VALUE('${oP_number}','${oType}','${oName}','${oTime_from}','${oTime_to}','${oPurpose}','${oSize}','${oConsult}','${oStandard}','${oSay}','${oState}','${oTime_pic}','${oHead}','${oTeam}')`, (err, data) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						 res.send({resultCode:200}).end();
					}
				});
  });


//项目详细-首页
  router.get('/project_detailed', (req, res)=>{
	  var oP_number =req.query.p_number;//项目单号
	  
	//查询项目
	  //查询参与人员
	  
	    db.query(`SELECT * FROM project WHERE p_number='${oP_number}';\
						SELECT username,name_zh  FROM eadmin WHERE username IN (SELECT DISTINCT account FROM task WHERE p_number='${oP_number}')`, (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
						var resure=[];
						var from= time_format.format(project[0][0].time_from);
						var to=  time_format.format(project[0][0].time_to);
					 
						//制作天数
						var oCycle=Math.floor((parseInt(project[0][0].time_to)-parseInt(project[0][0].time_from))/86400000*10)/10;
						
						resure.push({from:from,to:to,oCycle:oCycle});
						 
						 res.render('./controller/project_detailed.ejs',{project,resure,nav_project:"ok"});	
						 
					}
				});
  });	
	

//项目详细-总结
  router.get('/project_d_z', (req, res)=>{
	  
	   var oP_number =req.query.p_number;//项目单号
	   var username=req.query.username;//帐号名
	   //查询项目
	   //查询参与人员
	  
	    db.query(`SELECT p_number FROM project WHERE p_number='${oP_number}';\
						SELECT username,name_zh  FROM eadmin WHERE username IN (SELECT DISTINCT account FROM task WHERE p_number='${oP_number}');\
						SELECT * FROM summary WHERE p_number='${oP_number}' AND account='${username}';\
						SELECT name_zh  FROM eadmin WHERE username='${username}';`, (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
					 
						 res.render('./controller/project_d_z.ejs',{project,nav_project:"ok"});	
						 
					}
				});
  });		
	
	
//项目详细-任务列表
  router.get('/project_d_l', (req, res)=>{
	  var oUsername =req.query.username;//帐号名
	  var oP_number =req.query.p_number;//项目单号
	  
	  //查询项目
	  //查询参与人员
	  
	    db.query(`SELECT p_name,p_number FROM project WHERE p_number='${oP_number}';\
						SELECT username,name_zh  FROM eadmin WHERE username IN (SELECT DISTINCT account FROM task WHERE p_number='${oP_number}');\
						SELECT  *  FROM task WHERE  account='${oUsername}' AND (state='end' OR state='ing') AND p_number="${oP_number}";\
						SELECT  name_zh,type  FROM eadmin WHERE  username='${oUsername}' ;\
						`, (err, project) => {
					if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else if(project[2].length==0){
						res.render('./controller/project_d_l.ejs',{project,nav_project:"ok"});   	  
					}else {
										var i;
										var results=new Array();
										for ( i=0;i<project[2].length;i++){ 

											var from= time_format.format(project[2][i].wheel_s);
											var to=  time_format.format(project[2][i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(project[2][i].wheel_e)-parseInt(project[2][i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(project[2][i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
							 
											//未完成进度
											var unfinished=100-parseInt(project[2][i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"project_name":project[0][0].p_name,"unfinished":unfinished});

											if(parseInt(i)+1==project[2].length){
 
											res.render('./controller/project_d_l.ejs',{project,nav_project:"ok",results});   

											};
										}
 
					}
				});
  });	
	
   //项目结束
  router.post('/p_end', (req, res)=>{
	 var timestamp = Date.parse(new Date());//当前时间戳 
	  db.query(`UPDATE project SET state='${req.body.state}',end_time='${timestamp}'  WHERE p_number=${req.body.p_number}`, (err, data)=>{
          if(err){
            console.error(err);
            res.status(500).send('database error').end();
          }else{
             res.send({resultCode:200}).end();
          }
        });
  });	
	
//任务详细
	  router.get('/project_d_lc', (req, res)=>{
	  var oP_number =req.query.p_number;//项目单号
	  var id=req.query.id;//任务id
	  var t_number=req.query.t_number;//任务单编号
	 
	  var timestamp_0 =parseInt( Date.parse(new Date(new Date().setHours(0, 0, 0, 0))));//当前日期0点时间戳
	  var timestamp_24 =parseInt( Date.parse(new Date(new Date().setHours(24, 0, 0, 0))));//当前日期24点时间戳
		  
		  //次日工作计划
		  //当天工作计划
		  //日志
	  db.query(`SELECT  *  FROM  plan WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
					SELECT  *  FROM  log WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
					SELECT username,name_zh  FROM eadmin WHERE username IN (SELECT DISTINCT account FROM task WHERE p_number='${oP_number}');\
					SELECT  name_zh,type  FROM eadmin WHERE  username IN (SELECT  account  FROM  task WHERE t_number='${t_number}' );\
			    	SELECT  *  FROM  project WHERE p_number='${oP_number}';\
				    SELECT  *  FROM  task WHERE t_number='${t_number}';\
					`, (err, project) => {
		  		if (err) {
					console.error(err);
					res.status(500).send('database error').end();
		  		} else{	
	 
				//已完成日志列表
				var log_list_all=[];//数组
				var j=null;	
				for(j=0;j<project[0].length;j++){
					
					//工作计划 
					var oTime_title=time_format.format_ymd(project[0][j].choose_time);//日志日期  
					var oContant=project[0][j].contant;//详细工作内容
					var oPlan=project[0][j].plan;//预计进度
					var oTime=project[0][j].time;//预计用时
					var oDate=project[0][j].date;//审核提交时间
					var oState=project[0][j].state;//状态
					var oVal_path=project[0][j].val_path;//制作标准存放路径
					var oMsg=project[0][j].msg;//主管留言
					var oState_time=time_format.format(project[0][j].star_time);//开始工作
					var log_list_plan=[];//数组
					console.log(oState_time);
					log_list_plan.push({"time_title":oTime_title,"contant":oContant,"time":oTime,"date":oDate,"plan":oPlan,"state":oState,"val_path":oVal_path,"msg":oMsg,"state_time":oState_time});
					
					//工作日志
					var i;
					var log_list_log=[];//数组
					for(i=0;i<project[1].length;i++){
					 
						if(project[1][i].choose_time==project[0][j].choose_time){
						
							var oRemark=project[1][i].remark;//备注说明
							var oPlan=project[1][i].plan;//制作进度
							var oTime=project[1][i].time;//用时
							var oVal_path=project[1][i].val_path;//工作成果存放路径
							var oDate=project[1][i].date;//审核提交时间
							var oMsg=project[1][i].msg;//主管留言

							var oState=project[1][i].state;//状态	
							var	oMessage=project[1][i].message;//留言	
							var	oAudit_time=project[1][i].audit_time;//审核时间
							var	oTuichi=project[1][i].tuichi;//审核时间
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time":oTime,"val_path":oVal_path,"date":oDate,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
							
					 
						} 
					}
					log_list_all.unshift([log_list_plan,log_list_log]);
				}	
			 res.render('./controller/project_d_lc.ejs',{project,log_list_all, nav_project:"ok"}); 
				}
	  })	
		  
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
					res.render('./controller/summary.ejs',{data,nav_project:"ok",p_number:oP_number});   	
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
	
	//banner图片上传
	router.post('/update_pic', (req, res) => {

		if (req.files[0]) {
			var ext = pathLib.parse(req.files[0].originalname).ext;

			var oldPath = req.files[0].path;
			var newPath = req.files[0].path + ext;

			var newFileName = req.files[0].filename + ext;
		} else {
			var newFileName = null;
		}

		fs.rename(oldPath, newPath, (err) => {
			if (err) {
				console.error(err);
				res.status(500).send('file opration error').end();
			} else {
				return res.send({
					 newFileName
				})

			}

		})

	});
	
	
  return router;
};
