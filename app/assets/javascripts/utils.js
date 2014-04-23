// Utility methods
var removeArrayElementsByValue = function(array, value) {
	if( Object.prototype.toString.call( array ) !== '[object Array]' ) {
		console.error("not an array!");
		return;
	}
	for (var i = array.length; i--;) {
		if(array[i] === value) {
			array.splice(i, 1);
		}
	}
};