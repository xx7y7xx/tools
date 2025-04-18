/**
 * Prompt description:
 *
 * This prompt is used to generate the source code for the function `getTrainType` based on GPT-4o.
 *
 * The context is from wikipedia page:
 * https://zh.wikipedia.org/wiki/中国铁路列车车次
 *
 * TODO: Use another prompt to check the generated source code against the context
 */

// Prompt Start

/*
given context:
```
====[[高速动车组旅客列车]]（G）====
1998年，中國首款應用高速動車組-[[SJ2000列車|新時速]]在[[廣九直通車]]投入服務，採用G1/2班次，時速約200公里，成為中國首個高速动车组列車班次（但以目前標準，只等同車次為D、時速為200-250公里的[[普通動車組列車]]）。後來，由於廣九直通車降低運行速度，G車次從2000年起一度被取消9年。後來，铁道部在2009年4月1日重新使用G车次，用于最高時速高於300公里的高速[[动车组]]旅客列车，同时部分平均时速为200公里或以下的动车组列车也使用G车次。“G”字头车次在2009年12月26日[[武广客运专线]]开通起开始重新使用，最高运行速度为350km/h。车次总范围为G1-G9998，其中G1—G4000為直通图定，G4001—G4998为直通临客预留，G5001—G9000為管內图定，G9001—G9998为管内临客预留。“G”读“高”。

====[[城际动车组旅客列车]]（C）====
[[File:Cnice3.jpg|thumb|[[京津城际铁路]]的[[CRH3C]]型动车组]]
于2008年8月1日随[[京津城际铁路]]开始对公众运营而新增的车次，以C字头加上四位数字，代表运行距离较短、以管内列车为主的城际动车组，最高运行速度为300km/h，但2012年9月份开通最高时速仅160km/h的[[金山铁路支线]]亦使用了“C”字头的车次。车次总范围为C1001-C9998，不分直通、管内，其中，C9001—C9998为临客预留。

2021年10月11日起，所有在路局管内开行的、由[[复兴号CR200J型动车组]]担当的车次均统一为C字头+三位数编码，以与在客运专线上运营的动力分散式动车组车次作出区分。这类列车的最高运行速度为160km/h，大多在既有线、新建客货混跑线路以及设计标准较低的客运专线上运行，主要服务于路局管内大城市间的旅客运输。“C”读“城”。

==== [[动车组旅客列车]]（D） ====
1999年10月10日，哈尔滨铁路局使用新购置的4列[[NYJ1型柴油动车组]]开行哈尔滨至齐齐哈尔、牡丹江、绥化、佳木斯的动车组列车<ref>{{cite web |title=飞驰在黑土地上——哈尔滨铁路分局客运动车公司改革发展纪实 |url=https://www.gmw.cn/01gmrb/2000-09/05/GB/09%5E18534%5E0%5EGMC1-016.htm |website=光明网 |accessdate=2024-03-24 |archive-date=2024-03-24 |archive-url=https://web.archive.org/web/20240324094232/https://www.gmw.cn/01gmrb/2000-09/05/GB/09%5E18534%5E0%5EGMC1-016.htm |dead-url=no }}</ref>，最高运行速度为140km/h，车次使用D字头+两位数编码，其中哈尔滨到牡丹江为D61—D64，哈尔滨到绥化为D73—D78，哈尔滨到齐齐哈尔为D81—D88，哈尔滨到佳木斯为D91—D94<ref>{{cite web |title=哈尔滨铁路局列车标票价表 |url=http://www.harbin-tourism.com/i/ib/ib02_1.htm |archiveurl=https://web.archive.org/web/20010208215328/http://www.harbin-tourism.com/i/ib/ib02_1.htm |archivedate=2001-02-08}}</ref>。2000年10月21日[[中国铁路第三次大提速]]以后，改用特快列车车次<ref>{{cite web |title=哈尔滨站旅客列车到发时刻表 |url=http://www.hrb.hl.cninfo.net/bingch/jtxx1.htm |website=哈尔滨信息港 |archiveurl=https://web.archive.org/web/20010124043700/http://www.hrb.hl.cninfo.net/bingch/jtxx1.htm |archivedate=2001-01-24 |access-date=2024-03-24 |dead-url=unfit }}</ref>。

2007年4月18日[[中国铁路第六次大提速]]起出现的D字头列车，均使用[[和谐号]]或[[复兴号电力动车组|复兴号]][[动车组]]运行，最高速度为200～250km/h。其中D1—D4000为直通图定，D4001—D4998为直通临客预留，D5001—D9000为管内图定，D9001—D9998为管内临客预留。

2019年1月起开行的[[复兴号CR200J型动车组]]型动车组也采用了D字头车次，这类列车最高运行速度为160Km/h，主要运行于既有线以及设计标准较低的客运专线上，使用D701-D898号段。2024年1月起，跨局開行的動力集中列車組改用D1-D300號段。“D”读“动”或“动车”。

==== [[直达特快旅客列车]]（Z） ====
[[File:Laquered board on Z18 train.jpg|缩略图|[[Z206/207、Z208/205次列车|Z17/18次列车]]]]
为2004年4月18日[[中国铁路第五次大提速]]后新开行的夕发朝至跨局空调列车，最高时速160公里。最初以“点到点”的模式运行，大部分直达特快车次全程一站直达，另有部分车次在中途会停靠沿途重要车站，以及中途必须技术停车的车站；2014年12月10日运行图调整后，中国铁路所有使用25T型客车的旅客列车均为直达特快旅客列车，其停站模式已不再以直达为主。

直达特快旅客列车是中国首次实行单司机值乘、长途列车中途换班的运行方式<ref>[http://www.tieliu.com.cn/zhishi/2007/200704/2007-04-05/20070405095259_40741.html 直达特快旅客列车——感受陆地航班]{{dead link|date=2017年11月 |bot=InternetArchiveBot |fix-attempted=yes }}</ref>，牵引机车通常为[[东风11G型内燃机车]]、[[韶山7E型电力机车]]、[[韶山8型电力机车]]（[[城际直通车]]在[[广深铁路]]及[[东铁线]]上专用10辆机车）、[[韶山9型电力机车]]、[[韶山9G型电力机车]]、[[和谐1D型电力机车]]、[[和谐3D型电力机车]]、[[复兴1型电力机车]]和[[复兴3型电力机车]]，车体则大多使用[[中国铁路25T型客车|25T型客车]]。

特别的，由于青藏高原地区环境和气候条件的特殊性，行经青藏铁路、拉林铁路及拉日铁路的所有客运列车均采用了增氧型25T型客车。因此，行经上述三条铁路的旅客列车（含各站停车列车）均采用Z字头车次。

直达特快列车的车次总范围为Z1-Z9998，其中Z1—Z4000为直通图定，Z4001—Z4998为直通临客预留，Z5001—Z9000为管内图定，Z9001—Z9998为管内临客预留。“Z”读“直”，速度标尺为160km/h。

==== [[特快旅客列车]]（T） ====
[[File:Laquered board on Beijing West - Sanya train.jpg|缩略图|[[T15/16次列车]]和[[T201/202次列车]]的共用水牌]]
为2000年10月21日[[中国铁路第三次大提速]]起新增的车次。特快旅客列车一般全程只停[[省会城市]]、[[副省级市]]和少量主要[[地级市]]等特大站，大部份均为空调列车，在线路条件容许情况下最高时速140公里。2014年12月10日运行图调整后，由于所有使用25T型客车的特快列车全部升级为直达特快，目前特快列车一般仅指使用[[中国铁路25K型客车|25K型客车]]的旅客列车，仅有沿途线路条件不佳的列车采用25G型车厢。

车次总范围为T1-T9998，其中T1—T3000为直通图定，T3001—T3998为直通临客预留，T4001—T4998为管内临客预留，T5001—T9998为管内图定。“T”读“特”，速度标尺为140km/h。

====[[快速旅客列车]]（K）====
[[File:K135.jpg|thumb|[[Z245/248、Z247/246次列车|K135次快速列车]]]]
为1998年10月1日[[中國鐵路第二次大提速]]起新增的车次，但快速列车的等级多年以来有很大变化。目前的快速列车一般全程停靠[[地级市]]和以上级别城市的中大站、特大站，95%以上为空调列车。

车次总范围为K1-K9998，其中K1—K4000為直通图定，K4001—K4998为直通临客预留，K5001—K6998为管内临客预留，K7001—K9998為管內图定。“K”读“快”，速度标尺为120km/h。

在2000年10月21日[[中國鐵路第三次大提速]]前，“K”字头列车的等级相当于现时的特快列车，是在第二次大提速时将部分车次小于200的特快列车一律在原车次前加上代表快速列车的英文字母“K”。2004年4月18日[[中國鐵路第五次大提速]]前，跨局快速和管内快速列车车次均为“K”字头，此后由于快速列车不断增加，自第五次大提速起将跨局快速和管内快速车次分开，新增代表管内快速列车的“N”字头车次，此后“K”字头车次单指跨局快速列车。至2009年4月1日起，铁道部调整旅客列车车次后，跨局和管内快速列车均为“K”字头车次。

====[[普通旅客快车]]（普快）====
[[File:1291行车牌.jpg|thumb|[[K841/844、K842/843次列车|1291次普快列车]]]]
普快列车沿途停靠的车站数量比快速列车更多，一般来说除了停靠线路上所有[[地级市]]和以上级别城市的车站，也停靠不少[[縣級市]]车站，最高速度为120km/h。

车次总范围为1001-5998，其中
* '''图定旅客列车'''
: 跨三局及其以上1001—1998
: 跨两局        2001—2998
: 管内          4001—5998
* '''临时旅客列车'''
: 跨局          3001—3998
2015年至今，在部分往年惯常安排运行的L字头[[临客]]的基础上，3字头普快开始取而代之并参与到繁忙的[[春运]]运输过程当中，继承此前的运行线，运行范围涵盖[[京广铁路|京广]]、[[京九线|京九]]、[[京沪线|京沪]]和[[陇海线|陇海]]等干线，覆盖[[京津冀]]、[[长三角]]、[[珠三角]]及[[成渝地区|成渝]]地区，便于应对春节期间突发的高密度客流往来。担当临客客运乘务的工作人员平日主业多不在此，视当年具体任务安排划分，包括[[机务段|机务]]、货运、电务、路局机关及其他铁路运输支持部门等均有可能被抽调参与其中。

====[[普通旅客列车]]（普客）====
[[File:7102-Board-Nanjing-Huangshan.jpg|thumb|[[7101/7102次列车|7101/7102次]]普客列车，已停运]]
普客列车一般全程停靠沿途大部分车站，基本上「站站停」（被铁路迷戏称为“站站乐”），而且票价低廉、相较公路客运时刻及运行时间均有章可循、遇冰冻雨雪天气则更体现着突出的稳定性，很受开行沿途乘客的喜爱。
车次总范围为6001-7598，其中：
:*跨局 6001—6198
:*管內 6201—7598
:*图定车与临客的区分未作定义
部分仍在运行的知名车次：
:*[[西安铁路局|西局]][[6063/6064次列车]]：翻越[[秦岭]]、串联起[[宝成线]]北段各小站的铁路“公交车”，为沿途学童设有通学车厢。<br>
:*[[哈尔滨铁路局|哈局]][[6245/6246次列车]]：全程在高寒高纬度地区运行，可通达全路路网最北端的[[古莲站]]，运行时间接近一整天。
:*[[北京铁路局|京局]][[6437/6438次列车]]：北京地区仅有的两对普客列车之一，途径[[十渡]]、[[野三坡]][[百里峡]]等景点，票价低廉，适合前往上述景点旅游的乘客乘坐。
然而不少铁路局集团公司认为开行普客列车产生亏损，如在[[上海铁路局]]，对外办理旅客营业的普客列车在除春运外的平日已经全部停运；[[郑州铁路局]]、[[呼和浩特铁路局]]、[[武汉铁路局]]、[[广州铁路集团]]、[[南宁铁路局]]等铁路局集团公司只保留1-4对普客列车。
在管内车次归属方面，存在和旅游列车相似的现象。[[哈尔滨铁路局|哈局]]曾开行的6957/6958（[[齐齐哈尔站|齐齐哈尔]]-碧水）、6967/6968次列车（[[乌伊岭站|乌伊岭]]-[[伊春站|伊春]]），一说系使用[[武汉铁路局]]的号段开行。
```

write js program, define a function:
if input trainCode="G4002", then output "高速动车组旅客列车（G）: 直通临客预留"
if input trainCode="D8999", then output "动车组旅客列车（D）: 管内图定"
if input trainCode="1002", then output "普通旅客快车（普快）: 跨三局及其以上"
if input trainCode="6202", then output "普通旅客列车（普客）: 管内"

MUST implement all the cases for other train types ('C', 'Z', 'T', 'K', etc.)
*/

// Prompt End

/**
 * Get train type from train code
 * @param trainCode e.g. "G4002"
 * @returns e.g. "高速动车组旅客列车（G）: 直通临客预留"
 */
export function getTrainType(trainCode: string) {
  const code = parseInt(trainCode.replace(/[A-Z]/g, ''), 10);

  if (trainCode.startsWith('G')) {
    if (code >= 1 && code <= 4000) return '高速动车组旅客列车（G）: 直通图定';
    if (code >= 4001 && code <= 4998)
      return '高速动车组旅客列车（G）: 直通临客预留';
    if (code >= 5001 && code <= 9000)
      return '高速动车组旅客列车（G）: 管内图定';
    if (code >= 9001 && code <= 9998)
      return '高速动车组旅客列车（G）: 管内临客预留';
  } else if (trainCode.startsWith('C')) {
    if (code >= 1001 && code <= 9998) return '城际动车组旅客列车（C）';
  } else if (trainCode.startsWith('D')) {
    if (code >= 1 && code <= 4000) return '动车组旅客列车（D）: 直通图定';
    if (code >= 4001 && code <= 4998)
      return '动车组旅客列车（D）: 直通临客预留';
    if (code >= 5001 && code <= 9000) return '动车组旅客列车（D）: 管内图定';
    if (code >= 9001 && code <= 9998)
      return '动车组旅客列车（D）: 管内临客预留';
  } else if (trainCode.startsWith('Z')) {
    if (code >= 1 && code <= 4000) return '直达特快旅客列车（Z）: 直通图定';
    if (code >= 4001 && code <= 4998)
      return '直达特快旅客列车（Z）: 直通临客预留';
    if (code >= 5001 && code <= 9000) return '直达特快旅客列车（Z）: 管内图定';
    if (code >= 9001 && code <= 9998)
      return '直达特快旅客列车（Z）: 管内临客预留';
  } else if (trainCode.startsWith('T')) {
    if (code >= 1 && code <= 3000) return '特快旅客列车（T）: 直通图定';
    if (code >= 3001 && code <= 3998) return '特快旅客列车（T）: 直通临客预留';
    if (code >= 4001 && code <= 4998) return '特快旅客列车（T）: 管内临客预留';
    if (code >= 5001 && code <= 9998) return '特快旅客列车（T）: 管内图定';
  } else if (trainCode.startsWith('K')) {
    if (code >= 1 && code <= 4000) return '快速旅客列车（K）: 直通图定';
    if (code >= 4001 && code <= 4998) return '快速旅客列车（K）: 直通临客预留';
    if (code >= 5001 && code <= 6998) return '快速旅客列车（K）: 管内临客预留';
    if (code >= 7001 && code <= 9998) return '快速旅客列车（K）: 管内图定';
  } else if (code >= 1001 && code <= 5998) {
    if (code >= 1001 && code <= 1998)
      return '普通旅客快车（普快）: 跨三局及其以上';
    if (code >= 2001 && code <= 2998) return '普通旅客快车（普快）: 跨两局';
    if (code >= 4001 && code <= 5998) return '普通旅客快车（普快）: 管内';
  } else if (code >= 6001 && code <= 7598) {
    if (code >= 6001 && code <= 6198) return '普通旅客列车（普客）: 跨局';
    if (code >= 6201 && code <= 7598) return '普通旅客列车（普客）: 管内';
  }

  return 'Unknown train type or code';
}

// // Example usage:
// console.log(getTrainType("G4002")); // 高速动车组旅客列车（G）: 直通临客预留
// console.log(getTrainType("D8999")); // 动车组旅客列车（D）: 管内图定
// console.log(getTrainType("1002")); // 普通旅客快车（普快）: 跨三局及其以上
// console.log(getTrainType("6202")); // 普通旅客列车（普客）: 管内
