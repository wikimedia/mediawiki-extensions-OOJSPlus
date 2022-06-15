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

OOJSPlus.ui.data.sorter.Sorter.prototype.sort = function( data, field ) {
	return data.sort( function( a, b ) {
		if ( this.direction === 'ASC' ) {
			return a[field].localeCompare( b[field], undefined, { ignorePunctuation: true } );
		}
		if ( this.direction === 'DESC' ) {
			return b[field].localeCompare( a[field], undefined, { ignorePunctuation: true } );
		}
		return 0;
	}.bind( this ) );
};
