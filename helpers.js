
var map = function(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

Float32Array.prototype.max = function(){
  var max = -Infinity, i = 0, len = this.length;
  for ( ; i < len; i++ )
    if ( this[i] > max ) max = this[i];
  return max;
};

Float32Array.prototype.min = function(){
  var min = Infinity, i = 0, len = this.length;
  for ( ; i < len; i++ )
    if ( this[i] < min ) min = this[i];
  return min;
};