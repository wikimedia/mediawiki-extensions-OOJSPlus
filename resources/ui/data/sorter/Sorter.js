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
	if ( this.direction !== 'ASC' && this.direction !== 'DESC' ) {
		return data;
	}
	const factor = this.direction === 'ASC' ? 1 : -1;
	return data.sort( ( a, b ) => factor * this.compare( a[ field ], b[ field ] ) );
};

/**
 * @param {any} a
 * @param {any} b
 * @return {number}
 */
OOJSPlus.ui.data.sorter.Sorter.prototype.compare = function ( a, b ) {
	const numA = this.toNumber( a );
	const numB = this.toNumber( b );
	if ( numA !== null && numB !== null ) {
		return numA - numB;
	}
	a = a === null || a === undefined ? '' : String( a );
	b = b === null || b === undefined ? '' : String( b );
	// `numeric` gives natural order for mixed values, e.g. "Item 2" before "Item 10"
	return a.localeCompare( b, undefined, { ignorePunctuation: true, numeric: true } );
};

/**
 * Get numeric value of plain numbers or numeric strings, e.g. "42", "-1.5" or "3,14"
 *
 * @param {any} value
 * @return {number|null}
 */
OOJSPlus.ui.data.sorter.Sorter.prototype.toNumber = function ( value ) {
	if ( typeof value === 'number' ) {
		return isFinite( value ) ? value : null;
	}
	if ( typeof value !== 'string' ) {
		return null;
	}
	const trimmed = value.trim();
	if ( !/^[-+]?(\d+([.,]\d+)?|[.,]\d+)$/.test( trimmed ) ) {
		return null;
	}
	return parseFloat( trimmed.replace( ',', '.' ) );
};
