/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Context, createContext, useContext } from 'react';
import { DetailedItem, PublishPackage } from '../../../models';
import ContentType from '../../../models/ContentType';
import ApiResponse from '../../../models/ApiResponse';
import { FormsEngineProps } from '../FormsEngine';
import LookupTable from '../../../models/LookupTable';
import type { Atom, PrimitiveAtom } from 'jotai';
import { FieldValidityState } from './validators';
import { Subject } from 'rxjs';
import { AtomWithStorage } from '../types';

export type FormsEngineSourceMap = LookupTable<string>;

// Provides an API global to the form(s) to manage & operate the forms stack
export interface FormsEngineGlobalApiContextProps {
	updateProps(stackIndex: number, formProps: FormsEngineProps): void;
	setStateCache(stackIndex: number, state: FormsEngineCachedStackedFormState): void;
	pushForm(formProps: FormsEngineProps): void;
	popForm(): void;
}

// Provides an API of operations that concern the state of the form values
export interface FormsEngineFormApiContextProps {
	rollback(): void;
	rollbackField(fieldId: string): void;
	setValuesCheckpoint(values: LookupTable<unknown>): void;
}

export interface FormRequirementsResponse
	extends Pick<
			FormsEngineItemMetaContextProps,
			'sourceMap' | 'pathInSite' | 'contentType' | 'contentObject' | 'contentXml'
		>,
		FormsEngineEditContextProps {
	item: DetailedItem;
	contentObject: LookupTable<unknown>;
}

// Contains the information related to the form's content item
export interface FormsEngineItemMetaContextProps {
	id: string;
	path: string;
	sourceMap: FormsEngineSourceMap;
	pathInSite: string;
	contentType: ContentType;
	contentObject: LookupTable<unknown>; // The raw deserialised XML content document.
	contentXml: string; // The raw XML content document.
}

// Contains information related to lock status and whether packages are affected by editing the content item
export interface FormsEngineEditContextProps {
	locked: boolean;
	lockError: ApiResponse;
	affectedPackages?: PublishPackage[];
}

// Contains the various state atoms of a form
export interface FormsEngineAtoms {
	isSubmitting: PrimitiveAtom<boolean>;
	hasPendingChanges: PrimitiveAtom<boolean>;
	readonly: Atom<boolean>;
	lockResult: PrimitiveAtom<FormsEngineEditContextProps>;
	valueByFieldId: LookupTable<PrimitiveAtom<unknown>>;
	validationByFieldId: LookupTable<Atom<FieldValidityState>>;
	versionComment: PrimitiveAtom<string>;
	collapseToC: AtomWithStorage; // Note: `collapseToC` is an atomWithStorage
	useCollapsedToC: Atom<boolean>;
	isLargeContainer: PrimitiveAtom<boolean>;
	expandedStateBySectionId: LookupTable<PrimitiveAtom<boolean>>;
	tableOfContentsDrawerOpen: PrimitiveAtom<boolean>;
	closeAfterSave: AtomWithStorage;
}

// Contains information to restore the state of a form when it comes back to being the active form on the stack
export interface FormsEngineCachedStackedFormState {
	collapsedToC: boolean;
	previousScrollTopPosition: number;
	// TODO: Having moved this to Jotai, it might not be required to be here.
	//  Because everything is on the same jotai store, two content types with the same section name could collide.
	sectionExpandedState: LookupTable<boolean>;
}

// Context global/available to the entire forms stack. Once initialised, it won't change (won't cause re-renders)
export interface StableGlobalContextProps {
	formsStackData: StableFormContextProps[];
	api: FormsEngineGlobalApiContextProps;
}

// Consolidated base data store for the form instance (single form/item). Once initialised, it won't change (won't cause re-renders).
export interface StableFormContextProps {
	atoms: FormsEngineAtoms;
	changedFieldIds: Set<string>;
	fieldUpdates$: Subject<string>;
	itemMeta: FormsEngineItemMetaContextProps; // TODO: There's a dedicated ItemMetaContext; why have here too?
	originalValues: LookupTable<unknown>;
	props: FormsEngineProps;
	state: FormsEngineCachedStackedFormState;
}

export const FormsEngineFormContextApi = createContext<FormsEngineFormApiContextProps>(undefined);
FormsEngineFormContextApi.displayName = 'FormsEngineFormContextApi';

// Single instance context, shared between all forms of a root
export const StableGlobalContext = createContext<StableGlobalContextProps>(undefined);
StableGlobalContext.displayName = 'StableGlobalContext';

// Each form (e.g. root form and stacked child form) has one
export const StableFormContext = createContext<StableFormContextProps>(undefined);
StableFormContext.displayName = 'StableFormContext';

export const ItemContext = createContext<DetailedItem>(undefined);
ItemContext.displayName = 'ItemContext';

export const ItemMetaContext = createContext<FormsEngineItemMetaContextProps>(undefined);
ItemMetaContext.displayName = 'ItemMetaContext';

function createUseContextHook<T>(name: string, context: Context<T>): () => T;
function createUseContextHook<T, K extends keyof T>(
	name: string,
	context: Context<T>,
	selector: (instance: T) => T[K]
): () => T[K];
function createUseContextHook<T, K extends keyof T>(
	name: string,
	context: Context<T>,
	selector?: (instance: T) => T[K]
): () => T | T[K] {
	const contextName = context.displayName ?? name.replace('use', '');
	return () => {
		const instance = useContext(context);
		if (instance === undefined) {
			throw new Error(`${name} must be used within a ${contextName}`);
		}
		return selector?.(instance) ?? instance;
	};
}

export const useFormApiContext = createUseContextHook('useFormApiContext', FormsEngineFormContextApi);

export const useStableGlobalContext = createUseContextHook('useStableGlobalContext', StableGlobalContext);

export const useStableGlobalApiContext = createUseContextHook<StableGlobalContextProps, 'api'>(
	'useStableGlobalApiContext',
	StableGlobalContext,
	(instance) => instance.api
);

export const useStableFormContext = createUseContextHook('useStableFormContext', StableFormContext);

export const useItemContext = createUseContextHook('useItemContext', ItemContext);

export const useItemMetaContext = createUseContextHook('useItemMetaContext', ItemMetaContext);
