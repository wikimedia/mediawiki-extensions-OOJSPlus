( function ( mw, $ ) {
	OOJSPlus.ui.dialog.BookletDialog = function( config ) {
		OOJSPlus.ui.dialog.BookletDialog.super.call( this, config );
		// Array of OOJSPlus.ui.booklet.DialogBookletPage or a function
		// that returns a promise which resolves with array of OOJSPlus.ui.booklet.DialogBookletPage
		this.pages = config.pages || [];
		this.mode = null;
		this.abilities = {};
	};

	OO.inheritClass( OOJSPlus.ui.dialog.BookletDialog, OOJSPlus.ui.dialog.FormDialog );

	OOJSPlus.ui.dialog.BookletDialog.static.name = 'booklet-dialog';
	OOJSPlus.ui.dialog.BookletDialog.static.title = '';

	OOJSPlus.ui.dialog.BookletDialog.prototype.getSetupProcess = function( data ) {
		return OOJSPlus.ui.dialog.BookletDialog.parent.prototype.getSetupProcess.call( this, data )
		.next( function() {
			if ( !this.initialized ) {
				// Prevent flickering, disable all actions before init is done
				this.actions.setMode( 'INVALID' );
			}
			if ( this.abilities ) {
				this.actions.setAbilities( this.abilities );
			}
			if ( this.mode ) {
				this.actions.setMode( this.mode );
			}
		}, this );
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.initialize = function () {
		// Different class is intentional
		OOJSPlus.ui.dialog.FormDialog.parent.prototype.initialize.call( this );

		if ( typeof this.pages === 'function' ) {
			this.pushPending();
			this.title.setLabel( 'Loading ...' );
			this.pages().done( function( pages ) {
				this.setBooklet( pages );
				this.popPending();
			}.bind( this ) ).fail( function ( e ) {
				this.loadingError( e );
			}.bind( this ) );
		} else {
			this.setBooklet( this.pages );
			this.initialized = true;
		}
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.setBooklet = function ( pages ) {
		this.pages = [];
		for ( var i = 0; i < pages.length; i++ ) {
			if ( pages[i] instanceof OOJSPlus.ui.booklet.DialogBookletPage ) {
				pages[i].setDialog( this );
				this.pages.push( pages[i] );
			}
		}
		this.booklet = new OOJSPlus.ui.booklet.DialogBooklet( {
			outlined: false,
			showMenu: false,
			expanded: true,
			pages: this.pages
		} );

		this.$body.append( this.booklet.$element );

		this.initialized = true;
		var actions = this._compileActions( this.pages );
		this.actions.add( this.getActionWidgets( actions ) );

		this.selectFirstPage();
		this.popPending();
		this.updateSize();
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.selectFirstPage = function () {
		var first = this.pages.length > 0 ? this.pages[0] : null;
		if ( first ) {
			this.switchPanel( first.getName() );
		}
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.switchPanel = function ( name, data ) {
		var page = this.booklet.getPage( name );
		if ( !page ) {
			return;
		}

		this.currentPage = page;
		this.currentPage.setData( data || {} );
		this.booklet.setPage( name );
		this.title.setLabel( page.getTitle() );
		this.setSize( page.getSize() );
		this.actions.setMode( name );
		this.mode = name;
		this.abilities = this.mergeAbilities( page.getAbilities() );
		this.actions.setAbilities( this.abilities );

		this.updateSize();
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.mergeAbilities = function ( pageAbilities ) {
		var allFalse = {};
		for ( var i = 0; i < this.actions.length; i++ ) {
			allFalse[this.actions[i].getAction()] = false;
		}

		return $.extend( {}, allFalse, pageAbilities );
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype._compileActions = function( pages ) {
		if ( !this.initialized ) {
			return [];
		}
		var actions,
			pageActions,
			keys = [],
			modeActions = {};

		for ( var i = 0; i < pages.length; i ++ ) {
			pageActions = pages[i].getActionKeys();
			for ( var ii = 0; ii < pageActions.length; ii++ ) {
				if ( !modeActions.hasOwnProperty( pageActions[ii] ) ) {
					modeActions[pageActions[ii]] = [];
				}
				modeActions[pageActions[ii]].push( pages[i].getName() );
				if ( keys.indexOf( pageActions[ii] ) !== -1 ) {
					continue;
				}
				keys.push( pageActions[ii] );
			}
		}

		actions = OOJSPlus.ui.dialog.BookletDialog.parent.prototype._compileActions.call( this, keys );
		for ( var j = 0; j < actions.length; j++ ) {
			if ( modeActions.hasOwnProperty( actions[j].action ) ) {
				actions[j].modes = modeActions[actions[j].action];
			}
		}

		return actions;
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.getActionDefinitions = function() {
		var parentDef = OOJSPlus.ui.dialog.BookletDialog.parent.prototype.getActionDefinitions.call( this );
		if ( !this.pages ) {
			return parentDef;
		}

		for ( var i = 0; i < this.pages.length; i++ ) {
			var pageDef = this.pages[i].getActionDefinitions();
			if ( !pageDef ) {
				continue;
			}
			parentDef = $.extend( {}, true, parentDef, pageDef );
		}

		return parentDef;
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.getActionProcess = function ( action ) {
		// Different class name is intentional
		return OOJSPlus.ui.dialog.FormDialog.parent.prototype.getActionProcess.call( this, action ).next(
			function() {
				var page = this.booklet.getCurrentPage(),
					dfd = $.Deferred();
				this.pushPending();
				page.onAction( action ).done( function( response ) {
					if ( response.action === 'switchPanel' ) {
						this.switchPanel( response.page, response.data || {} );
					}
					if ( response.action === 'close' ) {
						this.close( response.data || {} );
						return;
					}
					this.popPending();
					dfd.resolve();
				}.bind( this ) ).fail( function( error ) {
					this.popPending();
					dfd.reject( new OO.ui.Error( error, {
						recoverable: false
					} ) );
				}.bind( this ) );

				return dfd.promise();
			}, this
		);
	};

	OOJSPlus.ui.dialog.BookletDialog.prototype.loadingError = function ( e ) {
		this.popPending();
		var message = new OO.ui.MessageWidget( {
			label: e.toString(),
			type: 'error'
		} );
		this.$body.append( new OO.ui.PanelLayout( {
			content: [ message ], expanded: false, padded: true
		} ).$element );
		this.updateSize();
	};

} )( mediaWiki, jQuery );
