const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳
//主管
module.exports=function (){
  var router=express.Router();
  const db=mysql.my_sql();
 
	
//进行中的任务列表
 router.get('/', (req, res)=>{
	  var username=req.session['sess_username'];
	 
	  //查询任务表-查询待审核-有审核申请的  
	  	db.query(`SELECT p_number,p_name FROM project ;\
						SELECT  *  FROM task WHERE state='ing'  AND account!='${username}';\
						SELECT * FROM eadmin;`, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else if(task_data[1].length==0) {
									  res.render('./director/task_ing.ejs',{nav_task:"ok",task_data});   
									}else{	
										var i;
										var results=new Array();
										for ( i=0;i<task_data[1].length;i++){ 

											var from= time_format.format(task_data[1][i].wheel_s);
											var to=  time_format.format(task_data[1][i].wheel_e);

											//制作天数
											var oCycle=Math.floor((parseInt(task_data[1][i].wheel_e)-parseInt(task_data[1][i].wheel_s))/86400000*10)/10;

											//剩余制作天数
											var timestamp = Date.parse(new Date());//当前时间戳
											var oLast=Math.floor((parseInt(task_data[1][i].wheel_e)-parseInt(timestamp))/86400000*10)/10;
											if(oLast<0){oLast=0; }

											//实际制作天数
											var oActual=Math.floor((parseInt(timestamp)-parseInt(task_data[1][i].wheel_s))/86400000*10)/10;
											
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<task_data[0].length;n++){
												if(task_data[1][i].p_number==task_data[0][n].p_number){
												   	oProject_name=	task_data[0][n].p_name;
												   }
											}
											 
											//查询申请人
											var oName_zh=null;		
											for( var n=0;n<task_data[2].length;n++){
												console.log(task_data[2][n].name_zh);
												if(task_data[2][n].username==task_data[1][i].account){
												   	oName_zh=	task_data[2][n].name_zh;
												   }
											}
											
											//未完成进度
											var unfinished=100-parseInt(task_data[1][i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"actual":oActual,"project_name":oProject_name,"unfinished":unfinished,"oName_zh":oName_zh});

											if(parseInt(i)+1==task_data[1].length){
 											
											res.render('./director/task_ing.ejs',{nav_task:"ok",task_data,results});   

											};
										}
										
									}
						})
	 	}); 
	
	
  //[进行中]任务详细--get
	  router.get('/task_no', (req, res)=>{
	  var id=req.query.id;//任务id
	  var t_number=req.query.t_number;//任务单编号	  
	   var p_number=req.query.p_number;//项目单编号	   
	  
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
				SELECT  *  FROM  project WHERE p_number='${p_number}';\
				SELECT  *  FROM  task WHERE t_number='${t_number}';\
				SELECT  name_zh  FROM  eadmin WHERE username IN (SELECT  account  FROM  task WHERE t_number='${t_number}');\
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
					  oStar_time="未开始制作";
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
					if(plan[3][j].star_time!==null){
						var oState_time=time_format.format(plan[3][j].star_time);//开始工作	
					}else{
						var  oState_time="未开始制作";
					}
					
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
							var oTime_old=plan[4][i].time_old;//用时
							var oTime=plan[4][i].time;//审核提交时间
							var oVal_path=plan[4][i].val_path;//工作成果存放路径
							var oDate=plan[4][i].date;//审核提交时间
							var oMsg=plan[4][i].msg;//主管留言

							var oState=plan[4][i].state;//状态	
							var	oMessage=plan[4][i].message;//留言	
							var	oAudit_time=plan[4][i].audit_time;//审核时间
							var	oTuichi=plan[4][i].tuichi;//审核时间
							  
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time_old":oTime_old,"time":oTime,"val_path":oVal_path,"date":oDate,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
						 
						}
					}	
					log_list_all.unshift([log_list_plan,log_list_log]);
				}	
			
				
			 res.render('./director/i_task.ejs',{plan,log_list_all, nav_task:"ok",same_day:same_day,oStar_time:oStar_time}); 
				}
	  })	
		  
	  });
	
	
  return router;
};
