const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

module.exports=function (){
	var router=express.Router();
	const db=mysql.my_sql();
	
	
	
//创建任务-get
 router.get('/create', (req, res)=>{
	   var username=req.session['sess_username'];
	  db.query(`SELECT * FROM project WHERE (head="${username}" OR FIND_IN_SET('${username}',team)) AND state!="end"`, (err, project) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else {
					res.render('./director/create.ejs',{nav_task_self:"ok",project:project});   	
					}
	  });
	 
  });	
	
	
//创建任务-post数据提交
  router.post('/create', (req, res)=>{
	  	      var oName=req.body.name;//任务名称
	          var oT_number=parseInt(Date.parse(new Date()));//任务单序号
	   		  var oP_number =parseInt(req.body.pr_name.split("-")[1]);//项目序号
	          var oTime_from =req.body.time_from;//开始时间
	          var oTime_to =req.body.time_to;//结束时间
	          var oVal_path =req.body.val_path ;//[验证标准]路径
	          var oDetailed=req.body.detailed ;//详细任务内容
	  		  var oState ="ing";//当前默认状态
	  		  var oAccount=req.session['sess_username'];//上传账号名
	 
	     			 //添加
						db.query(`INSERT INTO task (t_name,t_number,p_number,wheel_s,wheel_e,val_path,detailed,state,account) VALUE('${oName}','${oT_number}','${oP_number}','${oTime_from}','${oTime_to}','${oVal_path}','${oDetailed}','${oState}','${oAccount}')`, (err, data) => {
							if (err) {
								console.error(err);
								res.status(500).send('database error').end();
							} else {
								 res.send({resultCode:200}).end();
							}
						});
  });		
	
	//查询进行中，自己的任务
  router.get('/task_self_list', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询项目单号，项目名称
	   db.query(`SELECT p_number,p_name FROM project WHERE p_number IN (SELECT p_number  FROM task WHERE  account='${username}' ) `, (err, project_nb) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else{
					 
						//查询进行中的任务
 						db.query(`SELECT  *  FROM task WHERE  account='${username}' AND (state='ing' OR state='review'  OR state='ing_true')`, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else if(task_data.length==0) {
									  res.render('./director/task_self_list.ejs',{nav_task_self:"ok",task_data});   
									}else{	
										var i;
										var results=new Array();
										
										for ( i=0;i<task_data.length;i++){ 

											var from= time_format.format(task_data[i].wheel_s);
											var to=  time_format.format(task_data[i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(task_data[i].wheel_e)-parseInt(task_data[i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(task_data[i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
											 
											
											//实际耗时
											var oConsuming= task_data[i].consuming;
											
											
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<project_nb.length;n++){
												if(project_nb[n].p_number==task_data[i].p_number){
												   	oProject_name=	project_nb[n].p_name;
												   }
											}
											 
											//未完成进度
											var unfinished=100-parseInt(task_data[i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"consuming":oConsuming,"project_name":oProject_name,"unfinished":unfinished});

											if(parseInt(i)+1==task_data.length){
 
											res.render('./director/task_self_list.ejs',{nav_task_self:"ok",task_data,results});   

											};
										}
										
									}
						}); 
			
					}
	  });

  });
	
//查询结束，自己的任务
  router.get('/task_self_end', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询项目单号，项目名称
	   db.query(`SELECT p_number,p_name FROM project WHERE p_number IN (SELECT p_number  FROM task WHERE  account='${username}' ) `, (err, project_nb) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else{
					 
						//查询进行中的任务
 						db.query(`SELECT  *  FROM task WHERE  account='${username}' AND state='end'`, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else if(task_data.length==0) {
									  	res.render('./director/task_self_end.ejs',{nav_task_self:"ok",task_data});   
									}else{	
										var i;
										var results=new Array();
										
										for ( i=0;i<task_data.length;i++){ 

											var from= time_format.format(task_data[i].wheel_s);
											var to=  time_format.format(task_data[i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(task_data[i].wheel_e)-parseInt(task_data[i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(task_data[i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
											 
											
											//实际耗时
											var oConsuming= task_data[i].consuming;
											
											
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<project_nb.length;n++){
												if(project_nb[n].p_number==task_data[i].p_number){
												   	oProject_name=	project_nb[n].p_name;
												   }
											}
											 
											//未完成进度
											var unfinished=100-parseInt(task_data[i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"consuming":oConsuming,"project_name":oProject_name,"unfinished":unfinished});

											if(parseInt(i)+1==task_data.length){
 
											res.render('./director/task_self_end.ejs',{nav_task_self:"ok",task_data,results});   

											};
										}
										
									}
						}); 
			
					}
	  });

  });	
	//查询结束，自己的任务-详细内容
	  router.get('/task_self_end_c', (req, res)=>{
	  var id=req.query.id;//任务id
	  var p_name=req.query.project_name;//项目名称
	  var t_name=req.query.t_name;
	  var t_number=req.query.t_number;//任务单编号
	  var from=req.query.from;
	  var to=req.query.to;
	  var cycle=req.query.cycle;
	  var detailed=req.query.detailed;
	  var last=req.query.last;
	  var t_plan=parseInt(req.query.t_plan);
	  var unfinished=100-parseInt(req.query.t_plan);
	  var state=req.query.state;
	  var actual=req.query.actual;
	  var consuming=req.query.consuming;
	  
	  var timestamp_0 =parseInt( Date.parse(new Date(new Date().setHours(0, 0, 0, 0))));//当前日期0点时间戳
	  var timestamp_24 =parseInt( Date.parse(new Date(new Date().setHours(24, 0, 0, 0))));//当前日期24点时间戳
		  
		  //次日工作计划
		  //当天工作计划
		  //日志
	  db.query(`SELECT  *  FROM  plan WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
				SELECT  *  FROM  log WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
				`, (err, plan) => {
		  		if (err) {
					console.error(err);
					res.status(500).send('database error').end();
		  		} else{	
	 	console.log(plan);	
				//已完成日志列表
				var log_list_all=[];//数组
				var j=null;	
				for(j=0;j<plan[0].length;j++){
					
					//工作计划 
					var oTime_title=time_format.format_ymd(plan[0][j].choose_time);//日志日期  
					var oContant=plan[0][j].contant;//详细工作内容
					var oPlan=plan[0][j].plan;//预计进度
					var oTime=plan[0][j].time;//预计用时
					var oDate=plan[0][j].date;//审核提交时间
					var oState=plan[0][j].state;//状态
					var oVal_path=plan[0][j].val_path;//制作标准存放路径
					var oMsg=plan[0][j].msg;//主管留言
					var oState_time=time_format.format(plan[0][j].star_time);//开始工作
					var log_list_plan=[];//数组
					log_list_plan.push({"time_title":oTime_title,"contant":oContant,"time":oTime,"date":oDate,"plan":oPlan,"state":oState,"val_path":oVal_path,"msg":oMsg,"state_time":oState_time});
					
					//工作日志
					var i;
					var log_list_log=[];//数组
					for(i=0;i<plan[1].length;i++){
						//console.log(plan[4][i].choose_time);	
							 
						if(plan[1][i].choose_time==plan[0][j].choose_time){
						
							var oRemark=plan[1][i].remark;//备注说明
							var oPlan=plan[1][i].plan;//制作进度
							var oTime_old=plan[1][i].time_old;//用时
							var oVal_path=plan[1][i].val_path;//工作成果存放路径
							var oTime=plan[1][i].time;//审核提交时间
							var oMsg=plan[1][i].msg;//主管留言

							var oState=plan[1][i].state;//状态	
							var	oMessage=plan[1][i].message;//留言	
							var	oAudit_time=plan[1][i].audit_time;//审核时间
							var	oTuichi=plan[1][i].tuichi;//审核时间
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time_old":oTime_old,"val_path":oVal_path,"time":oTime,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
							
							if(i+1>=plan[1].length){
								var log_list=[log_list_plan,log_list_log];
								   log_list_all.push(log_list);
							   }
						}else{
							if(i+1>=plan[1].length){
								var log_list=[log_list_plan];
								   log_list_all.push(log_list);
							   }
							++i;
						}
					}
					
				}	
			
			 res.render('./director/task_self_end_c.ejs',{plan,log_list_all, nav_task_self:"ok",resure:{id:id,p_name:p_name,t_name:t_name,t_number:t_number,from:from,to:to,cycle:cycle,detailed:detailed,last:last,t_plan:t_plan,unfinished:unfinished,state: state,actual:actual,consuming:consuming}}); 
				}
	  })	
		  
	  });
	
	
   //[进行中]任务详细--get
	  router.get('/task_self_con', (req, res)=>{
	  var id=req.query.id;//任务id
	  var p_name=req.query.project_name;//项目名称
	  var t_name=req.query.t_name;
	  var t_number=req.query.t_number;//任务单编号
	  var from=req.query.from;
	  var to=req.query.to;
	  var cycle=req.query.cycle;
	  var detailed=req.query.detailed;
	  var last=req.query.last;
	  var t_plan=parseInt(req.query.t_plan);
	  var unfinished=100-parseInt(req.query.t_plan);
	  var state=req.query.state;
	  var actual=req.query.actual;
	 var val_path=req.query.val_path;
	  var oConsuming=req.query.consuming;//实际耗时
		  
	  var timestamp_0 =parseInt( Date.parse(new Date(new Date().setHours(0, 0, 0, 0))));//当前日期0点时间戳
	  var timestamp_24 =parseInt( Date.parse(new Date(new Date().setHours(24, 0, 0, 0))));//当前日期24点时间戳
		  
		  //次日工作计划
		  //当天工作计划
		  //日志
	  db.query(`SELECT  *  FROM  plan WHERE t_number='${t_number}' AND  choose_time IN (SELECT  choose_time  FROM  plan WHERE choose_time>='${timestamp_24}');\
		        SELECT  *  FROM  plan WHERE choose_time='${timestamp_0}' AND t_number='${t_number}';\
		        SELECT  *  FROM  log WHERE choose_time='${timestamp_0}' AND t_number='${t_number}';\
				SELECT  *  FROM  plan WHERE choose_time<'${timestamp_0}' AND t_number='${t_number}';\
				SELECT  *  FROM  log WHERE choose_time<'${timestamp_0}' AND t_number='${t_number}';\
				`, (err, plan) => {
		  		if (err) {
					console.error(err);
					res.status(500).send('database error').end();
		  		} else{	
				
				if(plan[1][0]==undefined){
				   var same_day='';//当天日期
				   }else{
					  var same_day=time_format.format_ymd(plan[1][0].choose_time);//当天日期  
				   }
					
				//开始制作时间
				if(plan[1].length!==0){
					var oStar_time =null;
					if(plan[1][0].star_time!==null){
				      oStar_time=time_format.format(plan[1][0].star_time);
				   }else{
					  oStar_time=null;
				   }
				}	
				
				//已完成日志列表
				var log_list_all=[];//数组
				var j=null;	
				for(j=0;j<plan[3].length;j++){
					
					//工作计划 
					var oTime_title=time_format.format_ymd(plan[3][j].choose_time);//日志日期  
					var oContant=plan[3][j].contant;//详细工作内容
					var oPlan=plan[3][j].plan;//预计进度
					var oTime=plan[3][j].time;//预计用时
					var oDate=plan[3][j].date;//审核提交时间
					var oState=plan[3][j].state;//状态
					var oVal_path=plan[3][j].val_path;//制作标准存放路径
					var oMsg=plan[3][j].msg;//主管留言
					var oState_time=time_format.format(plan[3][j].star_time);//开始工作
					var log_list_plan=[];//数组
					log_list_plan.push({"time_title":oTime_title,"contant":oContant,"time":oTime,"date":oDate,"plan":oPlan,"state":oState,"val_path":oVal_path,"msg":oMsg,"state_time":oState_time});
					
					//工作日志
					var i;
					var log_list_log=[];//数组
					for(i=0;i<plan[4].length;i++){
						//console.log(plan[4][i].choose_time);	
							 
						if(plan[4][i].choose_time==plan[3][j].choose_time){
						
							var oRemark=plan[4][i].remark;//备注说明
							var oPlan=plan[4][i].plan;//制作进度
							var oTime=plan[4][i].time;//用时
							var oVal_path=plan[4][i].val_path;//工作成果存放路径
							var oDate=plan[4][i].date;//审核提交时间
							var oMsg=plan[4][i].msg;//主管留言

							var oState=plan[4][i].state;//状态	
							var	oMessage=plan[4][i].message;//留言	
							var	oAudit_time=plan[4][i].audit_time;//审核时间
							var	oTuichi=plan[4][i].tuichi;//审核时间
							 	
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time":oTime,"val_path":oVal_path,"date":oDate,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
							
							if(i+1>=plan[4].length){
								var log_list=[log_list_plan,log_list_log];
								   log_list_all.push(log_list);
							   }
						}else{
							if(i+1>=plan[4].length){
								var log_list=[log_list_plan];
								   log_list_all.push(log_list);
							   }
							++i;
						}
					}
					
				}	
			 res.render('./director/task_self_con.ejs',{plan,log_list_all,nav_task_self:"ok", resure:{id:id,p_name:p_name,t_name:t_name,t_number:t_number,from:from,to:to,cycle:cycle,detailed:detailed,last:last,val_path:val_path,t_plan:t_plan,unfinished:unfinished,state: state,actual:actual,consuming:oConsuming},same_day:same_day,oStar_time:oStar_time}); 
				}
	  })	
		  
	  });

   //[进行中]任务详细-工作计划-post
  router.post('/plan', (req, res)=>{
	  	     var oT_number =parseInt(req.body.t_number);//任务单序号
	  	     var oDate =Date.parse(new Date());//创建日期  
	  		 var oContant =req.body.contant;//详细工作内容
	  		 var oChoose_time =req.body.choose_time;/*选择的日历*/
	  		  var oPlan =req.body.plan;//预计进度
	  		  var oTime =req.body.time;//预计用时
	  		  var oVal_path =req.body.val_path;//验收标准路径
	  		  var oIng ="end";//状态
	     			 //添加-次日计划
	  db.query(`SELECT  *  FROM  plan WHERE choose_time='${oChoose_time}'  AND  t_number IN (SELECT  t_number  FROM  plan WHERE t_number='${oT_number}')`, (err, plan) => {
		 
						  if (err) {
								console.error(err);
								res.status(500).send('database error').end();
							}else if (plan.length>0) {
								res.send({resultCode:201}).end();
										}else if (plan.length==0) {
											
										db.query(`INSERT INTO plan (t_number,date,contant,choose_time,plan,time,val_path,state) VALUE('${oT_number}','${oDate}','${oContant}','${oChoose_time}','${oPlan}','${oTime}','${oVal_path}','${oIng}');\
										UPDATE task SET state='ing' WHERE t_number='${oT_number}'`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
											
										}
					  })
  });	

//开始工作
  router.post('/star_work', (req, res)=>{
	 var oStar_time = Date.parse(new Date());//当前时间戳
	  var oDate =req.body.date;//计划编号
	  db.query(`UPDATE plan SET star_time='${oStar_time}'  WHERE date='${oDate}'`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});
  })

   //[进行中]任务详细-任务结束
  router.post('/end_task', (req, res)=>{
	  console.log(req.body.state);
	  db.query(`UPDATE task SET state='${req.body.state}'  WHERE id=${req.body.id}`, (err, data)=>{
          if(err){
            console.error(err);
            res.status(500).send('database error').end();
          }else{
             res.send({resultCode:200}).end();
          }
        });
	  
  });
	
//[进行中]任务详细-创建日志-post
  router.post('/log', (req, res)=>{
	  
	  	    var oT_number=req.body.t_number;/*任务单序号*/												
	  	    var oRemark=req.body.remark;/*备注说明*/												
	  	    var oPlan=req.body.plan;/*制作进度*/												
	  	    var oTime_old=req.body.time_old;/*用时*/												
	  	    var oVal_path=req.body.val_path;/*成果路径*/												
	  	    var oChoose_time=req.body.choose_time;/*选择日历*/
	  		var oStar_time =time_format.format(Date.parse(new Date()));//当前时间戳
	  		var oState="ing";/*状态*/	
	  		var oLeave=req.body.leave;/*推迟*/	
     //添加-次日计划
db.query(`INSERT INTO log (t_number,remark,plan,time_old,val_path,choose_time,time,state,tuichi) VALUE  ('${oT_number}','${oRemark}','${oPlan}','${oTime_old}','${oVal_path}','${oChoose_time}','${oStar_time}','${oState}','${oLeave}');\
UPDATE task SET t_plan='${oPlan}'  WHERE t_number=${oT_number}
`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else {
											 res.send({resultCode:200}).end();
										}
									});	
  });	
	
  return router;
};
	 
 