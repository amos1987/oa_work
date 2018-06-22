const express=require('express');
const  mysql=require('../../libs/mysql');
const  time_format=require('../../libs/time_format');//处理时间戳

module.exports=function (){
	var router=express.Router();
	const db=mysql.my_sql();
	
   //[进行中]任务详细--get  
	  router.get('/', (req, res)=>{
	 var p_number=req.query.p_number;//任务单编号	  
	  var id=req.query.id;//任务id
	  var t_number=req.query.t_number;//任务单编号
		  
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
					var oTime=plan[3][j].time;//审核提交时间
					var oTime_old=plan[3][j].time_old;//用时
					var oDate=plan[3][j].date;//审核提交时间
					var oState=plan[3][j].state;//状态
					var oVal_path=plan[3][j].val_path;//制作标准存放路径
					var oMsg=plan[3][j].msg;//主管留言
					var oState_time=time_format.format(plan[3][j].star_time);//开始工作
					var log_list_plan=[];//数组
					log_list_plan.push({"time_title":oTime_title,"contant":oContant,"time_old":oTime_old,"time":oTime,"date":oDate,"plan":oPlan,"state":oState,"val_path":oVal_path,"msg":oMsg,"state_time":oState_time});
				 
					//工作日志
					var i;
					var log_list_log=[];//数组
					for(i=0;i<plan[4].length;i++){
						//console.log(plan[4][i].choose_time);	
							 
						if(plan[4][i].choose_time==plan[3][j].choose_time){
						
							var oRemark=plan[4][i].remark;//备注说明
							var oPlan=plan[4][i].plan;//制作进度
							var oTime=plan[4][i].time;//审核提交时间
							var oTime_old=plan[4][i].time_old;//用时
							var oVal_path=plan[4][i].val_path;//工作成果存放路径
							var oDate=plan[4][i].date;//审核提交时间
							var oMsg=plan[4][i].msg;//主管留言

							var oState=plan[4][i].state;//状态	
							var	oMessage=plan[4][i].message;//留言	
							var	oAudit_time=plan[4][i].audit_time;//审核时间
							var	oTuichi=plan[4][i].tuichi;//审核时间
							 	
							log_list_log.push({"remark":oRemark,"plan":oPlan,"time":oTime,"time_old":oTime_old,"val_path":oVal_path,"date":oDate,"msg":oMsg,"state":oState,"message":oMessage,"audit_time":oAudit_time,"tuichi":oTuichi});
					 
						} 
					}
					log_list_all.unshift([log_list_plan,log_list_log]);
				}	
			 
			 res.render('./personnel/task.ejs',{plan,log_list_all,same_day:same_day,oStar_time:oStar_time,index:"opened active"}); 
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
	  		  var oIng ="review";//计划状态
	     			 //添加-次日计划
	  db.query(`SELECT  *  FROM  plan WHERE choose_time='${oChoose_time}'  AND  t_number IN (SELECT  t_number  FROM  plan WHERE t_number='${oT_number}');\
						SELECT  state  FROM  task WHERE  t_number='${oT_number}';\
						UPDATE task SET state='ing_true'  WHERE t_number="${oT_number}";\
						`, (err, plan) => {
		  
						  if (err) {
								console.error(err);
								res.status(500).send('database error').end();
							}else if (plan[0].length>0) {
								res.send({resultCode:201}).end();
										}else if (plan[0].length==0) {
									       if( plan[1][0].state=="ing_true"){
												res.send({resultCode:202}).end();  
											  }else{
												  db.query(`INSERT INTO plan (t_number,date,contant,choose_time,plan,time,val_path,state) VALUE('${oT_number}','${oDate}','${oContant}','${oChoose_time}','${oPlan}','${oTime}','${oVal_path}','${oIng}');\
													UPDATE task SET state='ing_true' WHERE t_number='${oT_number}'`, (err, data) => {
													if (err) {
														console.error(err);
														res.status(500).send('database error').end();
													} else {
														 res.send({resultCode:200}).end();
													}
												});	
											
											  }
												
											
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

	
//[进行中]任务详细-创建当天日志-post
  router.post('/log', (req, res)=>{
	  
	  	    var oT_number=req.body.t_number;/*任务单序号*/												
	  	    var oRemark=req.body.remark;/*备注说明*/												
	  	    var oPlan=req.body.plan;/*制作进度*/												
	  	    var oTime_old=req.body.time_old;/*用时*/												
	  	    var oVal_path=req.body.val_path;/*成果路径*/												
	  	    var oChoose_time=req.body.choose_time;/*选择日历*/
	  		var oStar_time =time_format.format(Date.parse(new Date()));//当前时间戳
	  		var oState="review";/*状态*/	
	  		var oLeave=req.body.leave;/*推迟*/	
     //添加-当天日志
db.query(`INSERT INTO log (t_number,remark,plan,time_old,val_path,choose_time,time,state,tuichi) VALUE  ('${oT_number}','${oRemark}','${oPlan}','${oTime_old}','${oVal_path}','${oChoose_time}','${oStar_time}','${oState}','${oLeave}');\
SELECT  state  FROM  task WHERE  t_number='${oT_number}';
UPDATE task SET state='ing_true'  WHERE t_number='${oT_number}';\
`, (err, data) => {
										if (err) {
											console.error(err);
											res.status(500).send('database error').end();
										} else if(data[1][0].state=="ing_true"){
											 res.send({resultCode:202}).end();	  
												  }else {
											 res.send({resultCode:200}).end();
										}
									});	
  });	
	
  return router;
};
	 
 