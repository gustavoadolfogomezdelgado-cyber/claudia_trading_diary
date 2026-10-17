#property strict
#property version   "1.00"
#property description "Sincroniza operaciones cerradas de MT5 con Claudia Trading Diary"

input string ServerURL = "https://TU-SERVIDOR.onrender.com";
input string ApiKey = "TU_CLAVE_PRIVADA";
input int SyncEverySeconds = 30;

ulong last_sent_time=0;

string JsonEscape(string s){StringReplace(s,"\\","\\\\");StringReplace(s,"\"","\\\"");return s;}

bool SendDeal(ulong ticket){
   if(!HistoryDealSelect(ticket)) return false;
   long entry=(long)HistoryDealGetInteger(ticket,DEAL_ENTRY);
   if(entry!=DEAL_ENTRY_OUT && entry!=DEAL_ENTRY_OUT_BY) return false;
   string symbol=HistoryDealGetString(ticket,DEAL_SYMBOL);
   datetime tm=(datetime)HistoryDealGetInteger(ticket,DEAL_TIME);
   double profit=HistoryDealGetDouble(ticket,DEAL_PROFIT);
   double commission=HistoryDealGetDouble(ticket,DEAL_COMMISSION);
   double swap=HistoryDealGetDouble(ticket,DEAL_SWAP);
   double volume=HistoryDealGetDouble(ticket,DEAL_VOLUME);
   long type=(long)HistoryDealGetInteger(ticket,DEAL_TYPE);
   string iso=TimeToString(tm,TIME_DATE|TIME_SECONDS);
   StringReplace(iso,".","-"); StringReplace(iso," ","T");
   string body=StringFormat("{\"ticket\":\"%I64u\",\"time\":\"%s\",\"symbol\":\"%s\",\"profit\":%.2f,\"commission\":%.2f,\"swap\":%.2f,\"volume\":%.2f,\"type\":\"%d\"}",ticket,iso,JsonEscape(symbol),profit,commission,swap,volume,type);
   char data[]; StringToCharArray(body,data,0,WHOLE_ARRAY,CP_UTF8);
   char result[]; string headers="Content-Type: application/json\r\nX-API-Key: "+ApiKey+"\r\n"; string result_headers;
   ResetLastError();
   int code=WebRequest("POST",ServerURL+"/api/trades",headers,10000,data,result,result_headers);
   if(code>=200 && code<300) return true;
   Print("ClaudiaSync error HTTP=",code," MQL=",GetLastError());
   return false;
}

void SyncHistory(){
   datetime to=TimeCurrent();
   datetime from=to-60*60*24*365*5;
   if(!HistorySelect(from,to)){Print("No se pudo seleccionar historial");return;}
   int total=HistoryDealsTotal();
   for(int i=0;i<total;i++){
      ulong ticket=HistoryDealGetTicket(i);
      if(ticket==0) continue;
      datetime tm=(datetime)HistoryDealGetInteger(ticket,DEAL_TIME);
      if((ulong)tm<last_sent_time) continue;
      if(SendDeal(ticket) && (ulong)tm>last_sent_time) last_sent_time=(ulong)tm;
   }
}

int OnInit(){EventSetTimer(MathMax(10,SyncEverySeconds));SyncHistory();return INIT_SUCCEEDED;}
void OnDeinit(const int reason){EventKillTimer();}
void OnTimer(){SyncHistory();}
