( function () {

	OOJSPlus.ui.widget.UserGroupMultiselectWidget = function ( config ) {
		config = config || {};
		config.menu = config.menu || {};
		config.menu.filterFromInput = false;
		config.allowArbitrary = false;

		OOJSPlus.ui.widget.UserGroupMultiselectWidget.parent.call( this, Object.assign( {}, config, {} ) );
		OO.ui.mixin.PendingElement.call( this, Object.assign( {}, config, { $pending: this.$handle } ) );

		this.api = config.api || new mw.Api();
		this.groups = config.groups || null;
		this.excludeGroups = config.excludeGroups || null;

		this.showUserImage = typeof config.showUserImage === 'boolean' ? config.showUserImage : true;

		if ( !config.hasOwnProperty( 'groupTypes' ) && config.hasOwnProperty( 'groupType' ) ) {
			// B/C
			config.groupTypes = [ config.groupType ];
		}
		this.groupTypes = config.groupTypes || [];
		this.userSectionLabel = mw.msg( 'oojsplus-usergroupmultiselect-user-section-label' );
		this.groupSectionLabel = mw.msg( 'oojsplus-usergroupmultiselect-group-section-label' );
		this.userLookupRequest = null;
		this.groupLookupRequest = null;
		this.previousTagValue = this.getInternalValue().join( '\n' );

		if ( 'name' in config ) {
			// Use this instead of <input type="hidden">, because hidden inputs do not have separate
			// 'value' and 'defaultValue' properties. The script on Special:Preferences
			// (mw.special.preferences.confirmClose) checks this property to see if a field was changed.
			this.$hiddenInput = $( '<textarea>' )
				.addClass( 'oo-ui-element-hidden' )
				.attr( 'name', config.name )
				.appendTo( this.$element );
			this.updateHiddenInput();
			this.$hiddenInput.prop( 'defaultValue', JSON.stringify( this.getValue() ) );
		}

		this.connect( this, {
			change: 'onMultiselectChange'
		} );
		this.menu.filterFromInput = false;
	};

	OO.inheritClass( OOJSPlus.ui.widget.UserGroupMultiselectWidget, OO.ui.MenuTagMultiselectWidget );
	OO.mixinClass( OOJSPlus.ui.widget.UserGroupMultiselectWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.static.tagName = 'div';

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.serializeValue = function ( type, key ) {
		return type + ':' + key;
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.deserializeValue = function ( value ) {
		const parts = ( value || '' ).split( ':' );
		if ( parts.length < 2 ) {
			return null;
		}

		const type = parts.shift();
		if ( type !== 'user' && type !== 'group' ) {
			return null;
		}

		return {
			type: type,
			key: parts.join( ':' )
		};
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.getInternalValue = function () {
		return OOJSPlus.ui.widget.UserGroupMultiselectWidget.parent.prototype.getValue.call( this );
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.getValue = function () {
		return this.getInternalValue().map(
			this.deserializeValue.bind( this )
		).filter( ( value ) => value !== null );
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.getTagItemFromData = function ( data ) {
		if ( this.findItemFromData instanceof Function ) {
			return this.findItemFromData( data );
		}
		if ( this.getItems instanceof Function ) {
			const items = this.getItems();
			for ( let i = 0; i < items.length; i++ ) {
				if ( items[ i ].getData && items[ i ].getData() === data ) {
					return items[ i ];
				}
			}
		}
		return null;
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.normalizeValueItem = function ( item ) {
		if ( !item || typeof item !== 'object' ) {
			return null;
		}
		if ( item.type && item.key && ( item.type === 'user' || item.type === 'group' ) ) {
			return { type: item.type, key: item.key };
		}
		if ( item.user_name ) {
			return { type: 'user', key: item.user_name };
		}
		if ( item.group_name ) {
			return { type: 'group', key: item.group_name };
		}
		return null;
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.getUserData = function ( username ) {
		return mws.commonwebapis.user.getByUsername( username ).then(
			( user ) => {
				if ( !user || $.isEmptyObject( user ) ) {
					return { user_name: username };
				}
				return user;
			},
			() => ( { user_name: username } )
		);
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.getGroupData = function ( groupName ) {
		return mws.commonwebapis.group.getByGroupName( groupName ).then(
			( group ) => {
				if ( !group || $.isEmptyObject( group ) ) {
					return { group_name: groupName, displayname: groupName };
				}
				return group;
			},
			() => ( { group_name: groupName, displayname: groupName } )
		);
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.decorateUserTag = function ( data, user ) {
		const item = this.getTagItemFromData( data );
		if ( !item || !item.$label ) {
			return;
		}

		const userWidget = new OOJSPlus.ui.widget.UserWidget( {
			user_name: user.user_name,
			showImage: this.showUserImage,
			showLink: false,
			showProfileOnHover: false
		} );
		item.$label.empty().append( userWidget.$element );
		item.$element.addClass( 'oojsplus-usergroupmultiselect-user-tag' );
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.decorateGroupTag = function ( data ) {
		const item = this.getTagItemFromData( data );
		const parsedValue = this.deserializeValue( data );
		if ( !item || !item.$element || !item.$label || !parsedValue ) {
			return;
		}
		const groupWidget = new OOJSPlus.ui.widget.GroupWidget( {
			group_name: parsedValue.key,
			displayname: item.getLabel(),
			showRawGroupName: false
		} );
		item.$label.empty().append( groupWidget.$element );
		item.$element.addClass( 'oojsplus-usergroupmultiselect-group-tag' );
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.setValue = function ( value ) {
		if ( !value ) {
			return OOJSPlus.ui.widget.UserGroupMultiselectWidget.parent.prototype.setValue.call( this, [] );
		}

		value = Array.isArray( value ) ? value : [ value ];
		const normalizedValue = value.map( this.normalizeValueItem.bind( this ) )
			.filter( ( item ) => item !== null );

		this.clearItems();
		if ( normalizedValue.length === 0 ) {
			this.emit( 'change', this.getValue() );
			return;
		}

		this.setDisabled( true );
		this.pushPending();

		const dataPromises = normalizedValue.map( ( item ) => {
			if ( item.type === 'user' ) {
				return this.getUserData( item.key ).then( ( user ) => ( {
					type: 'user',
					key: item.key,
					label: user.user_real_name || user.user_name,
					user: user
				} ) );
			}
			return this.getGroupData( item.key ).then( ( group ) => ( {
				type: 'group',
				key: item.key,
				label: group.displayname || group.group_name
			} ) );
		} );

		Promise.all( dataPromises ).then( ( resolvedValue ) => {
			const originalAllowArbitrary = this.allowArbitrary;
			this.allowArbitrary = true;

			resolvedValue.forEach( ( item ) => {
				const data = this.serializeValue( item.type, item.key );
				this.addTag( data, item.label || item.key );
				if ( item.type === 'user' ) {
					this.decorateUserTag( data, item.user );
				} else {
					this.decorateGroupTag( data );
				}
			} );

			this.allowArbitrary = originalAllowArbitrary;
			this.setDisabled( false );
			this.popPending();
			this.emit( 'change', this.getValue() );
		} ).catch( () => {
			this.setDisabled( false );
			this.popPending();
			this.emit( 'change', this.getValue() );
		} );

		return;
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.onInputFocus = function () {
		this.updateMenuItems();
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.updateMenuItems = function () {
		const inputValue = this.input.getValue();

		if ( inputValue === this.inputValue ) {
			return;
		}
		this.inputValue = inputValue;

		if ( this.userLookupRequest && this.userLookupRequest.abort ) {
			this.userLookupRequest.abort();
		}
		if ( this.groupLookupRequest && this.groupLookupRequest.abort ) {
			this.groupLookupRequest.abort();
		}

		if ( inputValue.length === 0 ) {
			this.menu.clearItems();
			this.menu.toggle( false );
			return;
		}

		const selected = this.getInternalValue(),
			userFilters = [ {
				type: 'boolean',
				value: true,
				operator: '==',
				property: 'enabled'
			} ],
			groupFilters = [];

		if ( this.excludeGroups ) {
			userFilters.push( {
				type: 'list',
				value: this.excludeGroups,
				operator: 'nct',
				property: 'groups'
			} );
		}
		if ( this.groups ) {
			userFilters.push( {
				type: 'list',
				value: this.groups,
				operator: 'in',
				property: 'groups'
			} );
		}
		if ( this.groupTypes.length > 0 ) {
			groupFilters.push( {
				type: 'list',
				property: 'group_type',
				value: this.groupTypes,
				operator: 'in'
			} );
		}

		this.pushPending();

		this.userLookupRequest = mws.commonwebapis.user.query( {
			query: inputValue,
			filter: JSON.stringify( userFilters ),
			limit: inputValue !== '' ? 10 : 5
		} );
		this.groupLookupRequest = mws.commonwebapis.group.query( {
			query: inputValue,
			filter: JSON.stringify( groupFilters )
		} );

		const userLookupDfd = $.Deferred(),
			groupLookupDfd = $.Deferred();

		this.userLookupRequest.done( ( users ) => userLookupDfd.resolve( users || [] ) )
			.fail( () => userLookupDfd.resolve( [] ) );
		this.groupLookupRequest.done( ( groups ) => groupLookupDfd.resolve( groups || [] ) )
			.fail( () => groupLookupDfd.resolve( [] ) );

		$.when( userLookupDfd.promise(), groupLookupDfd.promise() ).done( ( users, groups ) => {
			if ( inputValue !== this.inputValue ) {
				this.popPending();
				return;
			}

			const items = [],
				userItems = users.map( ( user ) => {
					const data = this.serializeValue( 'user', user.user_name );
					if ( selected.indexOf( data ) === -1 ) {
						const item = new OOJSPlus.ui.widget.UserMenuOptionWidget( user );
						item.data = data;
						item.getData = function () {
							return this.data;
						};
						item.getLabel = function () {
							return this.getDisplayName();
						};
						item.setElementId( user.user_name );
						return item;
					}
					return undefined;
				} ).filter( ( item ) => item !== undefined ),
				groupItems = groups.map( ( group ) => {
					const data = this.serializeValue( 'group', group.group_name );
					if ( selected.indexOf( data ) === -1 ) {
						return new OO.ui.MenuOptionWidget( {
							data: data,
							label: group.displayname || group.group_name,
							id: this.serializeValue( 'group', group.group_name )
						} );
					}
					return undefined;
				} ).filter( ( item ) => item !== undefined );

			if ( userItems.length ) {
				items.push( new OO.ui.MenuSectionOptionWidget( {
					label: this.userSectionLabel
				} ) );
				items.push.apply( items, userItems );
			}

			if ( groupItems.length ) {
				items.push( new OO.ui.MenuSectionOptionWidget( {
					label: this.groupSectionLabel
				} ) );
				items.push.apply( items, groupItems );
			}

			this.menu.clearItems();
			this.menu.addItems( items );

			const firstSelectableItem = items.find(
				( item ) => !( item instanceof OO.ui.MenuSectionOptionWidget )
			);
			if ( firstSelectableItem ) {
				this.menu.$focusOwner.attr( 'aria-activedescendant', firstSelectableItem.$element.attr( 'id' ) );
			}

			this.menu.toggle( items.length > 0 );
			this.popPending();
		} );
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.onInputChange = function () {
		OOJSPlus.ui.widget.UserGroupMultiselectWidget.parent.prototype.onInputChange.apply( this, arguments );
		this.updateMenuItems();
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.updateHiddenInput = function () {
		if ( '$hiddenInput' in this ) {
			this.$hiddenInput.val( JSON.stringify( this.getValue() ) );
			this.$hiddenInput.trigger( 'change' );
		}
	};

	OOJSPlus.ui.widget.UserGroupMultiselectWidget.prototype.onMultiselectChange = function () {
		this.updateHiddenInput();
		const currentTagValue = this.getInternalValue().join( '\n' );
		if ( currentTagValue !== this.previousTagValue ) {
			const values = this.getInternalValue();
			for ( let i = 0; i < values.length; i++ ) {
				const value = this.deserializeValue( values[ i ] );
				if ( value && value.type === 'user' ) {
					this.decorateUserTag( values[ i ], { user_name: value.key } );
				} else if ( value && value.type === 'group' ) {
					this.decorateGroupTag( values[ i ] );
				}
			}
			this.input.setValue( '' );
		}
		this.previousTagValue = currentTagValue;
	};

}() );
