var a=1e3,n=a*60,t=n*60,c=t*24,o=c*365.25,y=function(e,r){r=r||{};var s=typeof e;if(s==="string"&&e.length>0)return d(e);if(s==="number"&&isNaN(e)===!1)return r.long?h(e):f(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))};function d(e){if(e=String(e),!(e.length>100)){var r=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(r){var s=parseFloat(r[1]),i=(r[2]||"ms").toLowerCase();switch(i){case"years":case"year":case"yrs":case"yr":case"y":return s*o;case"days":case"day":case"d":return s*c;case"hours":case"hour":case"hrs":case"hr":case"h":return s*t;case"minutes":case"minute":case"mins":case"min":case"m":return s*n;case"seconds":case"second":case"secs":case"sec":case"s":return s*a;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return s;default:return}}}}function f(e){return e>=c?Math.round(e/c)+"d":e>=t?Math.round(e/t)+"h":e>=n?Math.round(e/n)+"m":e>=a?Math.round(e/a)+"s":e+"ms"}function h(e){return u(e,c,"day")||u(e,t,"hour")||u(e,n,"minute")||u(e,a,"second")||e+" ms"}function u(e,r,s){if(!(e<r))return e<r*1.5?Math.floor(e/r)+" "+s:Math.ceil(e/r)+" "+s+"s"}export{y as m};