OOJSPlus.ui.data.sorter.Sorter = function ( cfg ) {
	cfg = cfg || {};
	this.direction = cfg.dir || cfg.direction || null;
};

OO.initClass( OOJSPlus.ui.data.sorter.Sorter );

OOJSPlus.ui.data.sorter.Sorter.prototype.setDirection = function ( dir ) {
	this.direction = dir;
};

OOJSPlus.ui.data.sorter.Sorter.prototype.getValue = function () {
	return {
		direction: this.direction
	};
};

OOJSPlus.ui.data.sorter.Sorter.prototype.sort = function ( data, field ) {
	return data.sort( ( a, b ) => {
		if ( typeof a[ field ] === 'number' && typeof b[ field ] === 'number' ) {
			return this.direction === 'ASC' ? a[ field ] - b[ field ] : b[ field ] - a[ field ];
		}
		if ( this.direction === 'ASC' ) {
			return a[ field ].localeCompare( b[ field ], undefined, { ignorePunctuation: true } );
		}
		if ( this.direction === 'DESC' ) {
			return b[ field ].localeCompare( a[ field ], undefined, { ignorePunctuation: true } );
		}
		return 0;
	} );
};
