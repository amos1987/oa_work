const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

module.exports=function (){
	var router=express.Router();
	const db=mysql.my_sql();
	
   //[进行中]任务详细--get
	  router.get('/', (req, res)=>{ 
		  
	  var username=req.session['sess_username'];
	 
	  //查询任务表   
	   db.query(`SELECT p_number,p_name FROM project WHERE p_number IN (SELECT p_number  FROM task WHERE  account='${username}' ) `, (err, project_nb) => { 
		  if (err) {
						console.error(err);
						res.status(500).send('database error').end();
					} else{
					 
 						db.query(`SELECT  *  FROM task WHERE  account='${username}' AND state='end' `, (err, task_data) => { 
						  if (err) {
									console.error(err);
										res.status(500).send('database error').end();
									} else if(task_data.length==0) {
									 	res.render('./personnel/create_list.ejs',{create_list:"opened active",task_data});  
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
							 

									 
											//查询项目名称
											var oProject_name=null;		
											for( var n=0;n<project_nb.length;n++){
												if(project_nb[n].p_number==task_data[i].p_number){
												   	oProject_name=	project_nb[n].p_name;
												   }
											}
											 
											//未完成进度
											var unfinished=100-parseInt(task_data[i].t_plan);
											
											results.push({"from":from,"to":to,"cycle":oCycle,"last":oLast,"project_name":oProject_name,"unfinished":unfinished});

											if(parseInt(i)+1==task_data.length){
 
											res.render('./personnel/create_list.ejs',{create_list:"opened active",task_data,results});   

											};
										}   
										
									}
						}); 
			
					}
	  });
	  });
	
//已完成任务
	  router.get('/create_con', (req, res)=>{
	   var p_number=req.query.p_number;//任务单编号	  
	  var id=req.query.id;//任务id
	  var t_number=req.query.t_number;//任务单编号
	  
	  var timestamp_0 =parseInt( Date.parse(new Date(new Date().setHours(0, 0, 0, 0))));//当前日期0点时间戳
	  var timestamp_24 =parseInt( Date.parse(new Date(new Date().setHours(24, 0, 0, 0))));//当前日期24点时间戳
		  
		  //次日工作计划
		  //当天工作计划
		  //日志
	  db.query(`SELECT  *  FROM  plan WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
				SELECT  *  FROM  log WHERE choose_time<='${timestamp_0}' AND t_number='${t_number}';\
				SELECT  *  FROM  project WHERE p_number='${p_number}';\
				SELECT  *  FROM  task WHERE t_number='${t_number}';\
				`, (err, plan) => {
		  		if (err) {
					console.error(err);
					res.status(500).send('database error').end();
		  		} else{	
	 
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
					if(plan[0][j].star_time==null){
						var oState_time="未开始工作";
						
					}else{
						var oState_time=time_format.format(plan[0][j].star_time);//开始工作
					}
					
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
							var oTime=plan[1][i].time;//用时
							var oVal_path=plan[1][i].val_path;//工作成果存放路径
							var oDate=plan[1][i].date;//审核提交时间
							var oMsg=plan[1][i].msg;//主管留言

							var oState=plan[1][i].state;//状态	
							var	oMessage=plan[1][i].message;//留言	
							var	oAudit_time=plan[1][i].audit_time;//审核时间
							var	oTuichi=plan[1][i].tuichi;//审核时间
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time":oTime,"val_path":oVal_path,"date":oDate,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
							
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
			 res.render('./personnel/create_con.ejs',{plan,log_list_all,create_list:"opened active"}); 
				}
	  })	
		  
	  });
	
	
  return router;
};
	 
 