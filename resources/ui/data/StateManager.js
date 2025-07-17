OOJSPlus.ui.data.StateManager = function( cfg ) {

};

OO.initClass( OOJSPlus.ui.data.StateManager );

OOJSPlus.ui.data.StateManager.prototype.getState = function( id ) {
	if ( !this.states ) {
		this.states = {};
	}
	if ( this.states.hasOwnProperty( id ) ) {
		return this.states[ id ];
	}
	this.states[id] = this.load( id );
	return this.states[id] || {};
};

OOJSPlus.ui.data.StateManager.prototype.setState = function( id, state ) {
	if ( !this.states ) {
		this.states = {};
	}
	this.states[ id ] = state;
	this.store( id, state );
};

OOJSPlus.ui.data.StateManager.prototype.load = function( id ) {
	const key = 'oojsplus-state-' + id;
	const state = localStorage.getItem( key );
	if ( state ) {
		try {
			return JSON.parse( state );
		} catch ( e ) {
			console.error( 'Failed to parse state for id:', id, e );
		}
	}
	return {};
};

OOJSPlus.ui.data.StateManager.prototype.store = function( id, state ) {
	const key = 'oojsplus-state-' + id;
	localStorage.setItem( key, JSON.stringify( state ) );
};

OOJSPlus.ui.data.StateManager.prototype.clear = function( id ) {
	const key = 'oojsplus-state-' + id;
	localStorage.removeItem( key );
	if ( this.states && this.states.hasOwnProperty( id ) ) {
		delete this.states[ id ];
	}
};
