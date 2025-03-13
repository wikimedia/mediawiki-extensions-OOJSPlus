( function () {
	OOJSPlus.IDGenerator = function ( config ) {
		this.id = config.id || false;
		this.length = config.length || 16;
		this.counter = 1;
	};

	OO.initClass( OOJSPlus.IDGenerator );

	OOJSPlus.IDGenerator.prototype.generate = function () {
		let id = '';

		if ( this.id ) {
			id = this.id;
			id += '-' + this.counter;
			this.counter++;
		} else {
			const source = new Uint8Array( this.length );
			const crypt = ( window.crypto || window.msCrypto ).getRandomValues( source );
			for ( let index = 0; index < this.length; index++ ) {
				id += crypt[ index ].toString( this.length );
			}
		}

		return id;
	};
}() );
