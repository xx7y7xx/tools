export type TrainsMapType = {
  [trainNumber: string]: {
    from_station: string;
    to_station: string;
  };
};

export type TrainFullInfoType = {
  operateGroup: string; // 担当路局, e.g. "成都局"
  trainCategory: string; // 列车型号, e.g. "和谐号(CRH380A型)""
  trainNumber: string; // 车次, e.g. "G372"
  runTime: string; // 运行时间, e.g. "12小时8分"
  fromStation: string; // 始发站, e.g. "贵阳北"
  toStation: string; // 到达站, e.g. "北京西"
  departureTime: string; // 发车时间, e.g. "09:31"
  arrivalTime: string; // 到站时间, e.g. "21:39"
  trainType: string; // 列车类型, e.g. "高速动车组列车(高铁)"
  distance: string; // 里程, e.g. "2138"

  total_num: string; // ?总数, e.g. "4"
  train_no: string; // ?列车号, e.g. "24000000G10I"
};

export type TrainsFullInfoMapType = {
  [trainNumber: string]: TrainFullInfoType;
};

type checiInfoType = {
  date: string; // e.g. "20241121"
  from_station: string; // e.g. "北京丰台"
  to_station: string; // e.g. "上海"
  total_num: string; // e.g. "20"
  train_no: string; // e.g. "240000146130"
};

export type checiDateMapType = {
  [checi: string]: checiInfoType[];
};

export type dateCheciType = {
  checi: string;
  dateCheci: checiInfoType[];
};

export type StationToTrainMapType = {
  [station: string]: TrainFullInfoType[];
};

export type TrainsFullInfoMapDataKey = 'trainsFullInfoMap';
