export interface FetchQuotaResponse {
  message: string;
  data: Data;
}

export interface Data {
  id: string;
  geo_quota: GeoQuota;
  global_quota: GlobalQuota;
}

export interface GeoQuota {
  ext: Ext;
}

export interface Ext {
  us: Us;
}

export interface Us {
  addition: Addition;
}

export interface Addition {
  frequency: string;
  limit: number;
  next_reset: string;
  usage: number;
}

export interface GlobalQuota {
  ext: Ext2;
}

export interface Ext2 {
  addition: Addition2;
}

export interface Addition2 {
  frequency: string;
  limit: number;
  next_reset: string;
  usage: number;
}
