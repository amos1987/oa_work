//处理时间格式
module.exports={
  format: function (date){
   	var Date_obj=new Date(parseInt(date));
	var oYear=Date_obj.getFullYear();
	var oMonth=Date_obj.getMonth()+1;
	var otDate=Date_obj.getDate();
	
	var oHours=Date_obj.getHours().toString() ;
	var oMinutes=Date_obj.getMinutes().toString(); 

	if(oHours.length==1){oHours="0"+oHours;}
    if(oMinutes.length==1){ oMinutes="0"+oMinutes; } 

    return  oYear+"/"+oMonth+"/"+otDate +"  "+oHours+":"+oMinutes;
  },
	format_ymd: function (date){
   	var Date_obj=new Date(parseInt(date));
	var oYear=Date_obj.getFullYear();
	var oMonth=Date_obj.getMonth()+1;
	var otDate=Date_obj.getDate();
	 
    return  oYear+"年 "+oMonth+"月 "+otDate+"日";
  }
};
