<?php

namespace OOJSPlus\Api;

use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiQuery;
use MediaWiki\Api\ApiQueryBase;
use MediaWiki\Api\ApiQueryBlockInfoTrait;
use MWStake\MediaWiki\Component\Utils\Utility\GroupHelper;
use MWStake\MediaWiki\Component\Utils\UtilityFactory;
use Wikimedia\ParamValidator\ParamValidator;

class ApiQueryAllGroups extends ApiQueryBase {
	use ApiQueryBlockInfoTrait;

	/** @var GroupHelper */
	private $groupHelper;

	/**
	 * @param ApiQuery $query
	 * @param string $moduleName
	 * @param UtilityFactory $utilityFactory
	 */
	public function __construct(
		ApiQuery $query, $moduleName, UtilityFactory $utilityFactory
	) {
		parent::__construct( $query, $moduleName, 'ag' );
		$this->groupHelper = $utilityFactory->getGroupHelper();
	}

	/**
	 * @inheritDoc
	 */
	public function execute() {
		$params = $this->extractRequestParams();
		// Returns list of filtered groups
		$allGroups = $this->prefixSearch(
			$this->groupHelper->getAvailableGroups(), $params
		);
		$processed = $this->processProps( $allGroups, $params['prop'] );
		$processed = $this->fullSearch( $processed, $params['contains'] );
		$dir = $params['dir'];
		usort( $processed, static function ( $a, $b ) use ( $dir ) {
			$a = mb_strtolower( $a['name'] );
			$b = mb_strtolower( $b['name'] );
			if ( $a == $b ) {
				return 0;
			}
			if ( $dir === 'descending' ) {
				return ( $a < $b ) ? 1 : -1;
			}

			return ( $a < $b ) ? -1 : 1;
		} );

		$result = $this->getResult();
		foreach ( $processed as $item ) {
			$result->addValue( [ 'query', $this->getModuleName() ], null, $item );
		}

		$result->addIndexedTagName( [ 'query', $this->getModuleName() ], 'g' );
	}

	/**
	 * @param int $flags
	 * @return array
	 */
	public function getAllowedParams( $flags = 0 ) {
		return [
			'prefix' => null,
			'contains' => null,
			'dir' => [
				ParamValidator::PARAM_DEFAULT => 'ascending',
				ParamValidator::PARAM_TYPE => [
					'ascending',
					'descending',
				],
			],
			'prop' => [
				ParamValidator::PARAM_ISMULTI => true,
				ParamValidator::PARAM_TYPE => [
					'displaytext',
				],
				ApiBase::PARAM_HELP_MSG_PER_VALUE => [],
			],
		];
	}

	/**
	 * @return string[]
	 */
	protected function getExamplesMessages() {
		return [
			'action=query&list=allgroups&agprefix=s'
			=> 'apihelp-query+allgroups-example',
		];
	}

	/**
	 * @param array $allGroups
	 * @param array $params
	 * @return array
	 */
	private function prefixSearch( array $allGroups, array $params ) {
		if ( !$params['prefix'] ) {
			return $allGroups;
		}

		$prefix = mb_strtolower( $params['prefix'] );
		return array_filter( $allGroups, static function ( $group ) use ( $prefix ) {
			return strpos( mb_strtolower( $group ), $prefix ) === 0;
		} );
	}

	/**
	 * @param array $allGroups
	 * @param string|null $search
	 * @return array
	 */
	private function fullSearch( array $allGroups, $search ) {
		if ( $search === null || trim( $search ) === '' ) {
			return $allGroups;
		}

		$search = mb_strtolower( $search );
		return array_filter( $allGroups, static function ( $group ) use ( $search ) {
			$displayText = isset( $group['displaytext'] ) ? "{$group['displaytext']}" : '';
			$haystack = "{$group['name']} $displayText";
			return strpos( mb_strtolower( $haystack ), $search ) !== false;
		} );
	}

	/**
	 * @param array $groups
	 * @param array|null $props
	 * @return array
	 */
	private function processProps( array $groups, $props ) {
		if ( !$props ) {
			$props = [];
		}
		$props = array_flip( $props );
		$full = [];
		foreach ( $groups as $group ) {
			$values = [
				'name' => $group,
			];
			if ( isset( $props['displaytext'] ) ) {
				$displaytext = $group;
				$msg = $this->msg( "group-$group" );
				if ( $msg->exists() ) {
					if ( $msg->plain() === $group ) {
						$displaytext = $msg->plain();
					} else {
						$displaytext = $msg->plain() . " ($group)";
					}
				}
				$values['displaytext'] = $displaytext;
			}
			$full[] = $values;
		}

		return $full;
	}
}
