<?php

namespace OOJSPlus;

class Extension {
	public static function callback() {
		mwsInitComponents();
		$GLOBALS['mwsgFormEngineElementModules'][] = 'ext.oOJSPlus.formelements';
	}
}
