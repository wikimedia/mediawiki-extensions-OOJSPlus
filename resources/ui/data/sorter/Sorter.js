OOJSPlus.ui.data.sorter.Sorter = function ( cfg ) {
	cfg = cfg || {};
	this.direction = cfg.dir || cfg.direction || null;
};

OO.initClass( OOJSPlus.ui.data.sorter.Sorter );

OOJSPlus.ui.data.sorter.Sorter.prototype.setDirection = function( dir ) {
	this.direction = dir;
};

OOJSPlus.ui.data.sorter.Sorter.prototype.getValue = function() {
	return {
		direction: this.direction
	};
};

OOJSPlus.ui.data.sorter.Sorter.prototype.sort = function( data ) {
	return data.sort( function( a, b ) {
		return a.localeCompare( b, undefined, { ignorePunctuation: true } );
	} );
};
